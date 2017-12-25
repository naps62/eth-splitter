const Splitter = artifacts.require("./Splitter.sol");
const P = require("bluebird");

const getBalance = P.promisify(web3.eth.getBalance);
const sendTransaction = P.promisify(web3.eth.sendTransaction);

contract("Splitter", accounts => {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];
  const otherAccount = accounts[4];
  const otherReceiver1 = accounts[5];
  const otherReceiver2 = accounts[6];
  let contract = null;

  beforeEach(async () => {
    contract = await Splitter.new(alice, bob, carol)
  })

  it("stores alice's, bob's and alice's addresses", async () => {
    const aliceAddr = await contract.alice();
    const bobAddr = await contract.bob();
    const carolAddr = await contract.carol();

    assert.equal(aliceAddr, alice, "Alice's address is not set"),
    assert.equal(bobAddr, bob, "Bob's address is not set"),
    assert.equal(carolAddr, carol, "Carol's address is not set")
  });

  it("sending money from a random source will simply store it", async () => {
    const transactionValue = web3.toWei(0.1, "ether");
    const initialContractBalance = await getBalance(contract.address);
    const initialBobBalance = await getBalance(bob);
    const initialCarolBalance = await getBalance(carol);

    const txhash = await sendTransaction({
      from: otherAccount,
      to: contract.address,
      value: transactionValue
    });

    const contractBalance = await getBalance(contract.address);
    const bobBalance = await getBalance(bob);
    const carolBalance = await getBalance(carol);

    assert(contractBalance.equals(transactionValue));
    assert(bobBalance.equals(initialBobBalance));
    assert(carolBalance.equals(initialCarolBalance));
  })

  it("sending money from alice's account will split it between bob and carol", async () => {
    const transactionValue = web3.toWei(0.1, "ether");
    const halfTransactionValue = web3.toWei(0.05, "ether");
    const initialContractBalance = await getBalance(contract.address);
    const initialBobBalance = await getBalance(bob);
    const initialCarolBalance = await getBalance(carol);

    const txhash = await sendTransaction({
      from: alice,
      to: contract.address,
      value: transactionValue
    });

    const contractBalance = await getBalance(contract.address);
    const bobBalance = await getBalance(bob);
    const carolBalance = await getBalance(carol);

    const expectedBobBalance = initialBobBalance.plus(halfTransactionValue);
    const expectedCarolBalance = initialCarolBalance.plus(halfTransactionValue);

    assert(contractBalance.equals(0)),
    assert(bobBalance.equals(expectedBobBalance)),
    assert(carolBalance.equals(expectedCarolBalance))
  });

  it("random accounts can request an amount to be split between two given addresses", async () => {
    const transactionValue = web3.toWei(0.1, "ether");
    const halfTransactionValue = web3.toWei(0.05, "ether");
    let initialReceiver1Balance = await getBalance(otherReceiver1);
    let initialReceiver2Balance = await getBalance(otherReceiver2);

    const txhash = await contract.split.sendTransaction(
      otherReceiver1,
      otherReceiver2,
      {
        from: otherAccount,
        value: transactionValue
      }
    );

    const receiver1Balance = await getBalance(otherReceiver1);
    const receiver2Balance = await getBalance(otherReceiver2);

    const expectedReceiver1Balance = initialReceiver1Balance.plus(halfTransactionValue);
    const expectedReceiver2Balance = initialReceiver2Balance.plus(halfTransactionValue);

    assert(receiver1Balance.equals(expectedReceiver1Balance)),
    assert(receiver2Balance.equals(expectedReceiver2Balance))
  });
});
