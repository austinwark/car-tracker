import React from 'react';

import { Icon, Dropdown, Modal, Input, Button } from 'semantic-ui-react';

import firebase from '../../firebase';
//import { connect } from 'react-redux';

class UserPanel extends React.Component {

    state = {
        currentUser: this.props.currentUser
    }

    dropdownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.currentUser.displayName}</strong></span>,
            disabled: true
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
            <div className='text-light text-center' style={{height: "500px"}}>
                <div className='user__header pt-3'>
                    <Icon name="search" size='huge' /><h1 className='d-inline text-light'>Car Tracker</h1>
                    <div>
                        <Dropdown
                            trigger={
                                <span>
                                    {this.state.currentUser.displayName}
                                </span>
                            }
                            options={this.dropdownOptions()}
                            className='mx-auto text-center'
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default UserPanel;