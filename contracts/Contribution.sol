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

  mapping(address => uint256) public donations;

  function sendContribution() public payable {
    require(msg.value > 0, "Amount must not be zero.");
    _sendTokens(msg.sender, msg.value);
    donations[msg.sender] = donations[msg.sender].add(msg.value);
    emit Sent(msg.sender, msg.value);
  }

  function getContributions(address _donor) public view returns (uint256) {
    require(donations[_donor] != 0, "No donations from given address.");
    return donations[_donor];
  }

  function _sendTokens(address recipient, uint256 amountWei) internal {
    uint numTokens = amountWei.div(rate);
    require(tokenAddress.totalSupply() >= numTokens, "Insufficient amount of tokens.");
    tokenAddress.transferFrom(recipient, numTokens);
  }
}