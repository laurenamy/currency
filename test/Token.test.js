const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');

const Token = artifacts.require('Token');
const Contribution = artifacts.require('Contribution');

contract('Token', function (accounts) {
  const owner = accounts[0];
  const recipient = accounts[1];
  const tokenSupply = new BN(50);
  const rate = 10**18;
  const amountEth = web3.utils.toWei("1", "ether");
  const amountTokens = amountEth / rate;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const startDate = 1533114000;
  const endDate = 1596272400;
  const testTime = 1563114000;

  beforeEach(async function () {
    token = await Token.new(startDate, endDate, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);

    contribution = await Contribution.new(tokenAddress);
    contributionAddress = contribution.address;
    contributionInstance = await Contribution.at(contributionAddress);

    // owner gives approval to contributionContract to transfer on their behalf
    await token.approve(contributionAddress, tokenSupply);
  });

  describe('constructor', function () {
    it('should have the correct startTime attribute', async function () {
      assert.equal(await token.startTime.call(), startDate);
    });
    it('should have the correct endTime attribute', async function () {
      assert.equal(await token.endTime.call(), endDate);
    });
  });
  describe('transferFrom', function () {
    it('should increase the recipient balance by token amount transferred', async function () {
      let previousAmount = await token.balanceOf(recipient);
      await contribution.sendContribution({ from: recipient, value: amountEth });
      let currentAmount = await token.balanceOf(recipient);
      assert.equal(previousAmount.toNumber() + amountTokens, currentAmount.toNumber());
    })
    it('should decrease the owner balance by token amount transferred', async function () {
      let previousAmount = await token.balanceOf(owner);
      await contribution.sendContribution({ from: recipient, value: amountEth });
      let currentAmount = await token.balanceOf(owner);
      assert.equal(previousAmount - amountTokens, currentAmount.toNumber());
    });
    it('should increase Contribution contract balance by ETH transferred by donor', async function () {
      let previousBalance = await web3.eth.getBalance(contributionAddress);
      await contribution.sendContribution({ from: recipient, value: amountEth });
      let currentBalance = await web3.eth.getBalance(contributionAddress);
      assert.equal(Number(previousBalance) + amountEth, Number(currentBalance));
    });
    it('should revert if called too early', async function () {
      await token.setStartDate(1567155600);
      await expectRevert.unspecified(contribution.sendContribution({ from: recipient, value: amountEth }));
    });
    it('should revert if called too late', async function () {
      await token.setEndDate(Math.floor(new Date().getTime()/1000.0));
      await delay(3000);
      await expectRevert.unspecified(contribution.sendContribution({ from: recipient, value: amountEth }));
    });
    it('should revert if owner has not given approval', async function () {
      newContribution = await Contribution.new(tokenAddress);
      await expectRevert.unspecified(newContribution.sendContribution({ from: recipient, value: amountEth }));
    });
    it('should revert if transferFrom is not called by Contribution contract', async function () {
      await expectRevert.unspecified(token.transferFrom(owner, amountTokens, { from: recipient }));
    });
  });
  describe('setStartDate', function () {
    it('should update the given startTime', async function () {
      await token.setStartDate(testTime);
      let time = await token.startTime.call()
      assert.equal(testTime, time.toNumber());
    });
    it('emits an UpdatedTime event when startTime is updated', async function () {
      const { logs } = await token.setStartDate(testTime);
      await expectEvent.inLogs(logs, 'UpdatedTime', testTime);
    });
    it('should revert if not called by the contract owner', async function () {
      await expectRevert(token.setStartDate(testTime, { from: accounts[2] }), 'Ownable: caller is not the owner');
    });
  });
  describe('setEndDate', function () {
    it('should update the given endTime', async function () {
      await token.setEndDate(testTime);
      let time = await token.endTime.call()
      assert.equal(testTime, time.toNumber());
    });
    it('emits an UpdatedTime event when endTime is updated', async function () {
      const { logs } = await token.setEndDate(testTime);
      await expectEvent.inLogs(logs, 'UpdatedTime', testTime);
    });
    it('should revert if not called by the contract owner', async function () {
      await expectRevert(token.setStartDate(testTime, { from: accounts[2] }), 'Ownable: caller is not the owner');
    });
  });
});