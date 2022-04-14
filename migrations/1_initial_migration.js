const ReflexToken = artifacts.require("ReflexToken")
const Bridge = artifacts.require("Bridge")

module.exports = async function (deployer) {
	await deployer.deploy(ReflexToken)
	await deployer.deploy(Bridge, ReflexToken.address)
};
