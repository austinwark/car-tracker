import React from 'react';
import firebase from '../../firebase';

import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import "../App.css";

class Login extends React.Component {
	state = {
		email: '',
		password: '',
		errors: [],
        loading: false,
	};

	handleChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedInUser => {
                    console.log(signedInUser)
                })
                .catch(err => {
                    console.error(err);
                    this.setState({ errors: this.state.errors.concat(err), loading: false });
                });
		}
    };

    isFormValid = ({ email, password }) => email && password;

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
		const { email, password, errors, loading } = this.state;

		return (
			<Grid textAlign="center" verticalAlign="middle" className="signup__grid" style={{marginTop: "10%"}}>
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="orange" textAlign="center">
						<Icon name="code branch" color="orange" />
						Login to Car Tracker
					</Header>
					<Form onSubmit={this.handleSubmit} size="large">
						<Segment stacked>
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
							<Button
								disabled={loading}
								className={loading ? 'loading button__3d' : 'button__3d'}
								id="login__button"
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
						Don't have an account?{' '}
						<Link to="/register">
							Register
						</Link>{' '}or 
						<span onClick={() => this.handleAnonymous()}> continue </span>
						as an anonymous user
					</Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Login;
