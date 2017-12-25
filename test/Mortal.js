const Mortal = artifacts.require("./Mortal.sol");
const assertRevert = require('./helpers/assertRevert');

contract("Mortal", accounts => {
  const owner = accounts[0];
  const alice = accounts[1];
  let contract = null;

  beforeEach(() => {
    return Mortal.new()
      .then(_instance => contract = _instance);
  })

  it("can be closed by its owner", async () => {
    await contract.kill.sendTransaction({ from: owner });
    const currentOwner = await contract.owner();

    assert.equal(currentOwner, 0);
  });

  it("cannot be closed by anyone else", async () => {
    try {
      await contract.kill.sendTransaction({ from: alice })
      assert.fail();
    } catch(err) {
      assertRevert(err)
    }
  });
});
