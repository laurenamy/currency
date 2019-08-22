pragma solidity ^0.5.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract Contribution is Pausable {
  using SafeMath for uint;

  /****************
  GLOBAL CONSTANTS
  *****************/
  uint256 private rate = 10**18; // conversation rate
  Token public tokenAddress;  // token instance
  mapping(address => uint256) public donations; //

  /****************
  EVENTS
  *****************/
  event Sent(address from, uint256 value);


  /****************
  FUNCTIONS
  *****************/
  constructor (address _tokenAddress) public {
    tokenAddress = Token(_tokenAddress);
  }

  /**
  * @dev Sends a contribution to the contract and calls _sendTokens
  * in return
  */
  function sendContribution() public payable whenNotPaused {
    require(msg.value > 0, "Amount must not be zero.");
    _sendTokens(msg.sender, msg.value);
    donations[msg.sender] = donations[msg.sender].add(msg.value);
    emit Sent(msg.sender, msg.value);
  }

  /**
  * @dev Returns all contributions from the given address
  * @param _donor The address of the donor
  */
  function getContributions(address _donor) public view returns (uint256) {
    require(donations[_donor] != 0, "No donations from given address.");
    return donations[_donor];
  }

  /**
  * @dev Sends the appropriate amount of tokens given the amount of wei
  * @param recipient Account to receive the tokens
  * @param amountWei Amount of wei to be converted to tokens
  */
  function _sendTokens(address recipient, uint256 amountWei) internal {
    uint numTokens = amountWei.div(rate);
    require(tokenAddress.totalSupply() >= numTokens, "Insufficient amount of tokens.");
    tokenAddress.transferFrom(recipient, numTokens);
  }
}