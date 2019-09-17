/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const FabricCAServices = require('fabric-ca-client')
const { FileSystemWallet, X509WalletMixin } = require('fabric-network')
const fs = require('fs')
const path = require('path')

console.log('dir', path.resolve(__dirname, '..', '..', 'network', 'connection.json'))
const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json')
const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
const ccp = JSON.parse(ccpJSON)

async function main () {
  try {
    // Create a new CA client for interacting with the CA.
    // const caURL = ccp.certificateAuthorities['ca.cama.example.com'].url
    // const ca = new FabricCAServices(caURL)

    const caInfo = ccp.certificateAuthorities['ca.cama.example.com'];
    const caTLSCACerts = '-----BEGIN CERTIFICATE-----MIICVjCCAf2gAwIBAgIQW0Jj8ds+w8lFJHYUfTaM2jAKBggqhkjOPQQDAjB2MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQY2FtYS5leGFtcGxlLmNvbTEfMB0GA1UEAxMWdGxzY2EuY2FtYS5leGFtcGxlLmNvbTAeFw0xOTA5MTQwODU5MDBaFw0yOTA5MTEwODU5MDBaMHYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBjYW1hLmV4YW1wbGUuY29tMR8wHQYDVQQDExZ0bHNjYS5jYW1hLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEB7vVCkCpKK7opTsw7vBv3Wk6ra6wvylrMu2sX1k0gll1sT28kr0kFff9iZfX9cHulN3U6NxMZCv+FkN+H+L8UaNtMGswDgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCBq9Otefb5Ko0JiRGdC+IDTy6K9V/5gi8KKt10j7G830zAKBggqhkjOPQQDAgNHADBEAiBnNvaaOL50RnQg4fl/s+35F16pV8bdVEAmx33Sel7tQgIgS7PXpvIdrGy2hvtbui4oH5Aglfgy6Rlln1BB4Z9bHbQ=-----END CERTIFICATE-----'
    //const caTLSCACertsPath = path.resolve(__dirname, '..', '..', 'network', caInfo.tlsCACerts.path);
    //const caTLSCACerts = fs.readFileSync(caTLSCACertsPath);
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, '..', '..', 'network', 'wallet')
    const wallet = new FileSystemWallet(walletPath)
    console.log(`Wallet path: ${walletPath}`)

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.exists('admin')
    if (adminExists) {
      console.log('An identity for the admin user "admin" already exists in the wallet')
      return
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' })
    const identity = X509WalletMixin.createIdentity('camaMSP', enrollment.certificate, enrollment.key.toBytes())
    wallet.import('admin', identity)
    console.log('Successfully enrolled admin user "admin" and imported it into the wallet')
  } catch (error) {
    console.error(`Failed to enroll admin user "admin": ${error}`)
    process.exit(1)
  }
}

main()
