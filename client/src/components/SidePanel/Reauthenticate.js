import React from 'react';
// import firebase from '../../firebase';

import { Icon, Dropdown, Modal, Form, Input, Button, Header, Confirm } from 'semantic-ui-react';


const firebase = require('../../firebase');
class Reauthenticate extends React.Component {

    state = {
        open: this.props.open,
        email: "",
        password: "",
        error: "",
        loading: false
    }

    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    closeModal = (success = false) => {
        if (success) {
            this.setState({ email: "", password: "", error: "" });
            this.props.closeModal();
        }
        else {
            this.setState({ email: "", password: "", error: "" });
            this.props.closeModal();
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state.email, this.state.password)) {
            this.setState({ loading: true, error: false });
            const user = firebase.auth().currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.state.email,
                this.state.password
            );
            user
                .reauthenticateWithCredential(credential)
                .then(() => {
                    console.log("Reauthenticated");
                    this.setState({ loading: false }, () => this.closeModal(true));
                })
                .catch(err => {
                    console.log(err);
                    this.setState({ error: err, loading: false });
                })
        }
    }

    isFormValid = (email, password) => {
        if (!email || !password) {
            const error = { message: "One or more fields missing" };
            this.setState({ error });
            return false;
        } else {
            return true;
        }
    }

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
                        <Header color="red" inverted attached="top">
                            <h3>Error</h3>
                            <p>{this.state.error.message}</p>
                        </Header>
                    )}
                    <Header icon="lock" content="It's been too long! Sign back in to update email" />
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
        )
    }
}

export default Reauthenticate;