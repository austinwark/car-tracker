import React from 'react';

import { Icon, Dropdown } from 'semantic-ui-react';

import firebase from '../../firebase';
//import { connect } from 'react-redux';

class UserPanel extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        isVerified: false
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
        const user = firebase.auth().currentUser;
        user.sendEmailVerification().then(() => {
            console.log('email sent')
        }).catch(err => {
            console.error(err)
        })
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
                : <span onClick={this.handleEmailVerification}>Resend verification link</span>,
            disabled: this.state.isVerified
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
                <div className='sidePanel__color'>
                    <Icon name="search" size='huge' /><h1 className=''>Car Tracker</h1>
                    <div>
                        <Dropdown
                            trigger={
                                <span>
                                    {this.state.currentUser.displayName}
                                </span>
                            }
                            options={this.dropdownOptions()}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default UserPanel;