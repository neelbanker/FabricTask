/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname,'..', 'network', 'connection.json')

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
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('taskchaincode');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        var transient_data = {
            'name': 'product', 
            'color': 'blue', 
            'size': 8, 
            'owner': 'Joe', 
            'price': 80 
        };
        var data = JSON.stringify(transient_data); // Convert transient data object to JSON string
        data = new Buffer(data).toString('base64'); // convert the JSON string to base64 encoded string
        var product_private = { "product": data };  //Add the encoded data as a value to the marble key expected by the marbles chaincode
       // const tx_id = client.newTransactionID();
        //tx_id_string = tx_id.getTransactionID();
        var request = {
            chaincodeId: 'product',
          //  txId: tx_id,
            fcn: 'initProduct',
            args: [], // all data is transient data
            transientMap: product_private, // private data
        };
        const result = await contract.createTransaction('initProduct')
    .setTransient(request)
    .submit();
        console.log('Transaction has been submitted'+result);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
