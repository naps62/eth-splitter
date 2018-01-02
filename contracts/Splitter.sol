pragma solidity ^0.4.17;

import "./Mortal.sol";

contract Splitter is Mortal {
  address public alice;
  address public bob;
  address public carol;

  mapping (address => uint) balances;

  event Split(
    address indexed recipient1,
    address indexed recipient2,
    uint amountForEach
  );

  event Redeem(
    address indexed recipient,
    uint amount
  );

  function Splitter(address bobAddress, address carolAddress)
  public
  {
    alice = msg.sender;
    bob = bobAddress;
    carol = carolAddress;
  }

  function balanceOf(address addr)
  view
  public
  returns (uint balance)
  {
    return balances[addr];
  }

  function split()
  public
  payable
  returns (bool success)
  {
    return splitBetween(bob, carol);
  }

  function splitBetween(address recipient1, address recipient2)
  public
  payable
  returns (bool success)
  {
    require(msg.value > 0);
    require(remainder(msg.value, 2) == 0);
    require(recipient1 != address(0));
    require(recipient2 != address(0));

    uint half = msg.value / 2;
    balances[recipient1] += half;
    balances[recipient2] += half;
    Split(recipient1, recipient2, half);

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

  function remainder(uint numerator, uint denominator)
  private
  pure
  returns (uint)
  {
    return numerator - denominator * (numerator / denominator);
  }

  function ()
  payable
  public
  {
  }
}
