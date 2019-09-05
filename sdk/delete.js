/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import { FileSystemWallet, Gateway } from 'fabric-network'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ccpPath = resolve(__dirname,'..', 'network', 'connection.json')
console.log('ccpPath', ccpPath)
// eslint-disable-next-line security/detect-non-literal-fs-filename
const ccpJSON = readFileSync(ccpPath, 'utf8')
const ccp = JSON.parse(ccpJSON)

async function invokeFunction (channelName, contractName, functionName, arguements) {
  try {
    // console.log('in invok', arguements)
    // Create a new file system based wallet for managing identities.
    const walletPath = resolve(__dirname, '..', '..', 'network', 'wallet')
    const wallet = new FileSystemWallet(walletPath)
    console.log(`Wallet path: ${walletPath}`)
    // let arrayOfArgs = Object.values(arguements)
    // console.log('arrayOfArgs', typeof arrayOfArgs.join())
    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1')
    if (!userExists) {
      console.log('An identity for the user "user1" does not exist in the wallet')
      console.log('Run the registerUser.js application before retrying')
      return
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway()
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } })

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName)

    // Get the contract from the network.
    const contract = network.getContract(contractName)

    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
    const result = await contract.submitTransaction(functionName, arguements)
    console.log('Transaction has been submitted')
    // console.log('Transaction has been evaluated, result is:', result.toString())
    // Disconnect from the gateway.
    await gateway.disconnect()
    return result.toString()
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`)
    throw Error(error)
  }
}

// eslint-disable-next-line node/exports-style
exports.test = invokeFunction
