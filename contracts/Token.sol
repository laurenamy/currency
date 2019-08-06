pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract Token is ERC20, ERC20Detailed {
  uint40 public startTime;
  uint40 public endTime;

  mapping(address => Token) public tokens;
  constructor(uint40 _startTime, uint40 _endTime, uint256 initialSupply) ERC20Detailed("Gold", "GLD", 18) public {
    _mint(msg.sender, initialSupply);
    startTime = _startTime;
    endTime = _endTime;
  }

  function transfer(address recipient, uint256 amount) public returns (bool) {
    require(now >= startTime && now < endTime, "Must take place within the given time window");
    super.transfer(recipient, amount);
    return true;
  }

  function setStartDate(uint40 startDate) public {
    startTime = startDate;
  }

  function setEndDate(uint40 endDate) public {
    endTime = endDate;
  }
<<<<<<< HEAD
=======

  function getNow() public view returns (uint) {
    return now;
  }
>>>>>>> wip: time fram error
}