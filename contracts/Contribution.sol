pragma solidity ^0.5.0;

// Users can donate ETH to Contribution contract
// Users receive Tokens in exchange for their ETH from the Contribution Contract

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Contribution {
  using SafeMath for uint;

  uint rate = 10**18;
  uint amountEth;
  Token public tokenAddress;

  event Sent(address from, uint value);

  constructor (address _tokenAddress) public {
    tokenAddress = Token(_tokenAddress);
  }

  function sendContribution(address owner) public payable {
    require(msg.value > 0, "Amount must not be zero.");
    sendTokens(owner, msg.sender, msg.value);
    emit Sent(msg.sender, msg.value);
  }

  function sendTokens(address owner, address recipient, uint amountWei) internal {
    // less than total supply not balance
    uint numTokens = amountWei.div(rate);
    require(tokenAddress.balanceOf(owner) >= numTokens, "Insufficient amount of tokens.");
    tokenAddress.transferFrom(owner, recipient, numTokens);
  }
}