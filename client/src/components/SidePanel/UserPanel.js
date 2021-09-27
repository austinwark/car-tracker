import React from "react";
import { connect } from "react-redux";
import {
  Icon,
  Dropdown,
  Modal,
  Form,
  Input,
  Button,
  Header,
  Popup
} from "semantic-ui-react";
import query from "../../assets/queryMain.svg";
import Reauthenticate from "./Reauthenticate";
import {
  setCurrentNotification,
  clearCurrentNotification
} from "../../actions";
const moment = require("moment");
const firebase = require("../../firebase");

const INITIAL_NEW_ACCOUNT = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: ""
};

/*
  Contains user account info and is used to perform actions such as updating email, verifying email, and signing out.
  Also is used by anonymous users to create a new account in order to save their queries
*/
class UserPanel extends React.Component {
  state = {
    currentUser: this.props.currentUser,
    isVerified: firebase.auth().currentUser.emailVerified,
    usersRef: firebase.database().ref("users"),
    queriesRef: firebase.database().ref("queries"),
    email: "",
    emailConfirmation: "",
    newAccount: INITIAL_NEW_ACCOUNT,
    error: false,
    loading: false,
    open: false,
    createOpen: false,
    success: false,
    needsToReauthenticate: false,
    popupOpen: false
  };

  /* Creates firebase listener, listening for changes to user account -- updates local state with email verification results */
  componentDidMount() {
    firebase.auth().onIdTokenChanged(user => {
      if (user) {
        user.reload().then(() => {
          if (user.emailVerified) this.setState({ isVerified: true });
          else this.setState({ isVerified: false });
        });
      }
    });
  }

  /* Uses firebase API to send user a verification email */
  handleEmailVerification = () => {
    const user = firebase.auth().currentUser;
    user
      .sendEmailVerification()
      .catch(err => {
        console.error(err);
      });
  };

  /* Updates local state with new email input */
  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  /* Used to close modals and reset input state */
  closeModal = (success = false) => {
    if (success)
      this.setState({
        email: "",
        emailConfirmation: "",
        open: false,
        error: false,
        success: true,
        loading: false
      });
    else
      this.setState({
        email: "",
        emailConfirmation: "",
        newAccount: INITIAL_NEW_ACCOUNT,
        createOpen: false,
        open: false,
        error: false,
        loading: false
      });
  };

  /* Submits new email address to firebase */
  handleSubmit = event => {
    const { currentUser, usersRef } = this.state;
    event.preventDefault();
    if (this.isFormValid(this.state.email, this.state.emailConfirmation)) { // 1) Validates new email
      this.setState({ loading: true, error: false });
      const user = firebase.auth().currentUser;
      user
        .updateEmail(this.state.email) // 2) Updates user's account in firebase auth using it's API
        .then(() => { // 3) Updates user info in firebase database
          usersRef
            .child(currentUser.uid)
            .child("email")
            .set(this.state.email)
            .then(() => {
              this.handleEmailVerification(); // 4) Sends email verification
              this.setState({ loading: false }, () => this.closeModal(true));
            });
        })
        .catch(err => {
          if (err.code === "auth/requires-recent-login") { // 5) --if firebase requires user to sign back in, opens reauthentication modal
            this.setState({ needsToReauthenticate: true });
          }
          this.setState({ loading: false, error: err });
        });
    } else {
      this.setState({ loading: false });
    }
  };

  /* Used to close reauthenticate modal, still shows firebase API error if user failed to reauth */
  closeReauthenticateModal = (success = false) => {
    if (success) this.setState({ needsToReauthenticate: false, err: null });
    else this.setState({ needsToReauthenticate: false });
  };

  /* Validates email update form input */
  isFormValid = (email, emailConfirmation) => {
    if (!email || !emailConfirmation) {
      const error = { message: "One or more fields is missing" };
      this.setState({ error });
      return false;
    } else if (email !== emailConfirmation) {
      const error = { message: "Emails do not match" };
      this.setState({ error });
      return false;
    } else {
      return true;
    }
  };

  /* Updates local state with new account input */
  handleNewAccountChange = event => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      newAccount: {
        ...prevState.newAccount,
        [name]: value
      }
    }));
  };

  /* Submits anonymous user's new account info and updates info in firebase auth and database */
  handleCreateSubmit = event => {
    event.preventDefault();
    const { newAccount } = this.state;
    const { username, email, password } = newAccount;
    if (this.isCreateFormValid(newAccount)) { // 1) Validates new account info
      const credential = firebase.auth.EmailAuthProvider.credential( // 2) Creates credentials using firebase API
        email,
        password
      );
      firebase
        .auth()
        .currentUser.linkWithCredential(credential) // 3) Saves credentials to anonymous user's account
        .then(createdUser => {
          createdUser.user
            .updateProfile({
              displayName: username // 4) Adds display name to user's account in firebase auth
            })
            .then(() => {
              this.saveUser(createdUser).then(() => { // 5) Saves user to database
                this.handleEmailVerification(); // 6) Sends email verification
                this.updateQueries(); // 7) Updates isOwnerAnonymous field in user's queries to false
                this.closeModal();
                window.location.reload(); // 8) Refreshes app
              });
            })
            .catch(err => {
              this.setState({ error: err });
            });
        })
        .catch(err => {
          this.setState({ error: err });
        });
    }
  };

  /* Iterates through user's queries and updates isOwnerAnonymous field on new account creation */
  updateQueries = () => {
    const { queriesRef, currentUser } = this.state;
    queriesRef.child(currentUser.uid).once("value", snap => {
      if (snap.val()) {
        const queries = Object.keys(snap.val());
        queries.forEach(query => {
          queriesRef
            .child(currentUser.uid)
            .child(query)
            .update({
              isOwnerAnonymous: false
            });
        });
      }
    });
  };

  /* Saves new user info to user collection in database */
  saveUser = createdUser => {
    const now = moment().format("L");
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      email: createdUser.user.email,
      lastSignIn: now
    });
  };

  /* Validates new account input using helper functions */
  isCreateFormValid = newAccount => {
    let error;
    if (this.isCreateFormEmpty(newAccount)) {
      error = { message: "Fill in all fields" };
      this.setState({ error });
      return false;
    } else if (!this.isPasswordValid(newAccount)) {
      error = {
        message: "Passwords must be greater than 6 characters and matching"
      };
      this.setState({ error });
      return false;
    } else if (!this.isUsernameValid(newAccount)) {
      error = { message: "Username must be less than 15 characters" };
      this.setState({ error });
      return false;
    } else return true;
  };

  /* Helper function checks for empty fields */
  isCreateFormEmpty = ({ username, email, password, passwordConfirm }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirm.length
    );
  };

  /* Helper function validates password length */
  isPasswordValid = ({ password, passwordConfirm }) => {
    if (password.length < 6 || passwordConfirm.length < 6) {
      return false;
    } else if (password !== passwordConfirm) {
      return false;
    } else {
      return true;
    }
  };

  /* Helper function validates username length */
  isUsernameValid = ({ username }) => {
    if (username.length > 15) {
      return false;
    } else {
      return true;
    }
  };

  /* Returns list of drop down options for a signed in user */
  dropdownOptions = () => [
    {
      key: "user", // user's display name
      text: (
        <span>
          Signed in as <strong>{this.state.currentUser.displayName}</strong> 
        </span>
      ),
      disabled: true
    },
    {
      key: "verified", // if email is not verified, is used to send verification email
      text: this.state.isVerified ? (
        <span>Email is verified</span>
      ) : (
        <Popup
          trigger={
            <span onClick={this.handleEmailVerification}>
              Resend verification link
            </span>
          }
          on="click"
          open={this.state.popupOpen}
          onOpen={() => this.setState({ popupOpen: true })}
          onClose={() => this.setState({ popupOpen: false })}
          content="Verification link sent"
          basic
        />
      ),
      disabled: this.state.isVerified
    },
    {
      key: "changeEmail", // used to update email address -- opens modal
      text: (
        <span onClick={() => this.setState({ open: true })}>Update email</span>
      )
    },
    { 
      key: "signout", // signs user out
      text: <span onClick={this.handleSignout}>Sign Out</span>
    }
  ];

  /* Returns list of drop down options for an anonymous user */
  anonymousDropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>anonymous</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "create", // used to create new account -- opens modal
      text: (
        <span onClick={() => this.setState({ createOpen: true })}>
          Create an account here
        </span>
      )
    },
    {
      key: "signout", // signs anonymous user out -- loses all queries
      text: <span onClick={this.handleSignout}>Sign Out</span>
    }
  ];

  /* Signs user out */
  handleSignout = () => {
    firebase
      .auth()
      .signOut()
  };

  render() {
    return (
      <div>
        <Reauthenticate
          currentUser={this.props.currentUser}
          open={this.state.needsToReauthenticate}
          closeModal={this.closeReauthenticateModal}
        />
        <div className="main__sidepanel__colors sidepanel__header">
          <img src={query} className="main__icon" alt="Magnifying glass icon" />
          <div>
            <Dropdown
              trigger={
                <span id="user__dropdown">
                  <span style={{ fontSize: "1.2rem", fontStyle: "bold" }}>
                    <Icon size="small" name="at" />
                    {this.props.currentUser.isAnonymous
                      ? "Ghost "
                      : this.state.currentUser.displayName || this.props.currentUser.displayName
                    }
                  </span>
                  {this.props.currentUser.email && <br></br>}
                  {this.state.currentUser.email}
                </span>
              }
              options={
                this.props.currentUser.isAnonymous
                  ? this.anonymousDropdownOptions()
                  : this.dropdownOptions()
              }
            />
          </div>
        </div>
        <Modal
          open={this.state.success}
          size="tiny"
          header="Success!"
          content={`Email updated to ${this.state.currentUser.email}`}
          actions={[
            <Button
              key={0}
              color="green"
              inverted
              content="Close"
              onClick={() => this.setState({ success: false })}
            />
          ]}
          onClose={() => this.setState({ success: false })}
        />
        <Modal
          open={this.state.open}
          onClose={() => this.closeModal()}
          basic
          size="small"
        >
          {this.state.error && (
            <Header block color="red" inverted attached="top">
              <h3>Error</h3>
              <p>{this.state.error.message}</p>
            </Header>
          )}
          <Header icon="envelope" content="Update Email" />
          <Modal.Content>
            <Form>
              <Form.Field
                control={Input}
                name="email"
                label="Email"
                placeholder={this.state.currentUser.email}
                onChange={this.handleChange}
                value={this.state.email}
                type="email"
                className="email__form"
              />
              <Form.Field
                control={Input}
                name="emailConfirmation"
                label="Email Confirmation"
                placeholder={this.state.currentUser.email}
                onChange={this.handleChange}
                value={this.state.emailConfirmation}
                type="email"
                className="email__form"
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => this.closeModal()}
              color="red"
              inverted
              content="Cancel"
            />
            <Button
              onClick={this.handleSubmit}
              loading={this.state.loading}
              color="green"
              inverted
              content="Submit"
              type="submit"
            />
          </Modal.Actions>
        </Modal>
        <Modal
          open={this.state.createOpen}
          onClose={() => this.closeModal()}
          basic
          size="small"
          className="new__account__modal"
        >
          {this.state.error && (
            <Header block color="red" inverted attached="top">
              <h3>Error</h3>
              <p>{this.state.error.message}</p>
            </Header>
          )}
          <Header icon="puzzle piece" content="Create an account" />
          <Modal.Content className="new__account__content">
            <Form>
              <Form.Field
                control={Input}
                name="username"
                label="Username"
                placeholder="Username"
                onChange={this.handleNewAccountChange}
                value={this.state.newAccount.username}
                type="text"
                icon="user"
                iconPosition="left"
              />
              <Form.Field
                control={Input}
                name="email"
                label="Email Address"
                placeholder="Email address"
                onChange={this.handleNewAccountChange}
                value={this.state.newAccount.email}
                type="email"
                icon="mail"
                iconPosition="left"
              />
              <Form.Field
                control={Input}
                name="password"
                label="Password"
                placeholder="Password"
                onChange={this.handleNewAccountChange}
                value={this.state.newAccount.password}
                type="password"
                icon="lock"
                iconPosition="left"
              />
              <Form.Field
                control={Input}
                name="passwordConfirm"
                label="Password Confirmation"
                placeholder="Password Confirmation"
                onChange={this.handleNewAccountChange}
                value={this.state.newAccount.passwordConfirm}
                type="password"
                icon="repeat"
                iconPosition="left"
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => this.closeModal()}
              color="red"
              inverted
              content="Cancel"
            />
            <Button
              onClick={this.handleCreateSubmit}
              loading={this.state.loading}
              color="green"
              inverted
              content="Submit"
              type="submit"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentNotification: state.notification.currentNotification
});

export default connect(mapStateToProps, {
  setCurrentNotification,
  clearCurrentNotification
})(UserPanel);
