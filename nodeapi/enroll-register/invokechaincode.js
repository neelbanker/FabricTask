var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');
var fs = require('fs');

//
var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;
var member_user = null;
var channel = fabric_client.newChannel('mychannel');

const collectionsConfigPath = path.resolve(__dirname, '../collections-config.json');
      var request = {
          targets: 'peer0.manufacturer.product.com',
          chaincodeId: chaincodeId,
          chaincodeType: chaincodeType,
          chaincodeVersion: chaincodeVersion,
          fcn: functionName,
          args: args,
          txId: tx_id,
          'collections-config': collectionsConfigPath
      };
var endorsementResults = await channel.sendInstantiateProposal(request, time_out);
// additional code needed to validate endorsementResults and send transaction to commit

const request = {
    chaincodeId: chaincodeId,
    target: peer
};

try {
    const response = await channel.queryCollectionsConfig(request);
    // response contains an array of collection definitions
    return response;
} catch (error) {
    throw error;
}
// Private data sent as transient data: { [key: string]: Buffer }
const transientData = {
    productname: Buffer.from('product1'),
    color: Buffer.from('red'),
    owner: Buffer.from('John'),
    size: Buffer.from('85'),
    price: Buffer.from('99')
};
const result = await contract.createTransaction('initProduct').setTransient(transientData).submit();
// private data
const transient_data = {
    'productname': Buffer.from('product1'), // string <-> byte[]
    'color': Buffer.from('red'), // string <-> byte[]
    'owner': Buffer.from('Neel'), // string <-> byte[]
    'size': Buffer.from('85'), // string <-> byte[]
    'price': Buffer.from('99') // string <-> byte[]
};
const tx_id = client.newTransactionID();
const request = {
    chaincodeId : chaincodeId,
    txId: tx_id,
    fcn: 'initProduct',
    args: [], // all data is transient data
    transientMap: transient_data // private data
};

// results will not contain the private data
const endorsementResults = await channel.sendTransactionProposal(request);
