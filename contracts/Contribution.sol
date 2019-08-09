pragma solidity ^0.5.0;

// Users can donate ETH to Contribution contract
// Users receive Tokens in exchange for their ETH from the Contribution Contract

import "./Token.sol";

contract Contribution {
  uint rate;
  uint amountEth;
  Token public tokenContract;

  constructor (address _tokenAddress) public {
    tokenContract = Token(_tokenAddress);
  }

  event Sent(address from, uint value);

  function sendContribution(address tokenAddress) public payable {
    require(msg.value > 0, "Amount must not be zero.");
    sendTokens(tokenAddress, msg.sender, msg.value);
    emit Sent(msg.sender, msg.value);
  }

  function sendTokens(address tokenAddress, address recipient, uint amountWei) internal {
    // less than total supply not balance
    uint numTokens = amountWei / 10**18;
    require(tokenContract.totalSupply() >= numTokens, "Insufficient amount of tokens.");
    tokenContract.transferFrom(tokenAddress, recipient, numTokens);
  }
}