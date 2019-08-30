echo "############# Starting Your Network #################################"
echo ""

# echo "######### Generating Crypto Artifacts ###############################"
# ../bin/cryptogen generate --config=./crypto-config.yaml
# echo " \n"

echo "############### Exporting Fabric Configration Path ##################"
export FABRIC_CFG_PATH=$PWD
echo ""
echo "##################### Creating Genesis Block ########################"
../bin/configtxgen -profile FourOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block

echo ""
echo "######### Creating Channel Configration Transaction ##################"
export CHANNEL_NAME=mychannel  && ../../bin/configtxgen -profile FourOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

echo ""
echo "######### Defining Anchor Peers for Manufacturer Org ########################"
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ManufacturerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ManufacturerMSP
echo ""
echo "######### Defining Anchor Peers for Retailer Org ########################"
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/RetailerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg RetailerMSP
echo ""
echo "######### Defining Anchor Peers for Agency Org ########################"
../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/AgencyMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AgencyMSP
echo ""
echo "######### Defining Anchor Peers for Distributor Org ########################"
echo ""
echo ""

../bin/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/DistributorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg DistributorMSP
echo ""

echo ""

echo "########################## Starting Your Network ########################"
#docker-compose -f docker-compose-cli.yaml up -d
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d
#docker-compose -f docker-compose-ca.yaml up -d



echo "####################### Network Has Been Created ########################"
