const FabricCAServices = require('fabric-ca-client')
const { FileSystemWallet, X509WalletMixin } = require('fabric-network')
const fs = require('fs')
const path = require('path')

var request = {
    targets: 'peer0.manufacturer.product.com',
    chaincodePath: 'github.com/chaincode/taskchaincode/go',
    chaincodeId: 'taskchaincode',
    chaincodeVersion: '1.0',
    chaincodeType: 'go'
};

// COLLECTION CONFIGconst 
collectionsConfigPath = path.resolve(__dirname,'..', 'network', 'collection_config.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
// send proposal to endorser
var request = {
    targets : 'peer0.manufacturer.product.com',
    chaincodeId: 'taskchaincode',
    chaincodeType: 'go',
    chaincodeVersion: '1.0',
    fcn: 'initProduct',
    collections_config: path.resolve(__dirname,'..', 'network', 'collection_config.json')
};


// send proposal to endorser
var request = {
    targets: 'peer0.manufacturer.product.com',
    chaincodeId: 'taskchaincode',
    fcn: 'initProduct',
    chainId: 'mychannel',
};
if (transient)
    {
        request.transientMap = {"conversation": transient};
    }

//async createSharedCollection(stub, args)
{
    console.info('============= START : Create Shared collection between org1 and org2 ===========');
    // get the transient map
        let transientMarble = stub.getTransient();
    // convert into buffer
        var buffer = new Buffer(transientMarble.map.conversation.value.toArrayBuffer());
        // from buffer into string
        var JSONString = buffer.toString('utf8');
        // from json string into object
        var JSONObject = JSON.parse(JSONString);
        await stub.putPrivateData('conversationShared', 'convManufacturerRetailer', buffer);
        console.info('============= END : Create Shared Conversation between org1 and org2 ===========');
}
// {
//     'peers': ['peer0.manufacturer.product.com'],
//     'channelName':'mychannel',
//     'chaincodeName':'chat',
//     'chaincodeVersion': 'v0',
//     'chaincodeType': 'node',
//     'fcn':'reateSharedCollection',
//     'orgName': 'Manufacturer',
//     'transientMap': {{'name':'John', 'age':31, 'ity':'New York'}
// 'type':'chat'
// }
//}