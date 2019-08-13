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

  beforeEach(async function () {
    token = await Token.new(1533114000, 1596272400, tokenSupply);
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

  describe('transfer', function () {
    it('emits a Sent event on successful Transfers', async function () {
      const { logs } = await contributionInstance.sendContribution({ from: recipient, value: amountEth });
      const event = logs[0].event;
      assert.equal(event, "Sent");
    });
    it('should increase the recipient balance by token amount transferred', async function () {
      let previousAmount = await tokenInstance.balanceOf(recipient);
      await contributionInstance.sendContribution({ from: recipient, value: amountEth });
      let currentAmount = await tokenInstance.balanceOf(recipient);
      assert.equal(previousAmount.toNumber() + amountTokens, currentAmount.toNumber());
    })
    it('should decrease the owner balance by token amount transferred', async function () {
      let previousAmount = await tokenInstance.balanceOf(owner);
      await contributionInstance.sendContribution({ from: recipient, value: amountEth });
      let currentAmount = await tokenInstance.balanceOf(owner);
      assert.equal(previousAmount - amountTokens, currentAmount.toNumber());
    });
    it('should increase Contribution contract balance by ETH transferred by donor', async function () {
      let previousBalance = await web3.eth.getBalance(contributionAddress);
      await contributionInstance.sendContribution({ from: recipient, value: amountEth });
      let currentBalance = await web3.eth.getBalance(contributionAddress);
      assert.equal(Number(previousBalance) + amountEth, Number(currentBalance));
    });
    it('should revert if called too early', async function () {
      await tokenInstance.setStartDate(1567155600);
      await expectRevert.unspecified(contributionInstance.sendContribution({ from: recipient, value: amountEth }));
    });
    it('should revert if called too late', async function () {
      await tokenInstance.setEndDate(Math.floor(new Date().getTime()/1000.0));
      await delay(3000);
      await expectRevert.unspecified(contributionInstance.sendContribution({ from: recipient, value: amountEth }));
    });
  });
});