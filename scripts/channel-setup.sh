echo "##########  Environment Setup for Manufacturer Org ########################"

echo "########## For Manufacturer peer0 #########"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
export CORE_PEER_ADDRESS=peer0.manufacturer.product.com:7051
export CORE_PEER_LOCALMSPID="ManufacturerMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer0.manufacturer.product.com/tls/ca.crt


echo "################# For Manufacturer peer1 ########################"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
export CORE_PEER_ADDRESS=peer1.manufacturer.product.com:8051
export CORE_PEER_LOCALMSPID="ManufacturerMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer1.manufacturer.product.com/tls/ca.crt


echo "###################### Creating Channel Environment ######################"
export CHANNEL_NAME=mychannel

echo "#################### Creating Orderer ##########################"
peer channel create -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/channel.tx


echo "################### Manufacturer Channel Join #########################"
peer channel join -b mychannel.block


echo "####################### Updating Orderer #############################"
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/ManufacturerMSPanchors.tx 


echo "############### Environment Setup for Retailer Org ################"

echo "########## For Retailer peer0 #########"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/users/Admin@retailer.product.com/msp
export CORE_PEER_ADDRESS=peer0.retailer.product.com:9051
export CORE_PEER_LOCALMSPID="RetailerMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/peers/peer0.retailer.product.com/tls/ca.crt


echo "################# For Retailer peer1 ########################"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/users/Admin@retailer.product.com/msp
export CORE_PEER_ADDRESS=peer1.retailer.product.com:10051
export CORE_PEER_LOCALMSPID="RetailerMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.product.com/peers/peer1.retailer.product.com/tls/ca.crt


echo "################### Retailer Channel Join #########################"
peer channel join -b mychannel.block

echo "####################### Updating Orderer #############################"
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/RetailerMSPanchors.tx 


echo "############### Environment Setup for Distributor Org ################"

echo "########## For Distributor peer0 #########"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/users/Admin@distributor.product.com/msp
export CORE_PEER_ADDRESS=peer0.distributor.product.com:11051
export CORE_PEER_LOCALMSPID="DistributorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/peers/peer0.distributor.product.com/tls/ca.crt


echo "################# For Distributor peer1 ########################"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/users/Admin@distributor.product.com/msp
export CORE_PEER_ADDRESS=peer1.distributor.product.com:12051
export CORE_PEER_LOCALMSPID="DistributorMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/distributor.product.com/peers/peer1.distributor.product.com/tls/ca.crt


echo "################### Distributor Channel Join #########################"
peer channel join -b mychannel.block


echo "####################### Updating Orderer #############################"
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/DistributorMSPanchors.tx 


echo "############### Environment Setup for Agency Org ################"

echo "########## For Agency peer0 #########"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/users/Admin@agency.product.com/msp
export CORE_PEER_ADDRESS=peer0.agency.product.com:13051
export CORE_PEER_LOCALMSPID="AgencyMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/peers/peer0.agency.product.com/tls/ca.crt


echo "################# For Agency peer1 ########################"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/users/Admin@agency.product.com/msp
export CORE_PEER_ADDRESS=peer1.agency.product.com:14051
export CORE_PEER_LOCALMSPID="AgencyMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/agency.product.com/peers/peer1.agency.product.com/tls/ca.crt


echo "################### Agency Channel Join #########################"
peer channel join -b mychannel.block

echo "####################### Updating Orderer #############################"
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/AgencyMSPanchors.tx 
