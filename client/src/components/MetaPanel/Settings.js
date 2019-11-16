import React from 'react';
import axios from 'axios';
import firebase from '../../firebase';
import Skeleton from '../ResultsPanel/Skeleton';
import { setCurrentNotification } from '../../actions';
import { connect } from 'react-redux';
import { Button, Confirm, Icon, Grid, Popup, Table } from 'semantic-ui-react';


class Settings extends React.Component {
	state = {
        queriesRef: firebase.database().ref('queries'),
        isVerified: firebase.auth().currentUser.emailVerified,
        deleteLoading: false,
        emailLoading: false,
        open: false
    };
    
     handleDelete = currentQuery => {
        const { queriesRef } = this.state;
        const { currentUser } = this.props;
        this.setState({ deleteLoading: true });
        console.log(currentQuery)
        queriesRef
            .child(currentUser.uid)
            .child(currentQuery.id)
            .remove()
            .then(() => {
                console.log('done');
                this.setState({ deleteLoading: false, open: false });
            })
            .catch(err => {
                this.setState({ deleteLoading: false, open: false });
                console.error(err);
            })
        
     }

    handleSendToEmail = async () => {
        const { currentQuery, currentUser } = this.props;
        const { arr } = currentQuery.results;

        this.setState({ emailLoading: true });
        const url = '/api/mailer';
        const payload = { results: arr };
        const response = await axios.post(url, payload);
        if (response.status === 200) {
            this.props.setCurrentNotification("Email successfully sent!")
        } else {
            this.props.setCurrentNotification("Email failed to be sent!")
        }
        this.setState({ emailLoading: false });
    }

    // renderDataToText = results => {
        
    // }




	render() {
        if (this.props.isLoading) {
            return <Skeleton />;
        }
        else {
			const { currentQuery } = this.props;
            const { open } = this.state;

			return (
				<React.Fragment>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column>
                                <Button
                                    color="green"
                                    basic
                                    disabled={!this.state.isVerified}
                                    className="settings__button"
                                    onClick={this.handleSendToEmail}
                                    loading={this.state.emailLoading}
                                >
                                    Send to email
                                </Button>
                                <Popup
                                    key={0}
                                    position="top center"
                                    content="Sends data to your saved email address"
                                    trigger={<Icon name='question circle outline' size='large' style={{cursor: "pointer"}} />}
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
                                    key={1}
                                    position="top center"
                                    content="Permanently deletes query, and all automatic email updates"
                                    trigger={<Icon name='question circle outline' size='large' style={{cursor: "pointer"}} />}
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

export default connect(null, { setCurrentNotification })(Settings);
