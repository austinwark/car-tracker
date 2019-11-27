import React from 'react';
import axios from 'axios';
// import firebase from '../../firebase';
import Skeleton from '../ResultsPanel/Skeleton';
import { setCurrentNotification, clearCurrentNotification, setCurrentQuery } from '../../actions';
import { connect } from 'react-redux';
import { Button, Confirm, Icon, Grid, Popup, Checkbox } from 'semantic-ui-react';


const firebase = require('../../firebase');
class Settings extends React.Component {
	state = {
        queriesRef: firebase.database().ref('queries'),
        isVerified: firebase.auth().currentUser.emailVerified,
        deleteLoading: false,
        emailLoading: false,
        open: false,
        autoEmails: this.props.currentQuery,
        onlyNew: this.props.currentQuery
    };

    // first renders autoEmails & onlyNew state as null while props are loading, then updates state with desired value when it loads
    static getDerivedStateFromProps(props, state) {
        if (props.currentQuery !== state.autoEmails && props.currentQuery !== state.onlyNew) {
            return {
                autoEmails: props.currentQuery.settings.autoEmails,
                onlyNew: props.currentQuery.settings.onlyNew
            }
        } else if (props.currentQuery !== state.autoEmails) {
            return { autoEmails: props.currentQuery.settings.autoEmails };
        } else if (props.currentQuery !== state.onlyNew) {
            return { onlyNew: props.currentQuery.settings.onlyNew };
        }

        return null;
    }

    
    handleDelete = currentQuery => {
        const { queriesRef } = this.state;
        const { currentUser } = this.props;
        this.setState({ deleteLoading: true });
        queriesRef
            .child(currentUser.uid)
            .child(currentQuery.id)
            .remove()
            .then(() => {
                //this.setNextQuery(); // sets next query after delete
                this.setState({ deleteLoading: false, open: false });
            })
            .catch(err => {
                this.setState({ deleteLoading: false, open: false });
                console.error(err);
            })
        
     }

    handleSendToEmail = async () => {
        const { currentQuery, currentUser, currentNotification } = this.props;
        const { results } = currentQuery;

        this.setState({ emailLoading: true });
        const url = '/api/mailer';
        const payload = { results: results, email: currentUser.email };
        const response = await axios.post(url, payload);
        if (response.status === 200) {
            if (currentNotification)
                await this.props.clearCurrentNotification();
            this.props.setCurrentNotification("Email successfully sent!")
        } else {
            if (currentNotification)
                await this.props.clearCurrentNotification();
            this.props.setCurrentNotification("Email failed to be sent!")
        }
        this.setState({ emailLoading: false });
    }

    toggleAutoEmails = () => {
        const { currentQuery, currentUser } = this.props;
        
        const autoEmails = currentQuery.settings.autoEmails;
        this.state.queriesRef.child(currentUser.uid).child(currentQuery.id).child('settings').update({
            "autoEmails": !autoEmails
        })
        const updatedQuery = currentQuery;
        updatedQuery.settings.autoEmails = !autoEmails;
        this.props.setCurrentQuery(updatedQuery);
        this.setState({ autoEmails: !autoEmails })
    }

    toggleOnlyNew = () => {
        const { currentQuery, currentUser } = this.props;

        const onlyNew = currentQuery.settings.onlyNew;
        this.state.queriesRef.child(currentUser.uid).child(currentQuery.id).child('settings').update({
            "onlyNew": !onlyNew
        })
        const updatedQuery = currentQuery;
        updatedQuery.settings.onlyNew = !onlyNew;
        this.props.setCurrentQuery(updatedQuery);
        this.setState({ onlyNew: !onlyNew });
    }




	render() {
        if (this.props.isLoading) {
            return <Skeleton />;
        } else if (!this.props.currentQuery) {
            return (
                <p>Create a query to access settings</p>
            )
        }   else {
                const { currentQuery, currentUser } = this.props;
                const { open } = this.state;

                return (
                    <React.Fragment>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <Checkbox
                                        label="Automatic emails"
                                        onChange={this.toggleAutoEmails}
                                        checked={this.state.autoEmails}
                                    />
                                    <Popup
                                        key={0}
                                        position="top center"
                                        content={
                                            currentUser.isAnonymous
                                                ? "Create an account to enable daily email updates "
                                                : "Controls automatic daily email updates "
                                        }
                                        trigger={<Icon name='question circle outline' size='large' className="question__icon" />}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Checkbox
                                        label="Only new results"
                                        onChange={this.toggleOnlyNew}
                                        checked={this.state.onlyNew}
                                    />
                                    <Popup
                                        key={0}
                                        position="top center"
                                        content={
                                            currentUser.isAnonymous
                                                ? "Create an account to configure settings "
                                                : "Send only previously unseen results or all "
                                        }
                                        trigger={<Icon name='question circle outline' size='large' className="question__icon" />}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Button
                                        color="blue"
                                        basic
                                        disabled={!currentQuery.results || !this.state.isVerified}
                                        className="settings__button"
                                        onClick={this.handleSendToEmail}
                                        loading={this.state.emailLoading}
                                    >
                                        Send to email
                                    </Button>
                                    <Popup
                                        key={1}
                                        position="top center"
                                        content={
                                            currentUser.isAnonymous 
                                            ? "Sends results to your saved email address, you must create an account and verify your email first!"
                                            : "Sends data to your saved email address"
                                        }
                                        trigger={<Icon name='question circle outline' size='large' className="question__icon" />}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>    
                                    <Button
                                        loading={this.state.deleteLoading}
                                        onClick={() => this.setState({ open: true })}
                                        color="red"
                                        basic
                                        className="settings__button"
                                    >
                                        Delete
                                    </Button>
                                    <Popup
                                        key={2}
                                        position="top center"
                                        content="Permanently deletes query, and all automatic email updates"
                                        trigger={<Icon name='question circle outline' size='large' className="question__icon" />}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Confirm
                            size="tiny"
                            open={open}
                            onCancel={() => this.setState({ open: false })}
                            onConfirm={() => this.handleDelete(currentQuery)}
                            confirmButton="Delete"
                            cancelButton="Cancel"
                        />
                    </React.Fragment>
                );
		}
	}
}

const mapStateToProps = state => ({
    currentNotification: state.notification.currentNotification
})

export default connect(mapStateToProps, { setCurrentNotification, clearCurrentNotification, setCurrentQuery })(Settings);
