import React from 'react';
// import firebase from '../../firebase';

import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import "../App.css";
const moment = require('moment');
const firebase = require('../../firebase');
class Register extends React.Component {
	state = {
		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
	};

	isFormValid = () => {
		let errors = [];
		let error;
		if (this.isFormEmpty(this.state)) {
			error = { message: 'Fill in all fields' };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else if (!this.isPasswordValid(this.state)) {
			error = { message: 'Password is invalid' };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else {
			return true;
		}
	};

	isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
		return !username.length || !email.length || !password.length || !passwordConfirmation.length;
	};

	isPasswordValid = ({ password, passwordConfirmation }) => {
		if (password.length < 6 || passwordConfirmation.length < 6) {
			return false;
		} else if (password !== passwordConfirmation) {
			return false;
		} else {
			return true;
		}
	};

	handleChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.isFormValid()) {
			this.setState({ errors: [], loading: true });
			firebase
				.auth()
				.createUserWithEmailAndPassword(this.state.email, this.state.password)
				.then((createdUser) => {
					console.log(createdUser);
					createdUser.user
						.updateProfile({
							displayName: this.state.username
						})
						.then(() => {
							this.saveUser(createdUser).then(() => {
								this.handleEmailVerification();
							});
						})
						.catch((err) => {
							console.error(err);
							this.setState({ errors: this.state.errors.concat(err), loading: false });
						});
				})
				.catch((err) => {
					console.error(err);
					this.setState({ errors: this.state.errors.concat(err), loading: false });
				});
		}
    };
    
    saveUser = createdUser => {
		const now = moment().format("L");
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
			email: createdUser.user.email,
			lastSignIn: now
        })
	}
	
	handleEmailVerification = () => {
        const user = firebase.auth().currentUser;
        user.sendEmailVerification().then(() => {
            console.log('email sent')
        }).catch(err => {
            console.error(err)
        })
    }

	displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

	handleInputError = (errors, inputName) => {
		return errors.some((error) => error.message.toLowerCase().includes(inputName)) ? 'error' : '';
	};

	handleAnonymous = () => {
		firebase
			.auth()
			.signInAnonymously()
			.catch(err => {
				console.error(err.message);
				this.setState({ errors: this.state.errors.concat(err) });
			})
	}

	render() {
		const { username, email, password, passwordConfirmation, errors, loading } = this.state;

		return (
			<Grid textAlign="center" verticalAlign="middle" className="signup__grid" style={{marginTop: "10%"}}>
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="blue" textAlign="center">
						<Icon name="puzzle piece" color="blue" />
						Register for Car Tracker
					</Header>
					<Form onSubmit={this.handleSubmit} size="large">
						<Segment stacked>
							<span id="register__message">You will be sent an email verification link upon registration</span>
							<Form.Input
								fluid
								name="username"
								icon="user"
								iconPosition="left"
								placeholder="Username"
								onChange={this.handleChange}
								value={username}
								className={this.handleInputError(errors, 'username')}
								type="text"
							/>
							<Form.Input
								fluid
								name="email"
								icon="mail"
								iconPosition="left"
								placeholder="Email address"
								onChange={this.handleChange}
								value={email}
								className={this.handleInputError(errors, 'email')}
								type="email"
							/>
							<Form.Input
								fluid
								name="password"
								icon="lock"
								iconPosition="left"
								placeholder="Password"
								onChange={this.handleChange}
								value={password}
								className={this.handleInputError(errors, 'password')}
								type="password"
							/>
							<Form.Input
								fluid
								name="passwordConfirmation"
								icon="repeat"
								iconPosition="left"
								placeholder="Password Confirmation"
								onChange={this.handleChange}
								value={passwordConfirmation}
								className={this.handleInputError(errors, 'password')}
								type="password"
							/>
							<Button
								disabled={loading}
								className={loading ? 'loading button__3d' : 'button__3d'}
								id="register__button"
								color="orange"
								fluid
								size="large"
							>
								Submit
							</Button>
						</Segment>
					</Form>
					{errors.length > 0 && (
						<Message error>
							<h3>Error</h3>
							{this.displayErrors(errors)}
						</Message>
					)}
					<Message>
						Already a user?{' '}
						<Link to="/login">
							<span className="anonymous__link">Login</span>
						</Link>{' '}or 
						<span onClick={() => this.handleAnonymous()} className="anonymous__link"> continue </span>
						as an anonymous user
					</Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Register;
