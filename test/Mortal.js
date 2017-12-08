const Mortal = artifacts.require("./Mortal.sol");
const P = require("bluebird");

const getBalance = P.promisify(web3.eth.getBalance);
const sendTransaction = P.promisify(web3.eth.sendTransaction);

contract("Splitter", accounts => {
  const owner = accounts[0];
  const alice = accounts[1];
  let contract = null;

  beforeEach(() => {
    return Mortal.new()
      .then(_instance => contract = _instance);
  })

  it("can be closed by its owner", () => {
    return contract.kill.sendTransaction({ from: owner })
      .then(() =>
        contract.owner()
      )
      .then(currentOwner =>
        assert.equal(currentOwner, 0)
      );
  });

  it("cannot be closed by anyone else", () => {
    return contract.kill.sendTransaction({ from: alice })
      .then(result =>
        assert(false)
      )
      .catch(ex =>
        assert(true)
      )
      .then(() =>
        contract.owner()
      )
      .then(currentOwner =>
        assert.equal(currentOwner, owner)
      );
  });
});
