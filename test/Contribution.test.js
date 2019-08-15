
const { expectThrow, expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const Contribution = artifacts.require('Contribution');
const Token = artifacts.require('Token');
const web3 = new Web3(Web3.givenProvider);


contract('Contribution', function (accounts) {
  const tokenOwner = accounts[0];
  const donor = accounts[1];
  const notTokenOwner = accounts[2];
  const tokenSupply = new BN(50);
  const amountEth = web3.utils.toWei("1", "ether");
  const largeAmountEth = web3.utils.toWei("51", "ether");

  beforeEach(async function () {
    token = await Token.new(1533114000, 1596272400, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);

    contribution = await Contribution.new(tokenAddress);
    contributionAddress = contribution.address;

    // owner gives approval to contributionContract to transfer on their behalf
    await token.approve(contributionAddress, tokenSupply);
  });

  describe("sendContribution", async function () {
    it("should revert if the amount is less than or equal to zero.", async function () {
      await expectRevert(contribution.sendContribution({ from: donor, value: 0 }), "Amount must not be zero.");
    });
    it("should revert if the amount of tokens is greater than the supply", async function () {
      await expectRevert(contribution.sendContribution({ from: donor, value: largeAmountEth }), "Insufficient amount of tokens.");
    });
    it("emits a Sent event on successful contribution", async function () {
      const { logs } = await contribution.sendContribution({ from: donor, value: amountEth });
      await expectEvent.inLogs(logs, 'Sent', {from: donor, value: amountEth});
    });
    it("should update the donor's balance with the donation they made", async function () {
      await contribution.sendContribution({ from: donor, value: amountEth });
      const balance = await contribution.donations(donor);
      assert.equal(balance, amountEth);
    });
  });
  
  describe("getContributions", async function () {
    it("should revert if the address hasn't made a donation", async function () {
      await expectRevert(contribution.getContributions(donor), "No donations from given address.");
    });
    it("should return the amount of ETH a user has donated", async function () {
      await contribution.sendContribution({ from: donor, value: amountEth });
      const balance = await contribution.getContributions(donor);
      assert.equal(balance, amountEth);
    });
  });
});