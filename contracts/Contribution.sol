pragma solidity ^0.5.0;

// Users can donate ETH to Contribution contract
// Users receive Tokens in exchange for their ETH from the Contribution Contract

import "./Token.sol";

contract Contribution {
  uint rate;
  uint amountTokens;
  uint amountEth;
  Token public tokenContract;

  constructor () public {
    rate = 1;
  }

  event Sent(address from, uint value);

  function sendContribution() public payable {
    require(msg.value > 0, "Amount must not be zero.");
    emit Sent(msg.sender, msg.value);
    amountTokens = msg.value * rate;
    sendTokens(msg.sender);
  }

  function sendTokens(address recipient) internal {
    // less than total supply not balance
    require(tokenContract.totalSupply() <= amountTokens, "Insufficient amount of tokens.");
    tokenContract.transfer(recipient, amountTokens);
    emit Sent(recipient, amountTokens);
  }
}