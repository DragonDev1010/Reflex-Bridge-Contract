const Bridge = artifacts.require("Bridge");
const ReflexBridge = artifacts.require("ReflexBridge");
module.exports = function (deployer) {
  	deployer.deploy(Bridge);
  	deployer.deploy(ReflexBridge);
};
