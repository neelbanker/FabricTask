/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
//const express = require('express');
//const router = express.Router();
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname,'..', 'network', 'connection.json')
module.exports={
queryChaincode : async (req,res)=> {
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

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        var fcn = req.body.fcn;
        var product = req.body.product;
        const result = await contract.evaluateTransaction(fcn,product);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).send('Transaction has been evalualted :'+result.toString());
    } catch (error) {
        console.error(`Failed : ${error}`);
        res.status(400).send('Failed: '+error);
        process.exit(1);
    }
}
}