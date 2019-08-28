pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Token is Ownable, ERC20 {
  /****************
  GLOBAL CONSTANTS
  *****************/
  uint40 public startTime; // start of when tokens can be purchased
  uint40 public endTime;  // end of when tokens can be purchased

  /****************
  EVENTS
  *****************/
  event UpdatedTime(uint40 time);

  /****************
  FUNCTIONS
  *****************/
  constructor(
    uint40 _startTime,
    uint40 _endTime,
    uint256 initialSupply
  )
  public
  {
    _mint(msg.sender, initialSupply);
    startTime = _startTime;
    endTime = _endTime;
  }

  // TOKEN STATE //

  /**
  * @dev Transfers tokens from an account to another account
  * @param recipient The account receiving the tokens
  * @param amount The amount of tokens to be transfered
  */
  function transferFrom(
    address recipient,
    uint256 amount
  )
  public
  returns (bool) {
    require(now >= startTime && now < endTime, "Must take place within the given time window");
    address owner = this.owner();
    super.transferFrom(owner, recipient, amount);
    return true;
  }

  /**
  * @dev Sets the startTime for when tokens can begin to be transferred
  * @param startDate The time to set the startTime to
  */
  function setStartDate(uint40 startDate) public onlyOwner {
    startTime = startDate;
    emit UpdatedTime(startTime);
  }

  /**
  * @dev Sets the endTime for when tokens can no longer be transferred
  * @param endDate The time to set the endTime to
  */
  function setEndDate(uint40 endDate) public onlyOwner {
    endTime = endDate;
    emit UpdatedTime(endTime);
  }
}