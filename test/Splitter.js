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

  beforeEach(() => {
    return Splitter.new(alice, bob, carol)
      .then(_instance => contract = _instance);
  })

  it("stores alice's, bob's and alice's addresses", () => {
    return P.join(
      contract.alice(),
      contract.bob(),
      contract.carol(),
      (aliceAddr, bobAddr, carolAddr) =>
        P.all([
          assert.equal(aliceAddr, alice, "Alice's address is not set"),
          assert.equal(bobAddr, bob, "Bob's address is not set"),
          assert.equal(carolAddr, carol, "Carol's address is not set")
        ])
    );
  });

  it("sending money from a random source will simply store it", () => {
    const transactionValue = web3.toWei(0.1, "ether");
    let initialContractBalance = null;
    let initialBobBalance = null;
    let initialCarolBalance = null;

    return P.join(
      getBalance(contract.address),
      getBalance(bob),
      getBalance(carol),
      (contractBalance, bobBalance, carolBalance) => {
        initialContractBalance = contractBalance;
        initialBobBalance = bobBalance;
        initialCarolBalance = carolBalance;
      }
    ).then(() =>
      sendTransaction({
        from: otherAccount,
        to: contract.address,
        value: transactionValue
      })
    ).then(txhash =>
      P.join(
        getBalance(contract.address),
        getBalance(bob),
        getBalance(carol),
        (contractBalance, bobBalance, carolBalance) =>
          P.join(
            assert(contractBalance.equals(transactionValue)),
            assert(bobBalance.equals(initialBobBalance)),
            assert(carolBalance.equals(initialCarolBalance))
          )
      )
    );
  })

  it("sending money from alice's account will split it between bob and carol", () => {
    const transactionValue = web3.toWei(0.1, "ether");
    const halfTransactionValue = web3.toWei(0.05, "ether");
    let initialContractBalance = null;
    let initialBobBalance = null;
    let initialCarolBalance = null;

    return P.join(
      getBalance(contract.address),
      getBalance(bob),
      getBalance(carol),
      (contractBalance, bobBalance, carolBalance) => {
        initialContractBalance = contractBalance;
        initialBobBalance = bobBalance;
        initialCarolBalance = carolBalance;
      }
    ).then(() =>
      sendTransaction({
        from: alice,
        to: contract.address,
        value: transactionValue
      })
    ).then(txhash =>
      P.join(
        getBalance(contract.address),
        getBalance(bob),
        getBalance(carol),
        (contractBalance, bobBalance, carolBalance) => {
          const expectedBobBalance = initialBobBalance.plus(halfTransactionValue);
          const expectedCarolBalance = initialCarolBalance.plus(halfTransactionValue);

          P.join(
            assert(contractBalance.equals(0)),
            assert(bobBalance.equals(expectedBobBalance)),
            assert(carolBalance.equals(expectedCarolBalance))
          )
        }
      )
    );
  });

  it("random accounts can request an amount to be split between two given addresses", () => {
    const transactionValue = web3.toWei(0.1, "ether");
    const halfTransactionValue = web3.toWei(0.05, "ether");
    let initialReceiver1Balance = null;
    let initialReceiver2Balance = null;

    return P.join(
      getBalance(otherReceiver1),
      getBalance(otherReceiver2),
      (receiver1Balance, receiver2Balance) => {
        initialReceiver1Balance = receiver1Balance;
        initialReceiver2Balance = receiver2Balance;
      }
    ).then(() =>
      contract.split.sendTransaction(otherReceiver1, otherReceiver2, {
        from: otherAccount,
        value: transactionValue
      })
    ).then(txhash =>
      P.join(
      getBalance(otherReceiver1),
      getBalance(otherReceiver2),
      (receiver1Balance, receiver2Balance) => {
        const expectedReceiver1Balance = initialReceiver1Balance.plus(halfTransactionValue);
        const expectedReceiver2Balance = initialReceiver2Balance.plus(halfTransactionValue);

        P.join(
          assert(receiver1Balance.equals(expectedReceiver1Balance)),
          assert(receiver2Balance.equals(expectedReceiver2Balance))
        )
      })
    );
  });
});
