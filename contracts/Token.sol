pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Token is Ownable, ERC20 {
  uint40 public startTime;
  uint40 public endTime;

  constructor(uint40 _startTime, uint40 _endTime, uint256 initialSupply) public {
    _mint(msg.sender, initialSupply);
    startTime = _startTime;
    endTime = _endTime;
  }

  function transferFrom(address recipient, uint256 amount) public returns (bool) {
    require(now >= startTime && now < endTime, "Must take place within the given time window");
    address owner = this.owner();
    super.transferFrom(owner, recipient, amount);
    return true;
  }

  function setStartDate(uint40 startDate) public {
    startTime = startDate;
  }

  function setEndDate(uint40 endDate) public {
    endTime = endDate;
  }
}