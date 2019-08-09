const Migrations = artifacts.require("Migrations");
const Token = artifacts.require('Token');

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Token, 1533114000, 1596272400, 1000);
};
