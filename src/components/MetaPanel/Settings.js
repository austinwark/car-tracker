import React from 'react';

import firebase from '../../firebase';
import Skeleton from '../ResultsPanel/Skeleton';

import { Button, Confirm, Icon, Grid, Popup } from 'semantic-ui-react';

class Settings extends React.Component {
	state = {
		queriesRef: firebase.database().ref('queries'),
        loading: false,
        open: false
	};

	handleEnableToggle = (isEnabled) => {
		this.setState({ loading: true });
		const { currentUser, currentQuery } = this.props;
		const { queriesRef } = this.state;
		queriesRef
			.child(currentUser.uid)
			.child(currentQuery.id)
			.update({ enabled: !isEnabled })
			.then(() => {
				console.log('enabled toggled');
				this.setState({ loading: false });
			})
			.catch((err) => {
				console.error(err);
				this.setState({ loading: false });
			});
    };
    
     handleDelete = currentQuery => {
        const { queriesRef } = this.state;
        const { currentUser } = this.props;
        this.setState({ loading: true });
        console.log(currentQuery)
        queriesRef
            .child(currentUser.uid)
            .child(currentQuery.id)
            .remove()
            .then(() => {
                console.log('done');
                this.setState({ loading: false, open: false });
            })
            .catch(err => {
                this.setState({ loading: false, open: false });
                console.error(err);
            })
        
     }

	render() {
        if (this.props.isLoading) {
            return Skeleton;
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
                                    basic
                                    color="green"
                                >
                                    Verify Email
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Button
                                    loading={this.state.loading}
                                    onClick={() => this.handleEnableToggle(currentQuery.enabled)}
                                    basic
                                    className="settings__button"
                                >
                                    {currentQuery.enabled ? 'Disable' : 'Enable'}
                                </Button>
                                <Popup
                                    key={0}
                                    position="top center"
                                    content="Stops the collection of data. Will also turn off automatic email updates if enabled"
                                    trigger={<Icon name='question circle outline' size='large' style={{cursor: "pointer"}} />}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>    
                                <Button
                                    loading={this.state.loading}
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
                        open={open}
                        onCancel={() => this.setState({ open: false })}
                        onConfirm={() => this.handleDelete(currentQuery)}
                    />
				</React.Fragment>
			);
		}
	}
}

export default Settings;
