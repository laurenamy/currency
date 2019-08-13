const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const encodeCall = require('zos-lib/lib/helpers/encodeCall').default

const Token = artifacts.require('Token');
const Contribution = artifacts.require('Contribution');

contract('Token', function (accounts) {
  const owner = accounts[0];
  const recipient = accounts[1];
  const tokenSupply = new BN(50);
  const amountEth = web3.utils.toWei("1", "ether");
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
    it('emits a Transfer event on successful Transfers', async function () {
      await contributionInstance.sendContribution({ from: recipient, value: amountEth });
    });
    // TO DO
    // it should decrease tokenSupply by token amount transferred
    // it should decrease owner balance by token about transferred
    // it should increase Contribution contract balance by ETH transferred by donor
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