const { expectThrow, expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const Contribution = artifacts.require('Contribution');
const Token = artifacts.require('Token');
const web3 = new Web3(Web3.givenProvider);



contract('Contribution', function (accounts) {
  const tokenOwner = accounts[0];
  const donor = accounts[1];
  const notOwner = accounts[2];
  const amountTokens = 100;
  const tokenSupply = 1000;
  const amountEth = web3.utils.toWei('0.0000000000001', 'ether');

  beforeEach(async function () {
    contribution = await Contribution.new();
    contributionAddress = contribution.address;
    contributionInstance = await Contribution.at(contributionAddress);

    token = await Token.new(1533114000, 1596272400, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);
  });

  describe("sendContribution", async function () {
    it("should revert if the amount is less than or equal to zero.", async function () {
      await expectRevert(contributionInstance.sendContribution({ from: donor, to: tokenOwner, value: 0 }), "Amount must not be zero.");
    });
    it("should revert if the amount of tokens is greater than the supply", async function () {
      await expectRevert(contributionInstance.sendContribution({ from: donor, to: tokenOwner, value: tokenSupply+50 }), "Insufficient amount of tokens.");
    });
    // it("emits a Sent event on successful contribution", async function () {
    //   console.log(await web3.eth.getBalance(tokenOwner));
    //   console.log(await web3.eth.getBalance(donor));

    //   const { logs } = await contributionInstance.sendContribution({ from: donor, value: amountEth });
    //   console.log(logs);
    //   await expectEvent.inLogs(logs, 'Transfer', {from: owner, value: amountEth});

    //   console.log(await web3.eth.getBalance(tokenOwner));
    //   console.log(await web3.eth.getBalance(donor));
    // });
  });
});