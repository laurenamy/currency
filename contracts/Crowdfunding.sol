pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token.sol";

contract Crowdfunding is Ownable {
  using SafeMath for uint;

  /***************
  GLOBAL CONSTANTS
  ***************/
  Project[] public projects; // array of all project structs
  uint[] public projectIds; // array of all project Ids
  Token public token; // token instance
  mapping (uint => uint256) funds; // mapping of project ID to funds
  struct Project {
    string title;
    uint tokenGoal;
    uint duration;
    uint startTime;
    address owner;
  }
  uint convertDays = 24 * 60 * 60;  // converts given number to seconds for time comparison

  mapping (address => mapping(uint => uint)) users; // users[project][donations]

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

  modifier withinTimeLimit(uint _projectId) {
    Project memory _project = projects[_projectId];
    uint durationSeconds = _project.duration.mul(convertDays);
    require(durationSeconds + _project.startTime > now && now > _project.startTime, "Project must be within time limit");
    _;
  }

  modifier canGiveRefund(uint _projectId) {
    Project memory _project = projects[_projectId];
    uint msDuration = _project.duration.mul(convertDays);
    require(now > (msDuration + _project.startTime), "Project must be outside time limit");
    require(funds[_projectId] < _project.tokenGoal, "Funding goal has been met");
    _;
  }

  /********
  FUNCTIONS
  ********/

  constructor (address _tokenAddress) public {
    token = Token(_tokenAddress);
  }

  // PROJECT STATE //

  /**
  * @dev Creates a project struct
  * @param _title string The title of the project
  * @param _tokenGoal uint The goal of tokens to be raised
  * @param _duration uint How long (in days) the project will last in days
  * @param _startTime uint time the project will start in miliseconds
  */
  function createProject(
    string memory _title,
    uint _tokenGoal,
    uint _duration,
    uint _startTime)
    public
  {
    require(token.balanceOf(msg.sender) > 0, "User must hold tokens to create a project");
    Project memory _project = Project({
      title: _title,
      tokenGoal: _tokenGoal,
      duration: _duration,
      startTime: _startTime,
      owner: msg.sender});
    uint projectId = projects.push(_project) - 1;
    projectIds.push(projectId);
    funds[projectId] = 0;
    emit ProjectCreated(projectId);
  }

  /**
    * @dev Fetches a project
    * @param _projectId The id of the project to be returned
    * @return project struct
    */
  function getProject(uint _projectId) public view returns (
    string memory title,
    uint tokenGoal,
    uint duration,
    uint startTime,
    address owner
  )
  {
    Project memory _project = projects[_projectId];
    title = _project.title;
    tokenGoal = _project.tokenGoal;
    duration = _project.duration;
    startTime = _project.startTime;
    owner = _project.owner;
  }

  /**
    * @dev Fetches array of all project ids
    * @return arr project Ids
    */

  function getProjectIds() public view whenNoProjectIds returns (uint[] memory) {
    return projectIds;
  }
  
    /**
    * @dev Updates the start of a project
    * @param _time New start time for the project
    * @param _projectId The id of the project to update
    */
  function updateProjectStart(uint _time, uint _projectId) public onlyOwner
  {
    projects[_projectId].startTime = _time;
  }


  // DONATION STATE //

  /**
    * @dev Called by user to make a donation of tokens to a project
    * @param _projectId Project that user is donating to
    * @param _tokens Amount of tokens user will donate
    */
  function makeDonation(uint _projectId, uint _tokens) public payable
  whenNoProjectIds
  withinTimeLimit(_projectId)
  {
    require(token.balanceOf(msg.sender) >= _tokens, 'Must have enough tokens to process transaction');
    require(_tokens > 0, 'Amount must not be zero');
    token.transferFrom(msg.sender, projects[_projectId].owner, _tokens);
    funds[_projectId] = funds[_projectId].add(_tokens);
    users[msg.sender][_projectId] = users[msg.sender][_projectId].add(_tokens);
  }

  /**
    * @dev Returns the funds donated for a project
    * @param _projectId The id of the project whose funds are to be
    * returned
    * @return uint representing project funding
    */
  function getFunds(uint _projectId) public view whenNoProjectIds returns (uint) {
    return funds[_projectId];
  }

  /**
    * @dev Gets the funds donated for a project by a specific user
    * @param _user The address of the user
    * @param _projectId The id of the project whose funds are to be
    * returned
    * @return uint representing project funding by user
    */
  function getUserProjectFunding(
    address _user,
    uint _projectId
  )
  public view whenNoProjectIds returns (uint) {
    if (users[_user][_projectId] != 0) {
      return users[_user][_projectId];
    } else {
      return 0;
    }
  }

  /**
    * @dev Processes a refund for a user
    * @param _projectId The id of the project whose funds are to be
    * returned
    */
  function processRefund(uint _projectId, address _user) public
  canGiveRefund(_projectId)
  {
    uint _tokens = getUserProjectFunding(_user, _projectId);
    token.transferFrom(msg.sender, _user, _tokens);
  }
}