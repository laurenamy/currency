pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract PetToken is Pausable, ERC721Full("PetToken", "PET") {

  /***************
  GLOBAL CONSTANTS
  ***************/
  struct Pet {
    string name;
    string petType;
    uint256 age;
  }

  /***************
  INTERNAL ACCOUNTING
  ***************/

  Pet[] public pets; // array of pet structs


  /**
    * @dev Mints a pet token
    * @param _name Name of pet
    * @param _petType Type of pet
    */
  function mint(string memory _name, string memory _petType, uint256 _age) public payable whenNotPaused {
    require(bytes(_name).length != 0, "Pet must have a name");
    require(bytes(_petType).length != 0, "Pet must have a type");
    require(_age > 0, "Pet cannot be zero years old");
    Pet memory _pet = Pet({ name: _name, petType: _petType, age: _age });
    uint256 _petId = pets.push(_pet) - 1;

    _mint(msg.sender, _petId);
  }

  /**
    * @dev Returns a pet
    * @param _petId Id of the pet to be returned
    */
  function getPet(uint256 _petId) external view returns (string memory name, string memory petType, uint256 age) {
    require(_petId >= 0, "Invalid petId");
    Pet memory _pet = pets[_petId];

    name = _pet.name;
    petType = _pet.petType;
    age = _pet.age;
  }
}