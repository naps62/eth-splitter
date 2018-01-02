pragma solidity ^0.4.17;

import "./Mortal.sol";

contract Splitter is Mortal {
  address public alice;
  address public bob;
  address public carol;

  function Splitter(address bobAddress, address carolAddress)
  public
  {
    alice = msg.sender;
    bob = bobAddress;
    carol = carolAddress;
  }

  function split()
  public
  payable
  returns (bool success)
  {
    uint half = this.balance / 2;
    bob.transfer(half);
    carol.transfer(half);

    return true;
  }

  function ()
  payable
  public
  {
  }
}
