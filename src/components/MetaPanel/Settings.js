import React from 'react';

import firebase from '../../firebase';

import { Checkbox, Button, Form } from 'semantic-ui-react';

class Settings extends React.Component {
	state = {
		queriesRef: firebase.database().ref('queries'),
		loading: false
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
         this.setState({ loading: true });
         
     }

	render() {
		if (this.props.currentQuery) {
			const { currentQuery } = this.props;

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
                        onClick={() => this.handleDelete(currentQuery)}
                        color="red"
                        basic
                    >
                        Delete
                    </Button>
				</React.Fragment>
			);
		} else {
			return 'loading';
		}
	}
}

export default Settings;
