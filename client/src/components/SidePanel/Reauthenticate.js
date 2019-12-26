import React from "react";
import { Modal, Form, Input, Button, Header } from "semantic-ui-react";
const firebase = require("../../firebase");

/* 
  Modal component to reauthenticate user when trying to update email address.
  Is controlled by parent component - UserPanel
*/
class Reauthenticate extends React.Component {
  state = {
    open: this.props.open,
    email: "",
    password: "",
    error: "",
    loading: false
  };

  /* Updates local state with input value */
  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  /* Calls function passed by parent to close the modal, depending on outcome, an error message may still be displayed in parent modal */
  closeModal = (success = false) => {
    if (success) {
      // --if user was able to give the right account info
      this.setState({ email: "", password: "", error: "", loading: false });
      this.props.closeModal(true);
    } else {
      this.setState({ email: "", password: "", error: "", loading: false });
      this.props.closeModal(false);
    }
  };

  /* Submits user data to firebase auth API */
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state.email, this.state.password)) { // 1) validates input
      this.setState({ loading: true, error: false });
      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential( // 2) creates credential with input using firebase API
        this.state.email,
        this.state.password
      );
      user
        .reauthenticateWithCredential(credential) // 3) attempts to reauthenticate using firebase API
        .then(() => {
          this.closeModal(true); // 4) --if success, closes modal, passing the success argument
        })
        .catch(err => {
          this.setState({ error: err, loading: false });
        });
    }
  };

  /* Validates user input */
  isFormValid = (email, password) => {
    if (!email || !password) {
      const error = { message: "One or more fields missing" };
      this.setState({ error });
      return false;
    } else {
      return true;
    }
  };

  render() {
    return (
      <React.Fragment>
        <Modal
          open={this.props.open}
          onClose={() => this.closeModal()}
          size="small"
          dimmer="blurring"
        >
          {this.state.error && (
            <Header color="red" attached="top">
              <h3>Error</h3>
              <p>{this.state.error.message}</p>
            </Header>
          )}
          <Header
            icon="lock"
            content="It's been too long! Sign back in to update email"
          />
          <Modal.Content>
            <Form>
              <Form.Field
                control={Input}
                name="email"
                label="Email"
                placeholder="Email"
                onChange={this.handleChange}
                value={this.state.email}
                type="email"
              />
              <Form.Field
                control={Input}
                name="password"
                label="Password"
                placeholder="Password"
                onChange={this.handleChange}
                value={this.state.password}
                type="password"
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => this.closeModal()}
              color="red"
              content="Cancel"
            />
            <Button
              onClick={this.handleSubmit}
              loading={this.state.loading}
              color="green"
              content="Submit"
              type="submit"
            />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Reauthenticate;
