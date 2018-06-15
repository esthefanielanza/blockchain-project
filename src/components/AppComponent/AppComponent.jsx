import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import green from'@material-ui/core/colors/green';

const CN = 'app';

class AppComponent extends React.Component {
	render() {
		const { classes } = this.props;

		return (
		<div className={classes.root}>
			<div className={classes.container}>
				<Card className={classes.card}>
					<div className={classes.headerContainer}> 
						<CardHeader className={classes.cardHeader} title="Professor Jeroen Van De Graff" subheader="Blockchain e Criptomoedas" />
						<img className={classes.logo} src="https://www.ufmg.br/online/arquivos/anexos/UFMG%20marca%20nova.JPG" />
					</div>
					<div className={classes.line}/>
					<CardContent className={classes.cardContent}>
						<div className={classes.contentHeader}>
							<Button variant="outlined" className={classes.button}> Adicionar Atividade </Button>
							<Button variant="outlined" className={classes.button}> Editar Nota </Button>
							<Typography variant="subheading" color="textSecondary" className={classes.contentTitle}>Alunos matriculados na disciplina - 2018/2</Typography>
						</div>
						<Card className={classes.studentCard}> <CardHeader subheader="(2015112736) Uzumaki Naruto" /> </Card>
						<Card className={classes.studentCard}> <CardHeader subheader="(2015112736) Uzumaki Naruto" /> </Card> 	
						<Card className={classes.studentCard}> <CardHeader subheader="(2015112736) Uzumaki Naruto" /> </Card> 	
					</CardContent>
				</Card>
			</div>
			<Button className={classes.fabButton} variant="fab" color="primary" aria-label="Adicionar Aluno"> <AddIcon /> </Button>
		</div>
		);
	}
}

const styles = theme => ({
	root: {
		backgroundColor: "rgba(237,237,237,0.2)",
		position: "relative"
	},
	container: {
		height: "100vh",
    display: "flex",
    alignItems: "center",
		justifyContent: "center",
	},
	headerContainer: {
		position: "relative"
	},
	contentTitle: {
		position: "absolute",
		right: 100
	},
	logo: {
		height: "35px",
		position: "absolute",
		top: "18px",
		right: "24px"
	},
	contentHeader: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: "24px",
	},
	button: {
		marginRight: "20px",
		color: green[500]
	},
	card: {
		width: "90%",
		minHeight: "800px"
	},
	cardHeader: {
		marginBottom: "10px",
	},
	cardContent: {
		padding: "24px"
	},
	line: {
		backgroundColor: green[500],
    height: "3px"
	},
	studentCard: {
		minHeight: "50px",
	},
	fabButton: {
		position: "absolute",
		backgroundColor: green[500],
		bottom: theme.spacing.unit * 2,
		right: theme.spacing.unit * 2
	}
});

export default withStyles(styles)(AppComponent);