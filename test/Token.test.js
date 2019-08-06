const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');

const Token = artifacts.require('Token');

contract('Token', function (accounts) {
  const owner = accounts[0];
  const recipient = accounts[1];
  const amount = new BN(100);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  beforeEach(async function () {
    token = await Token.new(1533114000, 1596272400, 1000);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);
  });

  describe('transfer', function () {
    it('emits a Transfer event on successful Transfers', async function () {
<<<<<<< HEAD
      const { logs } = await token.transfer(recipient, amount, { from: owner });
=======
      const { logs } = await tokenInstance.transfer(recipient, amount, { from: owner });
>>>>>>> wip: time fram error
      await expectEvent.inLogs(logs, 'Transfer', {to: recipient, value: amount });
    });
    it('should revert if called too early', async function () {
      await tokenInstance.setStartDate(1567155600);
      await expectRevert.unspecified(tokenInstance.transfer(recipient, amount, { from: owner }));
    });
    it('should revert if called too late', async function () {
      await tokenInstance.setEndDate(Math.floor(new Date().getTime()/1000.0));
      await delay(3000);
      await expectRevert.unspecified(tokenInstance.transfer(recipient, amount, { from: owner }));
    });
  });
});