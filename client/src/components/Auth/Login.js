import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import "../App.css";
const firebase = require("../../firebase");

/* Login form */
class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false
  };

  /* Updates input fields in local state */
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  /* Validates login info and logs user in using firebase API */
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .catch(err => {
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          });
        });
    }
  };

  /* Ensures both email & password are filled */
  isFormValid = ({ email, password }) => email && password;

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
    const { email, password, errors, loading } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="signup__grid"
        style={{ marginTop: "10%" }}
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon textAlign="center" className="login__header">
            <Icon name="code branch" />
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
              <Button
                disabled={loading}
                className={loading ? "loading button__3d" : "button__3d"}
                id="login__button"
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
            Don't have an account?{" "}
            <Link to="/register">
              <span className="anonymous__link">Register</span>
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

export default Login;
