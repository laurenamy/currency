pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract PetToken is Pausable, Ownable, ERC721Full("PetToken", "PET") {

  struct Pet {
    string name;
    string petType;
    uint age;
  }

  Pet[] public pets;

  function mint(string memory _name, string memory _petType, uint _age) public payable whenNotPaused {
    require(bytes(_name).length != 0, "Pet must have a name");
    require(bytes(_petType).length != 0, "Pet must have a type");
    require(_age > 0, "Pet cannot be zero years old");
    Pet memory _pet = Pet({ name: _name, petType: _petType, age: _age });
    uint _petId = pets.push(_pet) - 1;

    _mint(msg.sender, _petId);
  }

  function getPet(uint256 _petId) public view returns (string memory name, string memory petType, uint age) {
    require(_petId >= 0, "Invalid petId");
    Pet memory _pet = pets[_petId];

    name = _pet.name;
    petType = _pet.petType;
    age = _pet.age;
  }
}