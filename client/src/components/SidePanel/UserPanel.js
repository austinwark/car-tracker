import React from 'react';
import query from '../../assets/queryMain.svg';
import Reauthenticate from './Reauthenticate';
import { setCurrentNotification, clearCurrentNotification } from '../../actions';
import { connect } from 'react-redux';
import { Icon, Dropdown, Modal, Form, Input, Button, Header, Popup } from 'semantic-ui-react';
import puzzlePiece from '../../assets/puzzlePiece.png';
const moment = require('moment');

// import firebase from '../../firebase';
const firebase = require('../../firebase');
//import { connect } from 'react-redux';
const INITIAL_NEW_ACCOUNT = {
    username: "",
    email: "",
    password: "",
    passwordConfirm: ""
}
class UserPanel extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        isVerified: firebase.auth().currentUser.emailVerified,
        usersRef: firebase.database().ref('users'),
        queriesRef: firebase.database().ref('queries'),
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
    }

    componentDidMount() {
        firebase.auth().onIdTokenChanged(user => {
            if (user) {
                user.reload().then(() => {
                        if (user.emailVerified)
                            this.setState({ isVerified: true });
                        else
                            this.setState({ isVerified: false });
                    }
                )
            }
        })
    }

    handleEmailVerification = () => {
        const { currentNotification } = this.props;
        const user = firebase.auth().currentUser;
        user.sendEmailVerification().then(async () => {

        }).catch(async err => {
            console.error(err)
        })
    }

    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    closeModal = (success = false) => {
        if (success)
            this.setState({ email: "", emailConfirmation: "", open: false, error: false, success: true, loading: false });
        else
            this.setState({ email: "", emailConfirmation: "", newAccount: INITIAL_NEW_ACCOUNT, createOpen: false, open: false, error: false, loading: false });
    }

    handleSubmit = event => {
        const { currentUser, usersRef } = this.state;
        event.preventDefault();
        if (this.isFormValid(this.state.email, this.state.emailConfirmation)) {
            this.setState({ loading: true, error: false });
            const user = firebase.auth().currentUser;
            user.updateEmail(this.state.email)
                .then(() => {
                    usersRef
                        .child(currentUser.uid)
                        .child('email')
                        .set(this.state.email)
                        .then(() => {
                            this.handleEmailVerification();
                            this.setState({ loading: false }, () => this.closeModal(true));
                        })
                })
                .catch(err => {
                    console.log(err)
                    if (err.code === "auth/requires-recent-login") {
                        console.log('needs to auth!')
                        this.setState({ needsToReauthenticate: true });
                    }
                    this.setState({ loading: false, error: err });
                })
            } else {
                this.setState({ loading: false });
            }
    }

    closeReauthenticateModal = () => {
        this.setState({ needsToReauthenticate: false });
    }

    isFormValid = (email, emailConfirmation) => {
        if (!email || !emailConfirmation) {
            const error = { message: "One or more fields is missing"};
            this.setState({ error: error});
            return false;
        } else if (email !== emailConfirmation) {
            const error = { message: "Emails do not match"};
            this.setState({ error: error});
            return false;
        } else {
            return true;
        }
    }

    handleNewAccountChange = event => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            newAccount: {
                ...prevState.newAccount,
                [name]: value
            }
        }));
    }

    handleCreateSubmit = event => {
        event.preventDefault();
        const { currentUser, queriesRef, newAccount } = this.state;
        const { username, email, password, passwordConfirm } = newAccount;
        if (this.isCreateFormValid(newAccount)) {
            const credential = firebase.auth.EmailAuthProvider.credential(email, password);
            firebase.auth().currentUser.linkWithCredential(credential)
                .then(createdUser => {
                    createdUser.user
                        .updateProfile({
                            displayName: username
                        })
                        .then(() => {
                            this.saveUser(createdUser).then(() => {
                                this.handleEmailVerification();
                                this.updateQueries();
                                this.closeModal();
                                window.location.reload();
                            })     
                        })
                        .catch(err => {
                            console.log(err)
                            this.setState({ error: err })
                        })
                })
                .catch(err => {
                    console.log('error', err)
                    this.setState({ error: err })
                })
        }
    }

    updateQueries = () => {
        const { queriesRef, currentUser } = this.state;
        queriesRef.child(currentUser.uid).once('value', snap => {
            if (snap.val()) {
                const queries = Object.keys(snap.val())
                queries.forEach(query => {
                    queriesRef.child(currentUser.uid).child(query).update({
                        "isOwnerAnonymous": false
                    })                
                })
            }
        })
    }

    saveUser = createdUser => {
		const now = moment().format("L");
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
			email: createdUser.user.email,
			lastSignIn: now
        })
	}

    isCreateFormValid = newAccount => {
        let error;
        if (this.isCreateFormEmpty(newAccount)) {
            error = { message: "Fill in all fields"};
            this.setState({ error });
            return false;
        } else if (!this.isPasswordValid(newAccount)) {
            error = { message: "Passwords must be greater than 6 characters and matching" }; 
            this.setState({ error });
            return false;
        } else if (!this.isUsernameValid(newAccount)) {
            error = { message: "Username must be less than 15 characters" };
            this.setState({ error });
            return false;
        } else
            return true;
    }

    isCreateFormEmpty = ({ username, email, password, passwordConfirm }) => {
		return !username.length || !email.length || !password.length || !passwordConfirm.length;
	};

	isPasswordValid = ({ password, passwordConfirm }) => {
        console.log(password, passwordConfirm)
		if (password.length < 6 || passwordConfirm.length < 6) {
			return false;
		} else if (password !== passwordConfirm) {
			return false;
		} else {
			return true;
		}
	};

	isUsernameValid = ({ username }) => {
		if (username.length > 15) {
			return false;
		} else {
			return true;
		}
	}

    dropdownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.currentUser.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'verified',
            text: this.state.isVerified
                ? <span>Email is verified</span>
                : <Popup 
                    trigger={<span onClick={this.handleEmailVerification}>Resend verification link</span>}
                    on="click"
                    open={this.state.popupOpen}
                    onOpen={() => this.setState({ popupOpen: true })}
                    onClose={() => this.setState({ popupOpen: false })}
                    content="Verification link sent"
                    basic
                />,
            disabled: this.state.isVerified
        },
        {
            key: 'changeEmail',
            text: <span onClick={() => this.setState({ open: true })}>Update email</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ]

    anonymousDropdownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>anonymous</strong></span>,
            disabled: true
        },
        {
            key: "create",
            text: <span onClick={() => this.setState({ createOpen: true })}>Create an account here</span>
        },
        {
            key: "signout",
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ]

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log('signed out'))
    }

    render() {

        return (
            <div>
                <Reauthenticate
                    currentUser={this.props.currentUser}
                    open={this.state.needsToReauthenticate}
                    closeModal={this.closeReauthenticateModal}
                />
                <div className='main__sidepanel__colors sidepanel__header'>
                    {/* <Icon name="search" size='huge' /><h1 id="main__font">Car Tracker</h1> */}
                    <img src={query} className="main__icon" />
                    <div>
                        <Dropdown
                            trigger={
                                <span id="user__dropdown">
                                    <span style={{ fontSize: "1.2rem", fontStyle: "bold"}}><Icon size="small" name='at' />{this.state.currentUser.displayName || this.props.currentUser.displayName || "Ghost"}{" "}</span>
                                    {this.props.currentUser.email && (<br></br>)}
                                    {this.state.currentUser.email}
                                </span>
                            }
                            options={this.props.currentUser.isAnonymous ? this.anonymousDropdownOptions() : this.dropdownOptions()}
                        />
                    </div>
                </div>
                <Modal
                    open={this.state.success}
                    size="tiny"
                    header="Success!"
                    content={`Email updated to ${this.state.currentUser.email}`}
                    actions={[<Button key={0} color="green" inverted  content="Close" onClick={() => this.setState({ success: false })} />]}
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
                                {/* <img src={puzzlePiece} className="new__account__puzzle" /> */}
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
        )
    }
}

const mapStateToProps = state => ({
    currentNotification: state.notification.currentNotification
})

export default connect(mapStateToProps, { setCurrentNotification, clearCurrentNotification })(UserPanel);