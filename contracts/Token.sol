pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract Token is ERC20, ERC20Detailed {
  constructor() ERC20Detailed("Gold", "GLD", 18) public {
    // _mint(msg.sender, initialSupply);
  }

  function _transfer(address recipient, uint256 amount, uint256 currentTime, uint256 start, uint256 end) public returns (bool) {
    require(currentTime >= start && currentTime < end, "Must take place within the given time window");
    super._transfer(msg.sender, recipient, amount);
    return true;
  }

  // event Transfer(
  //   address indexed _from,
  //   address indexed _to,
  //   uint256 _value
  // );

  // function checkTime(uint _moment, uint _start, uint _end) public pure returns (bool) {
  //   require(_moment >= _start && _moment < _end, "Must take place within the given window");
  // }

  // function transferTokens(address _recipient, uint _value, uint _now, uint _startTime, uint _endTime) public  {
  //   require(checkTime(_now, _startTime, _endTime), "Not within time constraints");
  //   emit Transfer(msg.sender, _recipient, _value);
  // }
}