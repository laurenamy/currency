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
  Token public token; // token instance
  uint256 convertDays = 24 * 60 * 60;  // converts given number to seconds for time comparison
  struct Project {
    string title;
    uint256 tokenGoal;
    uint256 duration;
    uint256 startTime;
    address owner;
  }
  bytes1 projectTitle = bytes1("");
  bytes1 blank = "";

  /***************
  INTERNAL ACCOUNTING
  ***************/
  Project[] public projects; // array of all project structs
  uint[] public projectIds; // array of all project Ids
  mapping (address => mapping(uint256 => uint)) userProjectDonations; // mapping of users and
  // projects to provide the amount of funding given by a user
  mapping (uint256 => uint256) funds; // mapping of project ID to funds

  /***************
  EVENTS
  ***************/
  event ProjectCreated (
    uint256 projectId
  );

  /***************
  MODIFIERS
  ***************/

  modifier whenProjectsExist() {
    require(projectIds.length > 0, "There must be project Ids to return");
    _;
  }

  modifier withinTimeLimit(uint256 _projectId) {
    Project memory _project = projects[_projectId];
    uint256 durationSeconds = _project.duration.mul(convertDays);
    require(durationSeconds + _project.startTime > now && now > _project.startTime, "Project must be within time limit");
    _;
  }

  modifier canGiveRefund(uint256 _projectId) {
    Project memory _project = projects[_projectId];
    uint256 msDuration = _project.duration.mul(convertDays);
    require(now > (msDuration + _project.startTime), "Project must be outside time limit");
    require(funds[_projectId] < _project.tokenGoal, "Funding goal must not be met");
    _;
  }

  modifier validProject(string memory _title, uint256 _tokenGoal, uint256 _duration, uint256 _startTime) {
    bytes memory str = bytes(_title);
    require(str.length > 0, "Project must have a name");
    require(_tokenGoal > 0, "Token goal must be greater than zero");
    require(_duration > 0, "Project duration must be greater than zero");
    require(_startTime > 0, "Project start must be greater than zero");
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
  * @param _tokenGoal uint256The goal of tokens to be raised
  * @param _duration uint256How long (in days) the project will last in days
  * @param _startTime uint256time the project will start in miliseconds
  */
  function createProject(
    string memory _title,
    uint256 _tokenGoal,
    uint256 _duration,
    uint256 _startTime)
    public
    validProject(_title, _tokenGoal, _duration, _startTime)
  {
    require(token.balanceOf(msg.sender) > 0, "User must hold tokens to create a project");
    Project memory _project = Project({
      title: _title,
      tokenGoal: _tokenGoal,
      duration: _duration,
      startTime: _startTime,
      owner: msg.sender});
    uint256 projectId = projects.push(_project) - 1;
    projectIds.push(projectId);
    emit ProjectCreated(projectId);
  }

  /**
    * @dev Fetches a project
    * @param _projectId The id of the project to be returned
    * @return project struct
    */
  function getProject(uint256 _projectId) public view returns (
    string memory title,
    uint256 tokenGoal,
    uint256 duration,
    uint256 startTime,
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

  function getProjectIds() external view whenProjectsExist returns (uint[] memory) {
    return projectIds;
  }

    /**
    * @dev Updates the start of a project
    * @param _time New start time for the project
    * @param _projectId The id of the project to update
    */
  function updateProjectStart(uint256 _time, uint256 _projectId) external onlyOwner
  {
    projects[_projectId].startTime = _time;
  }


  // DONATION STATE //

  /**
    * @dev Called by user to make a donation of tokens to a project
    * @param _projectId Project that user is donating to
    * @param _tokens Amount of tokens user will donate
    */
  function makeDonation(uint256 _projectId, uint256 _tokens) external payable
  whenProjectsExist
  withinTimeLimit(_projectId)
  {
    require(token.balanceOf(msg.sender) >= _tokens, 'Must have enough tokens to process transaction');
    require(_tokens > 0, 'Amount must not be zero');
    token.transferFrom(msg.sender, projects[_projectId].owner, _tokens);
    funds[_projectId] = funds[_projectId].add(_tokens);
    userProjectDonations[msg.sender][_projectId] = userProjectDonations[msg.sender][_projectId].add(_tokens);
  }

  /**
    * @dev Returns the funds donated for a project
    * @param _projectId The id of the project whose funds are to be
    * returned
    * @return uint256 representing project funding
    */
  function getFunds(uint256 _projectId) external view whenProjectsExist returns (uint) {
    return funds[_projectId];
  }

  /**
    * @dev Gets the funds donated for a project by a specific user
    * @param _user The address of the user
    * @param _projectId The id of the project whose funds are to be
    * returned
    * @return uint256 representing project funding by user
    */
  function getUserDonation(
    address _user,
    uint256 _projectId
  )
  public view whenProjectsExist returns (uint) {
    if (userProjectDonations[_user][_projectId] != 0) {
      return userProjectDonations[_user][_projectId];
    } else {
      return 0;
    }
  }

  /**
    * @dev Processes a refund for a user
    * @param _projectId The id of the project whose funds are to be
    * returned
    * @param _user The id of the user who should be refunded
    */
  function processRefund(
    uint256 _projectId,
    address _user)
    external
  canGiveRefund(_projectId)
  onlyOwner
  {
    uint256 _tokens = getUserDonation(_user, _projectId);
    funds[_projectId] = 0;
    userProjectDonations[_user][_projectId] = 0;
    token.transferFrom(msg.sender, _user, _tokens);
  }
}