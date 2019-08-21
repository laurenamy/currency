pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

contract Crowdfunding {
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

  /***************
  EVENTS
  ***************/
  event ProjectCreated (
    uint projectId
  );

  /********
  FUNCTIONS
  ********/
  function createProject(string memory _title, uint _tokenGoal, uint _duration) public {
    require(token.balanceOf(msg.sender) > 0, "User must hold tokens to create a project");
    Project memory _project = Project({title: _title, tokenGoal: _tokenGoal, duration: _duration});
    uint projectId = projects.push(_project) - 1;
    projectIds.push(projectId);
    emit ProjectCreated(projectId);
  }
  function getProject(uint _projectId) public view returns (string memory title, uint tokenGoal, uint duration) {
    Project memory _project = projects[_projectId];

    title = _project.title;
    tokenGoal = _project.tokenGoal;
    duration = _project.duration;
  }

  function getProjectIds() public view returns (uint[] memory) {
    return projectIds;
  }
}