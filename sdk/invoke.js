/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const FabricClient = require('fabric-client');
const ccpPath = path.resolve(__dirname,'..', 'network', 'connection.json')
const client =new FabricClient();
let envelope_bytes = fs.readFileSync(path.join(__dirname, '..','network/channel-artifacts/channel.tx'));
// have the nodeSDK extract out the config update
var config_update = client.extractChannelConfig(envelope_bytes);
async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.resolve(__dirname,'..', 'network', 'wallet')
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin');
        if (!userExists) {
            console.log('An identity for the user "admin" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        var channel = client.createChannel('mychannel');

        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('taskchaincode');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //const product_data= {'product':{ 'name':'product2', 'color':'red', 'size':'35', 'owner':'neelb', 'prize':'199'}}
      //  await contract.submitTransaction('initProduct',product_data);
       //const transientData = {product: Buffer.from("{\"name\":\"product3\",\"color\":\"yellow\",\"size\":55,\"owner\":\"neelbanker\",\"price\":199}")};
       //console.log(transientData);
      // const result = await contract.createTransaction('initProduct').setTransient(transientData).submit();

       // client.setAdminSigningIdentity('ManufactuterMSP');
      var transient_data = {
        'name': 'product2', 
        'color': 'blue', 
        'size': 8, 
        'owner': 'Joe', 
        'price': 80 
    };
    var data = JSON.stringify(transient_data); // Convert transient data object to JSON string
    data = new Buffer(data).toString('base64'); // convert the JSON string to base64 encoded string
    var product_private = { "product": data };  //Add the encoded data as a value to the marble key expected by the marbles chaincode
    //const tx_id = client.newTransactionID();
    //var tx_id_string = tx_id.getTransactionID();
    var request = {
        chaincodeId: 'product',
       // txId: tx_id,
        fcn: 'initMarble',
        args: [], // all data is transient data
        transientMap: product_private, // private data
    };
    const endorsementResults = await channel.sendTransactionProposal(request);

       console.log('Transaction has been submitted :');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
