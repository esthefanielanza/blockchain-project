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
import ClassContract from '../../../build/contracts/Class.json'
import getWeb3 from '../../utils/getWeb3'

import Integrations from '../../integration/integration';

const CN = 'app';

class AppComponent extends React.Component {
  state = {
    students: [],
    activities: [],
    isEditModeOn: false,
    isActivityModalOpen: false,
    isStudentModalOpen: false,
    isSaving: false,
    activityName: '',
    activityValue: 0,
    teacher: ''
  };

  componentWillMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      });

      this._instantiateContracts();
    }).catch(() => {
        console.log('Error finding web3.');
    })
  }

  _instantiateContracts() {
    const contract = require('truffle-contract');
    const classContract = contract(ClassContract);
    classContract.setProvider(this.state.web3.currentProvider);

    var classContractInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      classContract.deployed().then((instance) => {
        classContractInstance = instance;
        console.log(instance);

        // @Todo colocar a linha seguinte no modal de adicionar student.
        instance.addStudent("Marzano", "0xbB77B62bda8bD4fA9375eE00F3114249eBe4AfDE", {from: accounts[0]});

        // How to call view functions? console.log(instance.getStudent);
      }).then((result) => {
          // Do additional stuffs
      }).then((result) => {
          // Do additional stuffs
      })
    })
  }

  _getActivities(students) {
    const activities = [];
    students.forEach(student => {
      student.grades.forEach(grade => {
        activities.indexOf(grade.title) === -1 && activities.push(grade.title);
      });
    });
    return activities;
  }

  _renderStudentCard(student, key) {
    const { classes } = this.props;

    return (
      <TableRow className={classes.studentCard} key={key}>
        <TableCell component="th" scope="row">
          {`(${student.id}) ${student.name}`}
        </TableCell>
        {this._renderStudentGrades(student.grades, student.name)}
      </TableRow>
    );
  }

  _changeStudeGrade(studentGrade, activityTitle, studentName) {
    const students = this.state.students.slice();
    // Didn't like this code that much, change it if I have time //
    const newStudentsList = students.map(student => {
      if (student.name === studentName) {
        const newStudent = Object.assign({}, student);
        newStudent.grades = newStudent.grades.map(activity => {
          if (activity.title === activityTitle) {
            return { ...activity, grade: studentGrade };
          } else {
            return activity;
          }
        });
        return newStudent;
      } else {
        return student;
      }
    });

    console.log('newStudentsList', newStudentsList);
    this.setState({ students: newStudentsList });
  }

  _renderStudentGrades(grades, studentName) {
    const { classes } = this.props;

    return grades.map((grade, key) => {
      return (
        <TableCell key={key}>
          <TextField
            disabled={!this.state.isEditModeOn}
            id={grade.id}
            label={grade.title}
            onChange={event => {
              this._changeStudeGrade(event.target.value, grade.title, studentName);
            }}
          />
        </TableCell>
      );
    });
  }

  _renderHeader() {
    const { classes } = this.props;

    return [
      <div className={classes.headerContainer}>
        <CardHeader
          className={classes.cardHeader}
          title={this.state.teacher.name}
          subheader={this.state.teacher.subject}
        />
        <img className={classes.logo} src="https://www.ufmg.br/online/arquivos/anexos/UFMG%20marca%20nova.JPG" />
      </div>,
      <div className={classes.line} />
    ];
  }

  _handleSaveStudentsData() {
    this.setState({ isSaving: true });
    Integrations.saveStudentsData(this.state.students)
      .then(() => {
        console.log('Saved data!');
        this.setState({ isSaving: false });
        this.getStudents();
      })
      .catch(error => {
        this.setState({ isSaving: false, error });
      });
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
        <Typography variant="subheading" color="textSecondary" className={classes.contentTitle}>
          Alunos matriculados na disciplina - 2018/2
        </Typography>
      </div>
    );
  }

  _renderTable() {
    const { classes } = this.props;
    const { students, activities } = this.state;

    return (
      <Paper className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Alunos </TableCell>
              {activities.map((activityTitle, key) => <TableCell key={key}>{activityTitle}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>{students.map(this._renderStudentCard.bind(this))}</TableBody>
        </Table>
      </Paper>
    );
  }

  _handleAddActivity() {
    const { activityName, activityValue, students, activities } = this.state;
    const studentsList = students.slice();
    const activitiesList = activities.slice();

    studentsList.map(student => {
      const newStudent = Object.assign({}, student);
      newStudent.grades && newStudent.grades.push({ title: activityName, grade: 0, value: activityValue });
      return newStudent;
    });

    activitiesList.push(activityName);

    this.setState({
      students: studentsList,
      activities: activitiesList,
      isActivityModalOpen: false
    });
  }

  _handleAddStudent() {
    console.log('adding student', this.state.studentName);
    this.setState({ isStudentModalOpen: false });
  }

  _addActitivyModal() {
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

  _addStudentModal() {
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
                Salvar
              </Button>
            </div>
          </Paper>
        </div>
      </Modal>
    );
  }

  _getStudents() {
    Integrations.getStudentsData()
      .then(students => {
        this.setState({ students, activities: this._getActivities(students) });
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  componentDidMount() {
    Integrations.getTeacherData()
      .then(teacher => {
        this.setState({ teacher });
        this._getStudents();
      })
      .catch(error => {
        this.setState({ error: error });
      });
  }

  render() {
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

        {this._addActitivyModal()}
        {this._addStudentModal()}
      </div>
    );
  }
}

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
