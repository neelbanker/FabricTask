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
        //const product_data= {'product':{ 'name':'product2', 'color':'red', 'size':'35', 'owner':'neelb', 'prize':'199'}}
      //  await contract.submitTransaction('initProduct',product_data);
      const transientData = {
        "name": Buffer.from('product2'),
        "color": Buffer.from('red'),
        "owner": Buffer.from('John'),
        "size": Buffer.from('85'),
        "price": Buffer.from('99')
    };
    var data = JSON.stringify(transientData);
    var data = new Buffer(data).toString('base64');
    var product_private = { "product": data };  //Add the encoded data as a value to the marble key expected by the marbles chaincode
      const result = await contract.createTransaction('initProduct').setTransient(product_private).submit();
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
