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

const CN = 'app';

class AppComponent extends React.Component {
  state = {
    activities: [],
    isEditModeOn: false,
    isActivityModalOpen: false
  };

  _getActivities(students) {
    const activities = [];
    students.forEach(student => {
      student.grades.forEach(grade => {
        activities.indexOf(grade.title) === -1 && activities.push(grade.title);
      });
    });
    this.setState({ activities });
  }

  _getStudents() {
    return [
      {
        name: 'Uzumaki Naruto',
        id: '2015112736',
        grades: [{ id: '1', title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Uchiha Sasuke',
        id: '2015112736',
        grades: [{ id: '1', title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Haruno Sakura',
        id: '2015112736',
        grades: [{ id: '1', title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Suna no Gaara',
        id: '2015112736',
        grades: [{ id: '1', title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Nara Shikamaru',
        id: '2015112736',
        grades: [{ id: '1', title: 'Prova 1', grade: '14', value: '20' }]
      }
    ];
  }

  _renderStudentCard(student, key) {
    const { classes } = this.props;

    return (
      <TableRow className={classes.studentCard} key={key}>
        <TableCell component="th" scope="row">
          {`(${student.id}) ${student.name}`}
        </TableCell>
        {this._renderStudentGrades(student.grades)}
      </TableRow>
    );
  }

  _renderStudentGrades(grades) {
    const { classes } = this.props;

    return grades.map((grade, key) => {
      return (
        <TableCell key={key}>
          <TextField disabled={!this.state.isEditModeOn} id={grade.id} label={grade.title} onChange={() => {}} />
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
          title="Professor Jeroen Van De Graff"
          subheader="Blockchain e Criptomoedas"
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
        >
          Salvar
        </Button>
        <Typography variant="subheading" color="textSecondary" className={classes.contentTitle}>
          Alunos matriculados na disciplina - 2018/2
        </Typography>
      </div>
    );
  }

  _renderTable() {
    const { classes } = this.props;
    const students = this._getStudents();

    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Alunos </TableCell>
              {this.state.activities.map((activityTitle, key) => <TableCell key={key}>{activityTitle}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>{students.map(this._renderStudentCard.bind(this))}</TableBody>
        </Table>
      </Paper>
    );
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
            <TextField className={classes.modalTextField} id="activity" label="Nome da Atividade" onChange={() => {}} />
            <TextField className={classes.modalTextField} id="value" label="Valor" onChange={() => {}} />
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
                onClick={() => this.setState({ isActivityModalOpen: false })}
              >
                Salvar
              </Button>
            </div>
          </Paper>
        </div>
      </Modal>
    );
  }

  componentDidMount() {
    const students = this._getStudents();
    this._getActivities(students);
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
        <Button className={classes.fabButton} variant="fab" color="primary" aria-label="Adicionar Aluno">
          <AddIcon />
        </Button>

        {this._addActitivyModal()}
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
  }
});

export default withStyles(styles)(AppComponent);
