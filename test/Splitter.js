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
    contract = await Splitter.new(bob, carol, { from: alice })
  })

  it("stores alice's, bob's and alice's addresses", async () => {
    const aliceAddr = await contract.alice();
    const bobAddr = await contract.bob();
    const carolAddr = await contract.carol();

    assert.equal(aliceAddr, owner, "Alice's address is not set"),
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

  it("can split money sent from alice between bob and carol", async () => {
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

    const tx = await contract.split.sendTransaction();

    const bobBalance = await getBalance(bob);
    const carolBalance = await getBalance(carol);

    const expectedBobBalance = initialBobBalance.plus(halfTransactionValue);
    const expectedCarolBalance = initialCarolBalance.plus(halfTransactionValue);

    assert(bobBalance.equals(expectedBobBalance)),
    assert(carolBalance.equals(expectedCarolBalance))
  });

  it("fails if amount to split is zero", async () => {
    try {
      const tx = await contract.split.sendTransaction();
      assert.fail()
    } catch(err) {
      assertRevert(err);
    }
  })
});
