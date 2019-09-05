const Stitch = require('./stitch');
const fs = require('fs');

let peerCert = fs.readFileSync('/Users/jonathanblood/Documents/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt');
let ordererCert = fs.readFileSync('/Users/jonathanblood/Documents/fabric-samples/first-network/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt');

const connectionProfile = {
    "name": "TomNetwork",
    "description": "Connection Profile for an IBM Blockchain Platform Network",
    "x-networkId": "c363dab09c3f4d658329f26334eeba93",
    "x-fabricVersion": "v1.0.5",
    "version": "1.0.3",
    "client": {
      "organization": "PeerOrg1",
      "x-organizationName": "TomInc"
    },
    "channels": {
      "mychannel": {
        "orderers": ["orderer.example.com"],
        "peers": {
          "peer0.org1.example.com": {}
        }
      }
    },
    "organizations": {
      "PeerOrg1": {
        "mspid": "Org1MSP",
        "peers": ["peer0.org1.example.com"],
        "certificateAuthorities": []
      }
    },
    "orderers": {
      "orderer.example.com": {
        "url": "grpcs://localhost:7050",
        "grpcOptions": {
          "grpc.http2.keepalive_time": 360,
          "grpc.keepalive_time_ms": 360000,
          "grpc.http2.keepalive_timeout": 180,
          "grpc.keepalive_timeout_ms": 180000
        },
        "tlsCACerts": {
          "pem": Buffer.from(ordererCert).toString()
        },
        "sslTargetNameOverride": 'orderer.example.com'
      }
    },
    "peers": {
      "peer0.org1.example.com": {
        "url": "grpcs://localhost:7051",
        "eventUrl": "grpcs://localhost:7053",
        "grpcOptions": {
          "grpc.http2.keepalive_time": 360,
          "grpc.keepalive_time_ms": 360000,
          "grpc.http2.keepalive_timeout": 180,
          "grpc.keepalive_timeout_ms": 180000
        },
        "tlsCACerts": {
          "pem": Buffer.from(peerCert).toString()
        },
        "sslTargetNameOverride": 'peer0.org1.example.com'
      }
    },
    "certificateAuthorities": {},
    "x-type": "hlfv1"
  };

  let enrollmentProfile = {
    storePath: `/tmp/private_data_transient/store`,
    cryptoStorePath: `/tmp/private_data_transient/cryptostore`
  };

    const mspId = 'Org1MSP';
    let id = 'Admin';

    enrollmentProfile.id = id;
    enrollmentProfile.mspId = mspId;

    const encoded = Buffer.from(process.argv[6]).toString('base64');

  // Start connection
  const stitch = new Stitch();
  stitch.configure(connectionProfile, enrollmentProfile).then(() => {
    console.log('Made stitch');
    stitch.invoke('mychannel', 'marblesp', 'initMarble', [process.argv[2], process.argv[3], process.argv[4], process.argv[5]], {price: encoded}).then(res => {
        console.log('invoked');
        console.log(res)
    }).catch(err => {
        console.log('oops');
        console.log(err);
    })
  });
