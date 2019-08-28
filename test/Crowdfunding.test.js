const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const Token = artifacts.require('Token');
const Crowdfunding = artifacts.require('Crowdfunding');
const web3 = new Web3(Web3.givenProvider);

contract('Crowdfunding', function (accounts) {
  const owner = accounts[0];
  const donor = accounts[1];
  const accOwner = accounts[2];
  const title = "my project";
  const tokenGoal = new BN(1000);
  const duration = new BN(10);
  const startDate = 1533114000;
  const endDate = 1596272400;
  const testTime = 1563114000;
  const tokenSupply = new BN(2000);
  const amountTokens = new BN(100);
  const projectStart = Math.floor(Date.now()/1000 - 1000);
  const failProjectStart = 1396272400;
  const now = Math.floor(Date.now()/1000);

  beforeEach(async function () {
    token = await Token.new(startDate, endDate, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);

    crowdfund = await Crowdfunding.new(tokenAddress);
    crowdfundAddress = crowdfund.address;
    crowdfundInstance = await Crowdfunding.at(crowdfundAddress);

    // allows the crowdfund to spend 1000 tokens
    await token.approve(crowdfundAddress, tokenGoal);

    // owner sends donor 100 tokens
    await token.transfer(donor, amountTokens);
    
    // allows the token to spend 1000 tokens from donor
    await token.approve(crowdfundAddress, amountTokens, { from: donor });

    // allows the token to spend 1000 tokens from account owner
    await token.approve(crowdfundAddress, amountTokens, { from: accOwner });

    // owner sends account owner 100 tokens
    await token.transfer(accOwner, amountTokens);
  });
  describe('createProject', function () {
    it('should create a project with the correct attributes', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      let project = await crowdfund.getProject(projectId);
      assert.equal(project.title, title);
      assert.equal(project.tokenGoal, tokenGoal.toNumber());
      assert.equal(project.duration, duration.toNumber());
    });
    it('should revert if the project owner does not have any tokens', async function () {
      await expectRevert(crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accounts[3] }), 'User must hold tokens to create a project');
    });
  });
  describe('getProjectIds', function () {
    it('should return an array of the correct length', async function () {
      await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      let projectIds = await crowdfund.getProjectIds();
      assert.equal(projectIds.length, 3);
    });
    it('should revert if there are no project ids', async function () {
      await expectRevert(crowdfund.getProjectIds(), 'There are no project ids to return');
    });
  });
  describe('makeDonation', function () {
    it('should revert if the balance of the donor is insufficient', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await expectRevert(crowdfund.makeDonation(projectId, tokenSupply, { from: donor }), 'Must have enough tokens to process transaction');
    });
    it('should revert if the amount of tokens is zero', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await expectRevert(crowdfund.makeDonation(projectId, 0, { from: donor }), 'Amount must not be zero');
    });
    it('should decrease the donor balance by the correct amount of tokens', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      let donorBalance = await token.balanceOf(donor);
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
      let newBalance = await token.balanceOf(donor);
   
      assert.equal(newBalance + amountTokens, donorBalance.toNumber());
    });
    it('should increase the amount of tokens a project has', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      let previousFunds = await crowdfund.getFunds(projectId);
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
      let currentFunds = await crowdfund.getFunds(projectId);
      assert.equal(currentFunds - amountTokens, previousFunds);
    });
    it('should increase the amount of funding a user has given a project', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      let previousFunding = await crowdfund.getUserProjectFunding(donor, projectId);
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
      let currentFunding = await crowdfund.getUserProjectFunding(donor, projectId);
      assert.equal(currentFunding - amountTokens, previousFunding);
    });
    it('should revert if past the time limit', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, failProjectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await expectRevert(crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor }), "Project must be within time limit");
    });
  });
  describe('processRefund', function () {
    it('should revert if the project funding period has ended', async function () {
      let { logs } = await crowdfund.createProject(title, amountTokens.toNumber(), duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens.toNumber(), { from: donor });
      await expectRevert(crowdfund.processRefund(projectId, donor, { from: owner }), "Project must be outside time limit");
    });
    it('should revert if the project met the funding goal', async function () {
      let { logs } = await crowdfund.createProject(title, amountTokens, duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens, { from: donor });
      await crowdfund.updateProjectStart(failProjectStart, projectId);
      await expectRevert(crowdfund.processRefund(projectId, donor, { from: owner }), "Funding goal has been met");
    });
    it('should refund the correct amount of tokens to the donor', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens, { from: donor });
      let previousBalance = await token.balanceOf(donor);
      await crowdfund.updateProjectStart(failProjectStart, projectId);
      await crowdfund.processRefund(projectId, donor, { from: accOwner });
      let currentBalance = await token.balanceOf(donor);
      await assert.equal(currentBalance.toNumber(), previousBalance.toNumber() + amountTokens);
    });
    it('should reduce the amount of tokens the project owner has by the correct amount', async function() {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens, { from: donor });
      let previousBalance = await token.balanceOf(accOwner);
      await crowdfund.updateProjectStart(failProjectStart, projectId);
      await crowdfund.processRefund(projectId, donor, { from: accOwner });
      let currentBalance = await token.balanceOf(accOwner);
      await assert.equal(currentBalance.toNumber(), previousBalance.toNumber() - amountTokens);
    });
  });
  describe('updateProjectStart', function() {
    it('should update the project time to the given time', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens, { from: donor });
      let previousBalance = await token.balanceOf(accOwner);
      await crowdfund.updateProjectStart(failProjectStart, projectId);
      let { startTime } = await crowdfund.getProject(projectId);
      await assert.equal(startTime, failProjectStart);
    });
    it('should revert if not called by the owner', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, projectStart, { from: accOwner });
      let projectId = logs[0].args.projectId.toNumber();
      await crowdfund.makeDonation(projectId, amountTokens, { from: donor });
      let previousBalance = await token.balanceOf(accOwner);
      await expectRevert(crowdfund.updateProjectStart(failProjectStart, projectId, { from: donor }), "Ownable: caller is not the owner");
    });
  });
});