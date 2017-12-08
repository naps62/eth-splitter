pragma solidity ^0.4.17;

import "./Mortal.sol";

contract Splitter is Mortal {
  address public alice;
  address public bob;
  address public carol;

  function Splitter(address aliceAddress, address bobAddress, address carolAddress)
  public
  {
    alice = aliceAddress;
    bob = bobAddress;
    carol = carolAddress;
  }

  function split(address firstReceiver, address secondReceiver)
  public
  payable
  returns (bool success)
  {
    uint half = msg.value / 2;
    firstReceiver.transfer(half);
    secondReceiver.transfer(half);

    return true;
  }

  function ()
  payable
  public
  {
    if (msg.sender == alice) {
      split(bob, carol);
    }
  }
}
