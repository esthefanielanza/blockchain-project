import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import green from '@material-ui/core/colors/green';
import { TextField, Modal } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClassContract from '../../../build/contracts/Class.json';
import getWeb3 from '../../utils/getWeb3';

import { rejects } from 'assert';

const CN = 'app';

class AppComponent extends React.Component {
  state = {
    students: [],
    studentsGrades: {},
    activities: [],
    accountError: true,
    isGettingData: false,
    isEditModeOn: false,
    isActivityModalOpen: false,
    idAddActivityLoading: false,
    isStudentModalOpen: false,
    isSaving: false,
    activityName: '',
    activityValue: 0,
    studentName: '',
    studentAddress: '',
    accounts: [],
    teacherName: '',
    className: '',
    resetTable: false,
    isLoadingList: true,
    instance: undefined
  };

  // -------------------- React Lifecycle -------------------- //

  componentDidMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });
        this._instantiateContracts(web3)
          .then(() => {
            const { instance } = this.state;
            const addedStudentEvent = instance.AddedStudent();
            const addedAssignmentEvent = instance.AddedAssignment();
            const gradedAssignmentEvent = instance.GradedAssignment();

            // watch for changes
            addedStudentEvent.watch((error, result) => {
              if (!error && result) {
                const students = this.state.students.slice();
                const studentGrades = Object.assign({}, this.state.studentsGrades);
                const studentName = web3.toAscii(result.args.name).replace(/\u0000/g, '');
                const studentAddr = result.args.addr;
                if (!this._checkIfStudentExists(studentAddr)) {
                  students.push({ addr: studentAddr, name: studentName });
                  studentGrades[studentAddr] = [];
                  activities.forEach(activity => {
                    studentGrades[studentAddr][activity.id] = 0;
                  });
                }
                this.setState({ isLoadingList: false, students });
              } else {
                this.setState({ isLoadingList: false });
              }
            });

            gradedAssignmentEvent.watch((error, result) => {
              if (!error && result && this.state.resetTable) {
                this._getStudents(instance)
                  .then(() => {
                    this._getAssignments(instance);
                    this.setState({ isSaving: false });
                  })
                  .catch(() => 'Error on update table');
              } else {
                this.setState({ isLoadingList: false });
              }
            });

            addedAssignmentEvent.watch((error, result) => {
              if (!error && result) {
                const activities = this.state.activities.slice();
                const studentGrades = Object.assign({}, this.state.studentsGrades);
                const name = web3.toAscii(result.args.name).replace(/\u0000/g, '');
                const id = result.args.id.toNumber();
                const value = result.args.value.toNumber();
                if (!this._checkIfActivityExists(id)) {
                  activities.push({ name, id, value });
                  Object.keys(studentGrades).forEach(key => {
                    studentGrades[key][id] = {
                      name,
                      id,
                      value
                    };
                  });
                }
                this.setState({ isLoadingList: false, activities, studentGrades });
              } else {
                this.setState({ isLoadingList: false });
              }
            });
          })
          .catch(error => {
            console.log('Initiate Contract', error);
          });
      })
      .catch(err => {
        console.log('Error finding web3.', err);
      });
  }

  // -------------------- Contracts Integration -------------------- //

  _instantiateContracts() {
    return new Promise((resolve, reject) => {
      const contract = require('truffle-contract');
      const classContract = contract(ClassContract);
      classContract.setProvider(this.state.web3.currentProvider);

      let classContractInstance;
      // Get accounts.
      this.state.web3.eth.getAccounts((error, accounts) => {
        if (accounts.length !== 0){
          this.setState({ accountError: false });
        }

        classContract
          .deployed()
          .then(instance => {
            console.log('Initiate Contract Success', instance);
            classContractInstance = instance;

            this.setState({ accounts, instance });
            this._getClassData(instance);
            this._getStudents(instance)
              .then(() => {
                this._getAssignments(instance)
                  .then(resolve)
                  .catch(reject);
              })
              .catch(reject);
          })
          .catch(error => {
            console.log('Initiate Contract Error', error);
            this.setState({ error });
            reject();
          });
      });
    });
  }

  _checkIfStudentExists(addr) {
    const students = this.state.students;
    const studentsLength = students.length;

    for (let i = 0; i < studentsLength; i++) {
      if (addr === students[i].addr) {
        return true;
      }
    }
    return false;
  }

  _checkIfActivityExists(id) {
    const activities = this.state.activities;
    const activitiesLength = activities.length;

    for (let i = 0; i < activitiesLength; i++) {
      if (id === activities[i].id) {
        return true;
      }
    }
    return false;
  }

  _handleAddStudent() {
    const { instance, accounts, studentName, studentAddress } = this.state;
    this.setState({ isAddStudentLoading: true });

    instance
      .addStudent(studentName, studentAddress, { from: accounts[0] })
      .then(res => {
        this.setState({ isAddStudentLoading: false, isStudentModalOpen: false, isLoadingList: true });
        // We need to call get students again after we add a new student! //
      })
      .catch(error => {
        console.log('Added student Error', error);
        this.setState({ isAddStudentLoading: false, error });
      });
  }

  _handleAddActivity() {
    const { instance, accounts, activityName, activityValue } = this.state;
    this.setState({ isAddingActivity: true });

    instance
      .addAssignment(activityName, activityValue, { from: accounts[0] })
      .then(res => {
        this.setState({ isActivityModalOpen: false, isAddingActivity: false, isLoadingList: true });
      })
      .catch(error => {
        console.log('Added activity error', error);
        this.setState({ isActivityModalOpen: false, isAddingActivity: false, error });
      });
  }

  _getAssignments(instance) {
    this.setState({ isGettingData: true });
    return new Promise((resolve, reject) => {
      const promises = [];
      const activities = [];

      instance
        .getNumberOfAssignments()
        .then(n => {
          for (let i = 0; i < n; i++) {
            promises.push(
              instance
                .assignments(i)
                .then(assignment => {
                  const name = web3.toAscii(assignment[0]).replace(/\u0000/g, '');
                  const value = assignment[1].toNumber()/100;
                  activities.push({ name, id: i, value });
                })
                .catch(error => {
                  this.setState({ error });
                  console.log('Get Student Error', error);
                })
            );
          }

          Promise.all(promises)
            .then(() => {
              this.setState({ activities, isLoadingList: false });
              resolve();
            })
            .catch(reject);
        })
        .catch(error => this.setState({ error }));
    });
  }

  _getClassData(instance) {
    instance
      .teacherName()
      .then(data => {
        const teacherName = web3.toAscii(data).replace(/\u0000/g, '');
        this.setState({ teacherName });
      })
      .catch(error => {
        console.log('Error while getting teacher name', error);
      });
    instance
      .className()
      .then(data => {
        const className = web3.toAscii(data).replace(/\u0000/g, '');
        this.setState({ className });
      })
      .catch(error => console.log('Error while getting class name', error));
  }

  _getStudents(instance) {
    this.setState({ isGettingData: true });
    return new Promise((resolve, reject) => {
      const promises = [];
      const students = [];
      const studentsGrades = {};

      instance
        .getNumberOfStudents()
        .then(n => {
          for (let i = 0; i < n; i++) {
            promises.push(
              instance
                .students(i)
                .then(student => {
                  instance
                    .getStudent(student[0])
                    .then(data => {
                      const studentName = web3.toAscii(student[1]).replace(/\u0000/g, '');
                      students.push({ addr: student[0], name: studentName });
                      for (let j = 0; j < data[1].length; j++) {
                        if (studentsGrades[student[0]] === undefined) {
                          studentsGrades[student[0]] = [];
                        }
                        studentsGrades[student[0]][j] = {
                          grade: data[1][j].toNumber()/100,
                          id: j
                        };
                      }
                    })
                    .catch(err => console.log('err', err));
                })
                .catch(error => {
                  this.setState({ error });
                  console.log('Student Error', error);
                })
            );
          }

          Promise.all(promises)
            .then(() => {
              this.setState({ students, studentsGrades, isLoadingList: false, resetTable: false });
              resolve();
            })
            .catch(err => {
              console.log('Promise all error', error);
              reject();
            });
        })
        .catch(error => this.setState({ error }));
    });
  }

  _handleSaveStudentsData() {
    this.setState({ isSaving: true });

    return new Promise((resolve, reject) => {
      const { studentsGrades, instance, accounts } = this.state;
      const promises = [];
      Object.keys(studentsGrades).forEach(addr => {
          const studentGrades = studentsGrades[addr].map(assignment => assignment.grade*100);
          promises.push(
              instance
              .gradeAssignments(addr, studentGrades, {
                  from: accounts[0]
              })
              .catch(err => console.log('Error while saving grades for student', err))
          );
      });

      Promise.all(promises)
        .then(() => {
          this.setState({ resetTable: true });
        })
        .catch(reject);
    });
  }

  // -------------------- Handle Front Data -------------------- //
  _changeStudentGrade(grade, activityName, activityId, studentAddr) {
    const studentsGrades = Object.assign({}, this.state.studentsGrades);
    const newGrade = {
      name: activityName,
      grade: grade,
      id: activityId
    };

    if (studentsGrades[studentAddr]) {
      studentsGrades[studentAddr][activityId] = newGrade;
    } else {
      studentsGrades[studentAddr] = [];
      studentsGrades[studentAddr][activityId] = newGrade;
    }

    this.setState({ studentsGrades });
  }

  // -------------------- Render Functions -------------------- //

  _renderStudentCard(student, key) {
    const { classes } = this.props;

    return (
      <TableRow className={classes.studentCard} key={key}>
        <TableCell component="th" scope="row">
          {student.name}
        </TableCell>
        {this._renderStudentGrades(student.addr)}
      </TableRow>
    );
  }

  _renderStudentGrades(studentAddr) {
    const { classes } = this.props;
    const grades = this.state.activities;
    return grades.map(grade => {
      const studentGrade = this.state.studentsGrades[studentAddr][grade.id].grade;
      return (
        <TableCell key={grade.id}>
          <TextField
            value={studentGrade === undefined ? '0' : studentGrade}
            disabled={!this.state.isEditModeOn}
            onChange={event => {
              this._changeStudentGrade(event.target.value, grade.name, grade.id, studentAddr);
            }}
          />
        </TableCell>
      );
    });
  }

  _renderHeader() {
    const { classes } = this.props;
    const { instance } = this.state;

    return [
      <div className={classes.headerContainer}>
        <CardHeader className={classes.cardHeader} title={this.state.teacherName} subheader={this.state.className} />
        <img className={classes.logo} src="https://www.ufmg.br/online/arquivos/anexos/UFMG%20marca%20nova.JPG" />
      </div>,
      <div className={classes.line} />
    ];
  }

  _renderSubHeader() {
    const { classes } = this.props;
    const { isEditModeOn } = this.state;

    return (
      <div className={classes.contentHeader}>
        <Button
          variant="outlined"
          className={classes.button}
          onClick={() => this.setState({ isActivityModalOpen: true })}
        >
          Adicionar Atividade
        </Button>
        <Button
          variant="outlined"
          style={{ backgroundColor: isEditModeOn && green[500], color: isEditModeOn && 'white' }}
          onClick={() => this.setState({ isEditModeOn: !isEditModeOn })}
          className={classes.button}
        >
          Editar Nota
        </Button>
        <Button
          variant="contained"
          disabled={isEditModeOn}
          style={{ backgroundColor: !isEditModeOn && green[500], color: 'white' }}
          className={classes.button}
          onClick={this._handleSaveStudentsData.bind(this)}
        >
          {!this.state.isSaving ? <div>Salvar</div> : <CircularProgress style={{ color: 'white' }} size={20} />}
        </Button>
        {/* <Typography variant="subheading" color="textSecondary" className={classes.contentTitle}>
          Alunos matriculados na disciplina - 2018/2
        </Typography> */}
      </div>
    );
  }

  _renderTable() {
    const { classes } = this.props;
    const { students, activities, isLoadingList } = this.state;
    if (isLoadingList) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress style={{ color: green[500] }} size={200} />
        </div>
      );
    } else {
      return (
        <Paper className={classes.tableWrapper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell> Alunos </TableCell>
                {activities.map((activity, key) => (
                  <TableCell>
                    {activity.name} ({activity.value})
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{students.map(this._renderStudentCard.bind(this))}</TableBody>
          </Table>
        </Paper>
      );
    }
  }

  _renderAddActitivyModal() {
    const { classes } = this.props;
    return (
      <Modal open={this.state.isActivityModalOpen} onClose={() => this.setState({ isActivityModalOpen: false })}>
        <div className={classes.modalContainer}>
          <Paper className={classes.modal}>
            <Typography className={classes.modalTitle} variant="title">
              Adicione uma Atividade
            </Typography>
            <TextField
              className={classes.modalTextField}
              id="activity"
              label="Nome da Atividade"
              onChange={event => this.setState({ activityName: event.target.value })}
            />
            <TextField
              className={classes.modalTextField}
              id="value"
              label="Valor"
              onChange={event => {
                this.setState({ activityValue: event.target.value });
              }}
            />
            <div className={classes.modalFooter}>
              <Button
                variant="outlined"
                className={classes.button}
                onClick={() => this.setState({ isActivityModalOpen: false })}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: green[500], color: 'white' }}
                className={classes.button}
                onClick={this._handleAddActivity.bind(this)}
              >
                Salvar
              </Button>
            </div>
          </Paper>
        </div>
      </Modal>
    );
  }

  _renderAddStudentModal() {
    const { classes } = this.props;
    return (
      <Modal open={this.state.isStudentModalOpen} onClose={() => this.setState({ isStudentModalOpen: false })}>
        <div className={classes.modalContainer}>
          <Paper className={classes.modal}>
            <Typography className={classes.modalTitle} variant="title">
              Adicione um Novo Aluno
            </Typography>
            <TextField
              className={classes.modalTextField}
              id="activity"
              label="Nome do Aluno"
              onChange={event => this.setState({ studentName: event.target.value })}
            />
            <TextField
              className={classes.modalTextField}
              id="activity"
              label="Endereço do Aluno"
              onChange={event => this.setState({ studentAddress: event.target.value })}
            />
            <div className={classes.modalFooter}>
              <Button
                variant="outlined"
                className={classes.button}
                onClick={() => this.setState({ isStudentModalOpen: false })}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: green[500], color: 'white' }}
                className={classes.button}
                onClick={this._handleAddStudent.bind(this)}
              >
                {!this.state.isAddStudentLoading ? 'Salvar' : <CircularProgress style={{ color: 'white' }} size={20} />}
              </Button>
            </div>
          </Paper>
        </div>
      </Modal>
    );
  }

  render() {
    const { classes } = this.props;
    const { accountError } = this.state;

    if (accountError) {
      return (
          <div className={classes.root}>
            <div className={classes.container}>
              <Card className={classes.card}>
                  {this._renderHeader()}
                  <CardContent className={classes.cardContent}>
                      <Typography variant="headline" component="h2">
                      MetaMask Locked
                      </Typography>
                      Por favor desbloqueie seu MetaMask para interagir com a aplicação.
                  </CardContent>
              </Card>
            </div>
          </div>
      );
    } else {
        return (
          <div className={classes.root}>
            <div className={classes.container}>
              <Card className={classes.card}>
                {this._renderHeader()}
                {this._renderSubHeader()}
                <CardContent className={classes.cardContent}>{this._renderTable()}</CardContent>
              </Card>
            </div>
            <Button
              className={classes.fabButton}
              variant="fab"
              color="primary"
              aria-label="Adicionar Aluno"
              onClick={() => {
                this.setState({ isStudentModalOpen: true });
              }}
            >
              <AddIcon />
            </Button>

            {this._renderAddActitivyModal()}
            {this._renderAddStudentModal()}
          </div>
        );
    }
  }
}

// -------------------- Styling -------------------- //

const styles = theme => ({
  root: {
    backgroundColor: 'rgba(237,237,237,0.2)',
    position: 'relative'
  },
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerContainer: {
    position: 'relative'
  },
  contentTitle: {
    position: 'absolute',
    right: 120
  },
  logo: {
    height: '35px',
    position: 'absolute',
    top: '18px',
    right: '24px'
  },
  gradeInput: {
    width: '30px'
  },
  contentHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '24px',
    paddingRight: '24px',
    paddingLeft: '24px',
    marginBottom: '24px'
  },
  button: {
    marginRight: '20px',
    color: green[500]
  },
  card: {
    width: '90%',
    minHeight: '800px'
  },
  cardHeader: {
    marginBottom: '10px'
  },
  cardContent: {
    padding: '24px'
  },
  line: {
    backgroundColor: green[500],
    height: '3px'
  },
  studentCard: {
    padding: '10px'
  },
  fabButton: {
    position: 'absolute',
    backgroundColor: green[500],
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2
  },
  modal: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing.unit * 50,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    pointerEvents: 'auto'
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    pointerEvents: 'None'
  },
  modalTitle: {
    marginBottom: '24px'
  },
  modalTextField: {
    marginBottom: '10px'
  },
  modalFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px'
  },
  tableWrapper: {
    overflowX: 'auto',
    paddingBottom: '20px'
  }
});

export default withStyles(styles)(AppComponent);
