pragma solidity ^0.5.0;

// Users can donate ETH to Contribution contract
// Users receive Tokens in exchange for their ETH from the Contribution Contract

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Contribution {
  using SafeMath for uint;

  uint256 private rate = 10**18;
  Token public tokenAddress;

  event Sent(address from, uint256 value);

  constructor (address _tokenAddress) public {
    tokenAddress = Token(_tokenAddress);
  }

  function sendContribution() public payable {
    require(msg.value > 0, "Amount must not be zero.");
    _sendTokens(msg.sender, msg.value);
    emit Sent(msg.sender, msg.value);
  }

  function _sendTokens(address recipient, uint256 amountWei) internal {
    // less than total supply not balance
    uint numTokens = amountWei.div(rate);
    require(tokenAddress.totalSupply() >= numTokens, "Insufficient amount of tokens.");
    tokenAddress.transferFrom(recipient, numTokens);
  }
}