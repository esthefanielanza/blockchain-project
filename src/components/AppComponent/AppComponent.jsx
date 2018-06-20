import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
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
    teacher: '',
    isLoadingList: true,
    instance: undefined
  };

  // -------------------- React Lifecycle -------------------- //

  componentDidMount() {
    getWeb3
      .then(results => {
        console.log('results', results);
        this.setState({
          web3: results.web3
        });
        this._instantiateContracts(web3)
          .then(() => {
            const { instance } = this.state;
            const addedStudentEvent = instance.AddedStudent();
            const addedAssignmentEvent = instance.AddedAssignment();

            // watch for changes
            addedStudentEvent.watch((error, result) => {
              if (!error && result) {
                const students = this.state.students.slice();
                const studentName = web3.toAscii(result.args.name).replace(/\u0000/g, '');
                const studentAddr = result.args.addr;
                if (!this._checkIfStudentExists(studentAddr)) {
                  students.push({ addr: studentAddr, name: studentName });
                }
                this.setState({ isLoadingList: false, students });
              } else {
                this.setState({ isLoadingList: false });
              }
            });

            addedAssignmentEvent.watch((error, result) => {
              console.log('result assignment', result);
              if (!error && result) {
                const activities = this.state.activities.slice();
                const name = web3.toAscii(result.args.name).replace(/\u0000/g, '');
                const id = result.args.id.toNumber();
                const value = result.args.value.toNumber();
                if (!this._checkIfActivityExists(id)) {
                  activities.push({ name, id, value });
                }
                this.setState({ isLoadingList: false, activities });
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
        console.log('err', err);
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
      console.log('getting accounts', classContract);
      this.state.web3.eth.getAccounts((error, accounts) => {
        console.log('got accounts', accounts);
        classContract
          .deployed()
          .then(instance => {
            console.log('Initiate Contract Success');
            classContractInstance = instance;

            this.setState({ accounts, instance });

            this._getStudents(instance)
              .then(() => {
                this._getActivities(instance)
                  .then(resolve)
                  .catch(reject);
              })
              .catch(reject);

            // How to call view functions? console.log(instance.getStudent);
          })
          .catch(error => {
            console.log('Initiate Contract Error', error);
            this.setState({ error });
            rejec();
          });
      });
    });
  }

  _checkIfStudentExists(addr) {
    const students = this.state.students;
    const studentsLength = students.length;
    console.log('this.state.students', students);
    console.log('addr', addr);
    for (let i = 0; i < studentsLength; i++) {
      console.log('student[i].addr', students[i].addr);
      if (addr === students[i].addr) {
        return true;
      }
    }
    return false;
  }

  _checkIfActivityExists(id) {
    const activities = this.state.activities;
    const activitiesLength = activities.length;
    console.log('this.state.activities', activities);
    console.log('addr', id);
    for (let i = 0; i < activitiesLength; i++) {
      console.log('student[i].addr', activities[i].id);
      if (id === activities[i].id) {
        return true;
      }
    }
    return false;
  }

  _handleAddStudent() {
    console.log('Adding Student');

    const { instance, accounts, studentName, studentAddress } = this.state;
    this.setState({ isAddStudentLoading: true });

    instance
      .addStudent(studentName, studentAddress, { from: accounts[0] })
      .then(res => {
        console.log('Added Student Res', res);
        this.setState({ isAddStudentLoading: false, isStudentModalOpen: false, isLoadingList: true });
        // We need to call get students again after we add a new student! //
      })
      .catch(error => {
        console.log('Added student Error', error);
        this.setState({ isAddStudentLoading: false, error });
      });
  }

  _handleAddActivity() {
    console.log('Adding Activity');

    const { instance, accounts, activityName, activityValue } = this.state;
    this.setState({ isAddingActivity: true });

    instance
      .addAssignment(activityName, activityValue, { from: accounts[0] })
      .then(res => {
        console.log('Added activity res', res);
        this.setState({ isActivityModalOpen: false, isAddingActivity: false, isLoadingList: true });
      })
      .catch(error => {
        console.log('Added activity error', error);
        this.setState({ isActivityModalOpen: false, isAddingActivity: false, error });
      });
  }

  _getActivities(instance) {
    console.log('GETTING Activities!!!!');
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
                  console.log('ASSIGNMENT!', assignment);
                  const name = web3.toAscii(assignment[0]).replace(/\u0000/g, '');
                  const value = assignment[1].toNumber();
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
              console.log('GOT ALL ACTIVITIES!!!');
              this.setState({ activities, isLoadingList: false });
              resolve();
            })
            .catch(reject);
        })
        .catch(error => this.setState({ error }));
    });
  }

  _getStudents(instance) {
    console.log('GETTING STUDENTS!!!!');
    this.setState({ isGettingData: true });
    return new Promise((resolve, reject) => {
      const promises = [];
      const students = [];

      instance
        .getNumberOfStudents()
        .then(n => {
          for (let i = 0; i < n; i++) {
            promises.push(
              instance
                .students(i)
                .then(student => {
                  console.log('student', student);
                  const studentName = web3.toAscii(student[1]).replace(/\u0000/g, '');
                  students.push({ addr: student[0], name: studentName });
                })
                .catch(error => {
                  this.setState({ error });
                  console.log('Get Student Error', error);
                })
            );
          }

          Promise.all(promises)
            .then(() => {
              console.log('GOT ALL STUDENTS!!!');
              this.setState({ students, isLoadingList: false });
              resolve();
            })
            .catch(reject);
        })
        .catch(error => this.setState({ error }));
    });
  }

  _handleSaveStudentsData() {
    console.log('Saving data!');
    this.setState({ isSaving: true });

    return new Promise((resolve, reject) => {
      const { studentsGrades, instance, accounts } = this.state;
      const promises = [];

      Object.keys(studentsGrades).forEach(addr => {
        studentsGrades[addr].forEach(assignment => {
          promises.push(
            instance.gradeAssignment(addr, web3.toBigNumber(assignment.id), web3.toBigNumber(assignment.grade), {
              from: accounts[0]
            })
          );
        });
      });

      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }

  // -------------------- Handle Front Data -------------------- //
  _changeStudeGrade(grade, activityName, activityId, studentAddr) {
    const studentsGrades = Object.assign({}, this.state.studentsGrades);
    const newGrade = {
      name: activityName,
      grade: grade
    };

    if (studentsGrades[studentAddr]) {
      studentsGrades[studentAddr][activityId] = newGrade;
    } else {
      studentsGrades[studentAddr] = [newGrade];
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
      return (
        <TableCell key={grade.id}>
          <TextField
            disabled={!this.state.isEditModeOn}
            label={grade.name}
            onChange={event => {
              this._changeStudeGrade(event.target.value, grade.name, grade.id, studentAddr);
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
        <CardHeader
          className={classes.cardHeader}
          title={instance && instance.teacherName}
          subheader={instance && instance.className}
        />
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
      console.log('this.state.activities', this.state.activities);
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
    console.log('render');
    const { classes } = this.props;

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
