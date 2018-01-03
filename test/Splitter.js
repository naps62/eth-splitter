const Splitter = artifacts.require("./Splitter.sol");
const assertRevert = require('./helpers/assertRevert');
const P = require("bluebird");

const getBalance = P.promisify(web3.eth.getBalance);
const sendTransaction = P.promisify(web3.eth.sendTransaction);

contract("Splitter", accounts => {
  const owner = accounts[0];
  const alice = owner;
  const bob = accounts[1];
  const carol = accounts[2];
  const otherAccount = accounts[3];
  const otherReceiver1 = accounts[4];
  const otherReceiver2 = accounts[5];
  let contract = null;

  beforeEach(async () => {
    contract = await Splitter.new()
  })

  it("can split money sent from alice between bob and carol", async () => {
    const full = web3.toWei(0.1, "ether");
    const half = web3.toWei(0.05, "ether");
    const initialBobBalance = await getBalance(bob);
    const initialCarolBalance = await getBalance(carol);

    const tx = await contract.split.sendTransaction(
      bob,
      carol,
      {
        from: alice,
        to: contract.address,
        value: full,
      }
    );

    const bobBalance = await contract.balances(bob);
    const carolBalance = await contract.balances(carol);

    assert(bobBalance.equals(half));
    assert(carolBalance.equals(half));
  });

  it("splitting odd amounts leaves 1 wei for the sender receiver", async () => {
    await contract.split.sendTransaction(
      bob,
      carol,
      {
        from: alice,
        to: contract.address,
        value: 3,
      }
    );

    const aliceBalance = await contract.balances(alice);

    assert(aliceBalance.equals(1));
  });

  it("can split money sent between other accounts", async () => {
    const full = web3.toWei(0.1, "ether");
    const half = web3.toWei(0.05, "ether");

    const tx = await contract.split.sendTransaction(
      otherReceiver1,
      otherReceiver2,
      {
        from: otherAccount,
        to: contract.address,
        value: full,
      }
    );

    const receiver1Balance = await contract.balances(otherReceiver1);
    const receiver2Balance = await contract.balances(otherReceiver2);

    assert(receiver1Balance.equals(half));
    assert(receiver2Balance.equals(half));
  });


  it("allows bob and alice to redeem their balance", async () => {
    const full = web3.toWei(0.1, "ether");
    const half = web3.toWei(0.05, "ether");
    const initialBobBalance = await getBalance(bob);
    const initialCarolBalance = await getBalance(carol);

    const tx = await contract.split.sendTransaction(
      bob,
      carol,
      {
        from: alice,
        to: contract.address,
        value: full,
      }
    );

    await contract.redeem({ from: bob });
    await contract.redeem({ from: carol });

    assert.equal(await contract.balances(bob), 0)
    assert.equal(await contract.balances(carol), 0)
  });

  it("fails if amount to split is zero", async () => {
    try {
      const tx = await contract.split.sendTransaction(
        bob,
        carol,
        {
          from: alice,
          value: 0,
        }
      );
      assert.fail()
    } catch(err) {
      assertRevert(err);
    }
  })
});
