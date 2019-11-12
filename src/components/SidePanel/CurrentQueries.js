import React from 'react';

import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Label, Icon } from 'semantic-ui-react';

class CurrentQueries extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref('queries'),
        activeQuery: '',
        enabledQueries: [],
        disabledQueries: []
    }

    componentDidMount() {
        const { currentUser, queriesRef } = this.state;
        const enabledQueries = [];
        queriesRef
            .child(currentUser.uid)
            .on('child_added', snap => {
                console.log(snap.val())
                enabledQueries.push(snap.val());
                this.setState({ enabledQueries });
            })
        
    }

    displayEnabledQueries = queries => (
        queries.length > 0 && queries.map(query => (
            <Menu.Item key={query.id} active={query.id === this.state.activeQuery} onClick={() => this.changeCurrentQuery(query)} style={{cursor: "pointer"}}>
                # { query.name}
            </Menu.Item>
        ))
    )

    changeCurrentQuery = query => {
        this.setActiveQuery(query);
        this.props.setCurrentQuery(query);
    }

    setActiveQuery = query => {
        this.setState({ activeQuery: query.id })
    }

    render() {

        const { enabledQueries } = this.state;

        return (
            <React.Fragment>
                <Menu.Menu>
                    <Menu.Item>
                        <span><Icon name='exchange' /> QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayEnabledQueries(enabledQueries)}
                </Menu.Menu>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);