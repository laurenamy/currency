const Token = artifacts.require('Token');

module.exports = function(deployer) {
  deployer.deploy(Token, 1564650000, 1567242000, 1000);
};