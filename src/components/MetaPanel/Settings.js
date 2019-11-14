import React from 'react';

import firebase from '../../firebase';

import { Button, Confirm } from 'semantic-ui-react';

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
		if (this.props.currentQuery) {
			const { currentQuery } = this.props;
            const { open } = this.state;

			return (
				<React.Fragment>
					<Button
						loading={this.state.loading}
						onClick={() => this.handleEnableToggle(currentQuery.enabled)}
						basic
					>
						{currentQuery.enabled ? 'Disable' : 'Enable'}
					</Button>
                    <Button
                        loading={this.state.loading}
                        onClick={() => this.setState({ open: true })}
                        color="red"
                        basic
                    >
                        Delete
                    </Button>
                    <Confirm
                        open={open}
                        onCancel={() => this.setState({ open: false })}
                        onConfirm={() => this.handleDelete(currentQuery)}
                    />
				</React.Fragment>
			);
		} else {
			return 'loading';
		}
	}
}

export default Settings;
