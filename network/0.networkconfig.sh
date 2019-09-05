# only generate if they are not there
../bin/cryptogen generate --config=./crypto-config.yaml

export FABRIC_CFG_PATH=$PWD

../bin/configtxgen -profile FourOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block

export CHANNEL_NAME=mychannel  && ../bin/configtxgen -profile FourOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ManufacturerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ManufacturerMSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/RetailerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg RetailerMSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/DistributorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg DistributorMSP
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/AgencyMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AgencyMSP

docker-compose -f docker-compose-cli.yaml up -d

docker exec -it cli bash

# Env for manufacturer peer0
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
CORE_PEER_ADDRESS=peer0.manufacturer.product.com:7051
CORE_PEER_LOCALMSPID="ManufacturerMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer0.manufacturer.product.com/tls/ca.crt
export CHANNEL_NAME=mychannel

peer channel create -o orderer.product.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx 

peer channel join -b mychannel.block
#peer0 chaincode
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/ManufacturerMSPanchors.tx 

peer chaincode install -n taskchaincode -v 1.0 -p github.com/chaincode/taskchaincode/go
peer chaincode instantiate -o orderer.product.com:7050 -C mychannel -n taskchaincode -v 1.0 -c '{"Args":["init"]}' -P "OR('ManufacturerMSP.member','RetailerMSP.member')" --collections-config  $GOPATH/src/github.com/chaincode/taskchaincode/collections_config.json

#Env for manufacturer peer1
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
export CORE_PEER_ADDRESS=peer1.manufacturer.product.com:8051
export CORE_PEER_LOCALMSPID="ManufacturerMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer1.manufacturer.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/ManufacturerMSPanchors.tx 

#env for retailer peer0
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/users/Admin@retailer.product.com/msp
CORE_PEER_ADDRESS=peer0.retailer.product.com:9051
CORE_PEER_LOCALMSPID="RetailerMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/peers/peer0.retailer.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/RetailerMSPanchors.tx 

#env for retailer peer1
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/users/Admin@retailer.product.com/msp
CORE_PEER_ADDRESS=peer1.retailer.product.com:10051
CORE_PEER_LOCALMSPID="RetailerMSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/peers/peer1.retailer.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/RetailerMSPanchors.tx 


# env for distributor peer0
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/users/Admin@distributor.product.com/msp
export CORE_PEER_ADDRESS=peer0.distributor.product.com:11051
export CORE_PEER_LOCALMSPID="DistributorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/peers/peer0.distributor.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/DistributorMSPanchors.tx 

# env for distributor peer1
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/users/Admin@distributor.product.com/msp
export CORE_PEER_ADDRESS=peer1.distributor.product.com:12051
export CORE_PEER_LOCALMSPID="DistributorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/peers/peer1.distributor.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/DistributorMSPanchors.tx 


#env for agency peer0
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/users/Admin@agency.product.com/msp
export CORE_PEER_ADDRESS=peer0.agency.product.com:13051
export CORE_PEER_LOCALMSPID="AgencyMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/peers/peer0.agency.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/AgencyMSPanchors.tx 

#env for agency peer1
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/users/Admin@agency.product.com/msp
export CORE_PEER_ADDRESS=peer1.agency.product.com:14051
export CORE_PEER_LOCALMSPID="AgencyMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/peers/peer1.agency.product.com/tls/ca.crt

peer channel join -b mychannel.block
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/AgencyMSPanchors.tx 


############chaincode install and query
peer chaincode install -n taskchaincode -v 1.0 -p github.com/chaincode/taskchaincode/go

peer chaincode instantiate -o orderer.product.com:7050 -C mychannel -n taskchaincode -v 1.0 -c '{"Args":["init"]}' -P "OR('ManufacturerMSP.member','RetailerMSP.member')" --collections-config  $GOPATH/src/github.com/chaincode/taskchaincode/collections_config.json

export PRODUCT=$(echo -n "{\"name\":\"product1\",\"color\":\"blue\",\"size\":35,\"owner\":\"neel\",\"price\":99}" | base64 | tr -d \\n)

peer chaincode invoke -o orderer.product.com:7050 -C mychannel -n taskchaincode -c '{"Args":["initProduct"]}'  --transient "{\"product\":\"$PRODUCT\"}"

peer chaincode query -C mychannel -n taskchaincode -c '{"Args":["readProduct","product1"]}'

peer chaincode query -C mychannel -n taskchaincode -c '{"Args":["readProductPrivateDetails","product1"]}'
