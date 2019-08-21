const { expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const Token = artifacts.require('Token');
const Crowdfunding = artifacts.require('Crowdfunding');
const web3 = new Web3(Web3.givenProvider);

contract('Crowdfunding', function (accounts) {
  const owner = accounts[0];
  const title = "my project";
  const tokenGoal = new BN(1000);
  const duration = new BN(10);
  const startDate = 1533114000;
  const endDate = 1596272400;
  const testTime = 1563114000;
  const tokenSupply = new BN(50);

  beforeEach(async function () {
    token = await Token.new(startDate, endDate, tokenSupply);
    // Wednesday, August 1, 2018 9:00:00 AM
    // Saturday, August 1, 2020 9:00:00 AM
    tokenAddress = token.address;
    tokenInstance = await Token.at(tokenAddress);

    crowdfund = await Crowdfunding.new(tokenAddress);
    crowdfundAddress = crowdfund.address;
    crowdfundInstance = await Crowdfunding.at(crowdfundAddress);
  });
  describe('createProject', function () {
    it('creates a project with the correct attributes', async function () {
      let { logs } = await crowdfund.createProject(title, tokenGoal, duration, { from: owner });
      let projectId = logs[0].args.projectId.toNumber();
      let project = await crowdfund.getProject(projectId);
      assert.equal(project.title, title);
      assert.equal(project.tokenGoal, tokenGoal.toNumber());
      assert.equal(project.duration, duration.toNumber());
    });
    it('reverts if the project owner does not have any tokens', async function () {
      await expectRevert(crowdfund.createProject(title, tokenGoal, duration, { from: accounts[2] }), 'User must hold tokens to create a project');
    });
  });
  describe('getProjectIds', function () {
    it('returns an array of the correct length', async function () {

    });
  });
});