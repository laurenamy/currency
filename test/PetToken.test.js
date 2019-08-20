const { expectThrow, expectRevert, BN, expectEvent, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');

const PetToken = artifacts.require('PetToken');
const web3 = new Web3(Web3.givenProvider);

contract('PetToken', function (accounts) {
  const tokenOwner = accounts[0];
  const petName = 'fido';
  const petType = 'dog';
  const petAge = new BN(4);
  const petInfo = { name: petName, petType: petType, age: petAge };

  beforeEach(async function () {
    pet = await PetToken.new();
    petAddress = pet.address;
    petInstance = await PetToken.at(petAddress);
  });

  describe("mint", async function () {
    it('should revert if no name is given', async function () {
      await expectRevert(pet.mint("", petType, petAge, { from: tokenOwner }), "Pet must have a name");
    });
    it('should revert if no type is given', async function () {
      await expectRevert(pet.mint(petName, "", petAge, { from: tokenOwner }), "Pet must have a type");
    });
    it('should revert if age is not greater than zero', async function () {
      await expectRevert(pet.mint(petName, petType, new BN(0), { from: tokenOwner }), "Pet cannot be zero years old.");
    });
    it('should create a pet token with the specified attributes', async function () {
      let { logs } = await pet.mint(petName, petType, petAge, { from: tokenOwner });
      let petId = logs[0].args.tokenId.toNumber();
      let petToken = await pet.getPet(petId);
      assert.equal(petToken.name, petName);
      assert.equal(petToken.petType, petType);
      assert.equal(petToken.age.toNumber(), petAge.toNumber());
    });
    it('should revert if the contract is paused', async function () {
      pet.pause()
      await expectRevert(pet.mint(petName, petType, petAge), 'Pausable: paused');
    })
  });
});