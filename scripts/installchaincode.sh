export CHANNEL_NAME=mychannel

echo "Channel name = "$CHANNEL_NAME

echo "==========================================================="
echo "############ Installing Chaincode #########################"
echo "############ For Manufacturer peer0 #######################"
echo "==========================================================="

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
echo $CORE_PEER_MSPCONFIGPATH
export CORE_PEER_ADDRESS=peer0.manufacturer.product.com:7051
echo $CORE_PEER_ADDRESS
export CORE_PEER_LOCALMSPID="ManufacturerMSP"
echo $CORE_PEER_LOCALMSPID
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer0.manufacturer.product.com/tls/ca.crt
echo $CORE_PEER_TLS_ROOTCERT_FILE


echo "==========================================================="
echo "######## Joining channel on Manufacturer peer0 ########"
echo "==========================================================="

peer channel join -b mychannel.block
peer channel list

echo "==========================================================="
echo "####################### Updating Orderer ##################"
echo "==========================================================="
peer channel update -o orderer.product.com:7050 -c $CHANNEL_NAME -f ../channel-artifacts/ManufacturerMSPanchors.tx 


echo "==========================================================="
echo "######## Installing Chaincode on Manufacturer peer0 ########"
echo "==========================================================="
peer chaincode install -n taskcc -v 1.2 -p github.com/chaincode/taskchaincode/go
peer chaincode list --installed

echo "==========================================================="
echo "###### Instantiating Chaincode on Manufacturer peer0 ######"
echo "==========================================================="
export CHANNEL_NAME=mychannel

peer chaincode instantiate -o orderer.product.com:7050 -C $CHANNEL_NAME -channelID $CHANNEL_NAME -n taskcc -v 1.2 -c '{"Args":["init","a", "100", "b","200"]}' -P "OR ('ManufacturerMSP.peer')"
peer chaincode list --instantiated



echo "==========================================================="
echo "######### Querying Chaincode on Manufacturer peer0 ########"
echo "==========================================================="
export CHANNEL_NAME=mychannel

peer chaincode query -C $CHANNEL_NAME -n taskcc -c '{"Args":["query","a"]}'



################################################################################
################### Private Data ############

####### Install Chaincode ####
peer chaincode install -n marblesp -v 1.0 -p github.com/chaincode/taskchaincode/go/

############## export ordererCa #####
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/product.com/orderers/orderer.product.com/msp/tlscacerts/tlsca.product.com-cert.pem
############ instanciate orderer ca ######
peer chaincode instantiate -o orderer.product.com:7050 -C mychannel -n marblesp -v 1.0 -c '{"Args":["init"]}' -P "OR('ManufacturerMSP.member','RetailerMSP.member')" --collections-config  $GOPATH/src/github.com/chaincode/taskchaincode/collections_config.json
#peer chaincode instantiate -o orderer.product.com:7050 -C mychannel -n task -v 1.0 -c '{"Args":["init"]}' -P "OR('ManufacturerMSP.member')" --collections-config  $GOPATH/src/github.com/chaincode/task/task_config.json 

export MARBLE=$(echo -n "{\"name\":\"marble1    \",\"color\":\"blue\",\"size\":35,\"owner\":\"neel\",\"price\":99}" | base64 | tr -d \\n)


export CORE_PEER_ADDRESS=peer0.manufacturer.product.com:7051
export CORE_PEER_LOCALMSPID=ManufacturerMSP
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer0.manufacturer.product.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/users/Admin@manufacturer.product.com/msp
export PEER0_Manufacture_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.product.com/peers/peer0.manufacturer.product.com/tls/ca.crt

###########innvoke chaincode
peer chaincode invoke -o orderer.product.com:7050 -C mychannel -n marblesp -c '{"Args":["initMarble"]}'  --transient "{\"marble\":\"$MARBLE\"}"
#peer chaincode invoke -o orderer.product.com:7050 -C mychannel -n task -c '{"Args":["initProduct1"]}'  --transient "{\"product\":\"$PRODUCT\"}"


############## query chaincode for public data
peer chaincode query -C mychannel -n marblesp -c '{"Args":["readMarble","marble1"]}'


############# query chaincode for private data
peer chaincode query -C mychannel -n marblesp -c '{"Args":["readMarblePrivateDetails","marble1"]}'