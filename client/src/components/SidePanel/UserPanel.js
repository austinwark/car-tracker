import React from 'react';

import Reauthenticate from './Reauthenticate';
import { setCurrentNotification, clearCurrentNotification } from '../../actions';
import { connect } from 'react-redux';
import { Icon, Dropdown, Modal, Form, Input, Button, Header, Popup } from 'semantic-ui-react';

import firebase from '../../firebase';
//import { connect } from 'react-redux';

class UserPanel extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        isVerified: firebase.auth().currentUser.emailVerified,
        email: "",
        emailConfirmation: "",
        error: false,
        loading: false,
        open: false,
        success: false,
        needsToReauthenticate: false,
        popupOpen: false
    }

    componentDidMount() {
        firebase.auth().onIdTokenChanged(user => {
            if (user) {
                user.reload().then(() => {
                        if (user.emailVerified) {
                            this.setState({ isVerified: true });
                        } else {
                            this.setState({ isVerified: false });
                        }
                    }
                )
            }
        })
    }

    handleEmailVerification = () => {
        const { currentNotification } = this.props;
        const user = firebase.auth().currentUser;
        user.sendEmailVerification().then(async () => {
            // if (currentNotification)
            //     await this.props.clearCurrentNotification();
            // this.props.setCurrentNotification("Verification email successfully sent!");
        }).catch(async err => {
            // if (currentNotification)
            //     await this.props.clearCurrentNotification();
            // this.props.setCurrentNotification("Verification email failed to be sent!");
            console.error(err)
        })
    }

    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    closeModal = (success = false) => {
        if (success) {
            this.setState({ email: "", emailConfirmation: "", open: false, error: false, success: true });
        }
        else {
            this.setState({ email: "", emailConfirmation: "", open: false, error: false });
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state.email, this.state.emailConfirmation)) {
            this.setState({ loading: true, error: false });
            const user = firebase.auth().currentUser;
            user.updateEmail(this.state.email)
                .then(() => {
                    this.setState({ loading: false }, () => this.closeModal(true));
                })
                .catch(err => {
                    console.log(err)
                    if (err.code === "auth/requires-recent-login") {
                        console.log('needs to auth!')
                        this.setState({ needsToReauthenticate: true });
                    }
                    this.setState({ loading: false });
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

    handleUpdateEmail = () => {
        const user = firebase.auth().currentUser;

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
                <div className='sidePanel__color'>
                    <Icon name="search" size='huge' /><h1 className=''>Car Tracker</h1>
                    <div>
                        <Dropdown
                            trigger={
                                <span id="user__dropdown">
                                    <Icon name='at' />{" "}{this.state.currentUser.displayName}{" "}
                                    <br></br>
                                    {this.state.currentUser.email}
                                </span>
                            }
                            options={this.dropdownOptions()}
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
            </div>
        )
    }
}

const mapStateToProps = state => ({
    currentNotification: state.notification.currentNotification
})

export default connect(mapStateToProps, { setCurrentNotification, clearCurrentNotification })(UserPanel);