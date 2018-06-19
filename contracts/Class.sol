pragma solidity ^0.4.18;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Class is Ownable {

    // @todo This is a draft that needs to be worked on.
    // @todo Add check to validAssignmentGrade to make sure sum(assignment grades) <= 100

    struct Student {
        address addr;
        bytes32 name;
        uint[] grades;
    }

    struct Assignment {
        bytes32 name;
        uint value;
    }

    mapping (address => uint) public studentAddressToIdx;
    Student[] public students;
    Assignment[] public assignments;

    modifier validStudent(address addr) {
        require(studentAddressToIdx[addr] != 0);
        _;
    }

    modifier validAssignment(uint id) {
        require(id < assignments.length);
        _;
    }

    modifier validAssignmentGrade(uint assignment, uint grade) {
        require(grade >= 0 && grade <= assignments[assignment].value);
        _;
    }

    modifier validGrade(uint grade) {
        require(grade >= 0 && grade <= 100);
        _;
    }

    function getStudent(address addr) public view
      validStudent(addr)
      returns (bytes32 name, uint[] grades) {
        Student storage student = students[studentAddressToIdx[addr]];
        return (student.name, student.grades);
    }

    function addStudent(bytes32 name, address addr) public
      onlyOwner
      returns (uint) {
        Student memory student;
        student.name = name;
        student.addr = addr;

        students.push(student);
        studentAddressToIdx[addr] = students.length;

        return studentAddressToIdx[addr] - 1;
    }

    function addAssignment(bytes32 name, uint value) public
      validGrade(value) {
        Assignment memory assignment = Assignment({name: name, value: value});
        assignments.push(assignment);
    }

    function gradeAssignment(address addr, uint assignment, uint grade) public
      onlyOwner
      validStudent(addr)
      validAssignment(assignment)
      validAssignmentGrade(assignment, grade) {
        uint idx = studentAddressToIdx[addr] - 1;

        Student storage student = students[idx];
        student.grades[assignment] = grade;
    }
}
