const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const Token = artifacts.require('Token');
const Crowdfunding = artifacts.require('Crowdfunding');
const web3 = new Web3(Web3.givenProvider);

contract('Crowdfunding', function (accounts) {
  const owner = accounts[0];
  const donor = accounts[1]
  const title = "my project";
  const tokenGoal = new BN(1000);
  const duration = new BN(10);
  const startDate = 1533114000;
  const endDate = 1596272400;
  const testTime = 1563114000;
  const tokenSupply = new BN(500);
  const amountTokens = new BN(100);

  beforeEach(async function () {
    token = await Token.new(startDate, endDate, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);

    crowdfund = await Crowdfunding.new(tokenAddress);
    crowdfundAddress = crowdfund.address;
    crowdfundInstance = await Crowdfunding.at(crowdfundAddress);

    await token.approve(crowdfundAddress, tokenGoal);
    await token.approve(owner, amountTokens);
    await token.transferFrom(donor, amountTokens, { from: owner });
    
  });
  describe('createProject', function () {
    it('should create a project with the correct attributes', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      let project = await crowdfund.getProject(projectId);
      assert.equal(project.title, title);
      assert.equal(project.tokenGoal, tokenGoal.toNumber());
      assert.equal(project.duration, duration.toNumber());
    });
    it('should revert if the project owner does not have any tokens', async function () {
      await expectRevert(crowdfund.createProject(title, tokenGoal, duration, { from: accounts[2] }), 'User must hold tokens to create a project');
    });
  });
  describe('getProjectIds', function () {
    it('should return an array of the correct length', async function () {
      await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectIds = await crowdfund.getProjectIds();
      assert.equal(projectIds.length, 3);
    });
    it('should revert if there are no project ids', async function () {
      await expectRevert(crowdfund.getProjectIds(), 'There are no project ids to return');
    });
  });
  describe('makeDonation', function () {
    it('should revert if the balance of the donor is insufficient', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
        
      await expectRevert(crowdfund.makeDonation(projectId, tokenSupply, { from: donor }), 'Must have enough tokens to process transaction');
    });
    it('should revert if the amount of tokens is zero', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();

      await expectRevert(crowdfund.makeDonation(projectId, 0, { from: donor }), 'Amount must not be zero');
    });
    it('should increase the project balance by the correct amount of tokens', async function () {

    });
    it('should decrease the donor balance by the correct amount of tokens', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      let previousBalance = await token.balanceOf(donor);
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
      let newBalance = await token.balanceOf(donor);
      assert.equal(newBalance - amountTokens, previousBalance);
    });
    it('should increase the amount of tokens a project has', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
            
      let a = await crowdfund.funds[projectId].call();
      console.dir(a)
    });
  });
});