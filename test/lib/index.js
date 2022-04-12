const protobuf = require("protobufjs")
const { keccak256, pack } = require('@ethersproject/solidity');
const { Wallet } = require('@ethersproject/wallet');

protobuf.common('google/protobuf/descriptor.proto', {});

async function getProtos() {
    const bridge = await protobuf.load("./scripts/lib/bridge.proto")
    const Relay = bridge.lookupType('bridge.Relay')
    return Relay
}

function hex2Bytes(hexString) {
    let hex = hexString.toString();
    const result = [];
    if (hex.substr(0, 2) === '0x') {
      hex = hex.slice(2);
    }
    if (hex.length % 2 === 1) {
      hex = '0' + hex;
    }
    for (let i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substr(i, 2), 16));
    }
    return result;
}

function uint2Bytes(x) {
    return hex2Bytes(x.toString(16));
}

async function calculateSignatures(signers, hash) {
	const sigs = [];
	for (let i = 0; i < signers.length; i++) {
	  const sig = await signers[i].signMessage(hash);
	  // sigs.push(hex2Bytes(sig));
    sigs.push(sig);
	}
	return sigs;
}

module.exports = async function getRelayRequest (sender, receiver, token, amount, srcChainId, dstChainId, srcTransferId, signers, contractAddress) {
    const Relay = await getProtos()
    const relay = {
        sender: hex2Bytes(sender),
        receiver: hex2Bytes(receiver),
        token: hex2Bytes(token),
        amount: uint2Bytes(amount),
        srcChainId: srcChainId,
        dstChainId: dstChainId,
        srcTransferId: hex2Bytes(srcTransferId)
    }
  
    const relayProto = Relay.create(relay);
    const relayBytes = Relay.encode(relayProto).finish();

    const domain = keccak256(['uint256', 'address', 'string'], [dstChainId, contractAddress, 'Relay']);
    const signedData = pack(['bytes32', 'bytes'], [domain, relayBytes]);
    const signedDataHash = keccak256(['bytes'], [signedData]);
    const signerAddrs = [];
    for (let i = 0; i < signers.length; i++) {
        signerAddrs.push(signers[i].address);
    }
    signers.sort((a, b) => (a.address.toLowerCase() > b.address.toLowerCase() ? 1 : -1));
    const sigs = await calculateSignatures(signers, hex2Bytes(signedDataHash));
    return {relayBytes, sigs}
  }