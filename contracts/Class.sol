pragma solidity ^0.4.18;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Class is Ownable {

    // @todo This is a draft that needs to be worked on.
    // @todo Make sure all teacher methods have onlyOwner!!!

    struct Student {
        address addr;
        bytes32 name;
        mapping (uint => uint) grades;
    }

    struct Assignment {
        bytes32 name;
        uint value;
    }

    mapping (address => uint) public studentAddressToIdx;
    Student[] public students;
    Assignment[] public assignments;
    uint public gradeTotal;

    event AddedStudent(bytes32 name, address addr);
    event AddedAssignment(uint id, bytes32 name, uint value);
    event GradedAssignment(address addr, uint assignment, uint grade);

    modifier validStudent(address addr) {
        require(studentAddressToIdx[addr] != 0);
        _;
    }

    modifier validAssignment(uint id) {
        require(id < assignments.length);
        _;
    }

    modifier validAssignmentGrade(uint assignment, uint grade) {
        require(grade <= assignments[assignment].value);
        _;
    }

    modifier validGrade(uint grade) {
        require(grade >= 0 && grade + gradeTotal <= 10000);
        _;
    }

    
    function getNumberOfStudents() public view
      returns (uint) {
        return students.length;
    }

    function getNumberOfAssignments() public view
      returns (uint) {
        return assignments.length;
    }

    function getStudent(address addr) public view
      validStudent(addr)
      returns (bytes32, uint[]) {
        Student storage student = students[studentAddressToIdx[addr] - 1];

        // Grades is a mapping. We convert to array to return its' values.
        uint[] gradesArray;
        for (uint i = 0; i < assignments.length; i++) {
            gradesArray.push(student.grades[i]);
        }

        return (student.name, gradesArray);
    }

    function addStudent(bytes32 name, address addr) public
      onlyOwner
      returns (uint) {
        Student memory student;
        student.name = name;
        student.addr = addr;

        students.push(student);
        studentAddressToIdx[addr] = students.length;

        emit AddedStudent(name, addr);
        return studentAddressToIdx[addr] - 1;
    }

    function addAssignment(bytes32 name, uint value) public
      onlyOwner
      validGrade(value)
      returns (uint) {
        gradeTotal+= value;
        Assignment memory assignment = Assignment({name: name, value: value});
        assignments.push(assignment);

        emit AddedAssignment(assignments.length - 1, name, value);
        return assignments.length - 1;
    }

    function gradeAssignment(address addr, uint assignment, uint grade) public
      onlyOwner
      validStudent(addr)
      validAssignment(assignment)
      validAssignmentGrade(assignment, grade) {
        uint idx = studentAddressToIdx[addr] - 1;

        Student storage student = students[idx];
        student.grades[assignment] = grade;

        emit GradedAssignment(addr, assignment, grade);
    }
}
