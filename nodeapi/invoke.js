/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname,'..', 'network', 'connection.json')

module.exports={
    invokeChaincode : async (req,res) =>{
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

        var name=req.body.name;
        var color=req.body.color;
        var quantity=req.body.quantity;
        var owner=req.body.owner;
        var price=req.body.price;
       
        const transientData1 = {
            name: Buffer.from('product2'),
            color: Buffer.from('red'),
            owner: Buffer.from('John'),
            quantity: Buffer.from('85'),
            price: Buffer.from('99')
        };

        //const pro = {product:Buffer.from(transientData)};

        const transientData = {product: Buffer.from("{\"name\":\"product7\",\"color\":\"red\",\"quantity\":55,\"owner\":\"derek\",\"price\":299}")};
        const result = await contract.createTransaction('initProduct').setTransient(transientData).submit();
        console.log('Transaction has been submitted : '+transientData);
        res.status(200).send('Product Added Successfully: '+transientData);
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).send('Error :'+error);
        process.exit(1);
    }
}
}
