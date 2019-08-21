pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

contract Crowdfunding {
  using SafeMath for uint;
  struct Project {
    string title;
    uint tokenGoal;
    uint duration;
  }

  constructor (address _tokenAddress) public {
    token = Token(_tokenAddress);
  }

  /***************
  GLOBAL CONSTANTS
  ***************/
  Project[] public projects;
  uint[] public projectIds;
  Token public token;
  mapping (uint => uint256) funds;

  /***************
  EVENTS
  ***************/
  event ProjectCreated (
    uint projectId
  );

  /***************
  MODIFIERS
  ***************/

  modifier whenNoProjectIds() {
    require(projectIds.length > 0, "There are no project ids to return");
    _;
  }

  /********
  FUNCTIONS
  ********/
  function createProject(string memory _title, uint _tokenGoal, uint _duration) public {
    require(token.balanceOf(msg.sender) > 0, "User must hold tokens to create a project");
    Project memory _project = Project({title: _title, tokenGoal: _tokenGoal, duration: _duration});
    uint projectId = projects.push(_project) - 1;
    projectIds.push(projectId);
    funds[projectId] = 0;
    emit ProjectCreated(projectId);
  }
  function getProject(uint _projectId) public view returns (string memory title, uint tokenGoal, uint duration) {
    Project memory _project = projects[_projectId];

    title = _project.title;
    tokenGoal = _project.tokenGoal;
    duration = _project.duration;
  }

  function getProjectIds() public view whenNoProjectIds returns (uint[] memory) {
    return projectIds;
  }

  function makeDonation(uint _projectId, uint _tokens) public payable whenNoProjectIds {
    require(token.balanceOf(msg.sender) >= _tokens, 'Must have enough tokens to process transaction');
    require(_tokens > 0, 'Amount must not be zero');
    token.transferFrom(msg.sender, _tokens);
    funds[_projectId].add(_tokens);
  }

  function getFunds(uint _projectId) public returns (uint) {
    return funds[_projectId];
  }
}