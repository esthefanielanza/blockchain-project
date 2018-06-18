pragma solidity ^0.4.18;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Class is Ownable {

    // @todo This is a draft that needs to be worked on.

    struct Assignment {
        uint id;
        bytes32 name;
    }

    mapping (address => bool) students;
    mapping (uint => Assignment) assignments;

    modifier validStudent(uint student) {
        // Check student existance
        _
    }

    modifier validAssignment(uint assignment) {
        // Check bounds for assignment
        _
    }

    modifier validAssignmentGrade(uint assignment, uint grade) {
        // Check bounds for assignment
        _
    }

    function addAssignment(bytes32 name) {
        // Add assignment
    }

    function gradeAssignment(address student, uint assignment, uint grade) public
      onlyOwner
      validStudent(student)
      validAssignment(assignment) 
      validAssignmentGrade(assignment, grade) {
        // Something
    }
}
