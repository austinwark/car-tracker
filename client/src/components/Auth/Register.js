import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import "../App.css";
const moment = require("moment");
const firebase = require("../../firebase");

/* Sign up form */
class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    usersRef: firebase.database().ref("users")
  };

  /* Validates form inputs -> broken down into smaller functions */
  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (this.isUsernameValid(this.state)) {
      error = { message: "Username must be less than 15 characters" };
      this.setState({ errors: errors.concat(error) });
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password must be greater than 6 characters" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  /* Validates against empty fields */
  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  /* Validates password length */
  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) return false;
    else if (password !== passwordConfirmation) return false;
    else return true;
  };

  /* Validates username length */
  isUsernameValid = ({ username }) => {
    if (username.length > 15) return false;
    else return true;
  };

  /* Updates local state with input values */
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  /* Validates input then creates new user and saves to firebase auth and database */
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true }); // 1) Validates input
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password) // 2) Creates user in firebase auth
        .then(createdUser => {
          createdUser.user
            .updateProfile({
              displayName: this.state.username // 3) Updates saved user with username
            })
            .then(() => {
              this.saveUser(createdUser).then(() => { // 4) Saves user to database and sends email verification
                this.handleEmailVerification(); 
              });
            })
            .catch(err => {
              console.error(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              });
            });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          });
        });
    }
  };

  /* Saves new user to database */
  saveUser = createdUser => {
    const now = moment().format("L");
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      email: createdUser.user.email,
      lastSignIn: now
    });
  };

  /* Sends new user an email verification using firebase API */
  handleEmailVerification = () => {
    const user = firebase.auth().currentUser;
    user.sendEmailVerification()
  };

  /* Maps through errors and displays each */
  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  /* Passes an error className to inputs if error */
  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  /* Signs user in anonymously using firebase API */
  handleAnonymous = () => {
    firebase
      .auth()
      .signInAnonymously()
      .catch(err => {
        console.error(err.message);
        this.setState({ errors: this.state.errors.concat(err) });
      });
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="signup__grid"
        style={{ marginTop: "10%" }}
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon textAlign="center" className="signup__header">
            <Icon name="puzzle piece" />
            Register for Car Tracker
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <p className="register__message">
                You will be sent an email verification link upon registration
              </p>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                className={this.handleInputError(errors, "username")}
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
                className={this.handleInputError(errors, "email")}
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
                className={this.handleInputError(errors, "password")}
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
                className={this.handleInputError(errors, "password")}
                type="password"
              />
              <Button
                disabled={loading}
                className={loading ? "button__3d" : "button__3d"}
                id="register__button"
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
            Already a user?{" "}
            <Link to="/login">
              <span className="anonymous__link">Login</span>
            </Link>{" "}
            or
            <span
              onClick={() => this.handleAnonymous()}
              className="anonymous__link"
            >
              {" "}
              continue{" "}
            </span>
            as an anonymous user
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
