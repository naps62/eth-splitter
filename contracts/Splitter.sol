pragma solidity ^0.4.17;

import "./Mortal.sol";

contract Splitter is Mortal {
  mapping(address => uint) public balances;

  event Split(
    address indexed recipient1,
    address indexed recipient2,
    uint amountForEach
  );

  event Redeem(
    address indexed recipient,
    uint amount
  );

  function split(address recipient1, address recipient2)
  public
  payable
  returns (bool success)
  {
    require(msg.value > 0);
    require(recipient1 != address(0));
    require(recipient2 != address(0));

    var (quotient, remainder) = divide(msg.value, 2);
    balances[recipient1] += quotient;
    balances[recipient2] += quotient;
    balances[msg.sender] = remainder;

    Split(recipient1, recipient2, quotient);

    return true;
  }

  function redeem()
  public
  returns (bool success)
  {
    uint amount = balances[msg.sender];

    require(amount > 0);

    msg.sender.transfer(amount);
    balances[msg.sender] = 0;
    Redeem(msg.sender, amount);

    return true;
  }

  function divide(uint numerator, uint denominator)
  private
  pure
  returns (uint quotient, uint remainder)
  {
    quotient = numerator / denominator;
    remainder = numerator - denominator * quotient;
  }
}
