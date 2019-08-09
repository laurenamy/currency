pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  uint40 public startTime;
  uint40 public endTime;

  mapping(address => Token) public tokens;
  constructor(uint40 _startTime, uint40 _endTime, uint256 initialSupply) public {
    _mint(address(this), initialSupply);
    startTime = _startTime;
    endTime = _endTime;
  }

  event Transfer (address from, address to, uint amount);

  function transferFrom(address tokenAddress, address recipient, uint256 amount) public returns (bool) {
    require(now > startTime && now < endTime, "Must take place within the given time window");
    // super.transferFrom(tokenAddress, recipient, amount);
    emit Transfer(tokenAddress, recipient, amount);
    return true;
  }

  function setStartDate(uint40 startDate) public {
    startTime = startDate;
  }

  function setEndDate(uint40 endDate) public {
    endTime = endDate;
  }
}