const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');

const Token = artifacts.require('Token');

contract('Token', function (accounts) {
  const owner = accounts[0];
  const recipient = accounts[1];
  const amount = 10;
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
      // need to use an approve function 
      const a = await token.balanceOf(tokenAddress);
      console.dir(a.toNumber());
      console.dir("token address " + tokenAddress);
      await tokenInstance.approve(tokenAddress, amount);
      console.dir(amount);
      const { logs } = await tokenInstance.transferFrom(tokenAddress, recipient, amount);
      console.dir(logs);
      await expectEvent.inLogs(logs, 'Transfer', { from: tokenAddress, value: amount });
    });
    // it('should revert if called too early', async function () {
    //   await tokenInstance.setStartDate(1567155600);
    //   await tokenInstance.approve(tokenAddress, amount);
    //   await expectRevert.unspecified(tokenInstance.transfer(recipient, amount, { from: owner }));
    // });
    // it('should revert if called too late', async function () {
    //   await tokenInstance.setEndDate(Math.floor(new Date().getTime()/1000.0));
    //   await delay(3000);
    //   await expectRevert.unspecified(tokenInstance.transfer(recipient, amount, { from: owner }));
    // });
  });
});