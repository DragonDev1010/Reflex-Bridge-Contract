const ReflexToken = artifacts.require("ReflexToken")
const Bridge = artifacts.require("Bridge")

const SourceBridge = artifacts.require("SourceBridge")
const DestinationBridge = artifacts.require("DestinationBridge")

module.exports = async function (deployer) {
	await deployer.deploy(ReflexToken)
	await deployer.deploy(Bridge, ReflexToken.address)
	await deployer.deploy(SourceBridge)
	await deployer.deploy(DestinationBridge)
};
