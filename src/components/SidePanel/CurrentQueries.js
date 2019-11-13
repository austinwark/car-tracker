import React from 'react';

import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Icon } from 'semantic-ui-react';

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
        this.addValueListener();
        queriesRef
            .child(currentUser.uid)
            .on('child_added', snap => {
                enabledQueries.push(snap.val());
                this.setState({ enabledQueries });
                this.setFirstQuery();
            });
    }

    // WORKING ON CONVERTING CHILD_ADDED TO VALUE BECAUSE CHILD ADDED DOES NOT UPDATE
    // STATE WHEN NEW QUERY IS CREATED
    addValueListener = () => {
        const { currentUser, queriesRef } = this.state;
        let enabledQueries = [];
        queriesRef
            .child(currentUser.uid)
            .on('value', snap => {
                //console.log("VALUE SNAP: ", snap.val())
                const queriesArray = Object.entries(snap.val());
                enabledQueries = queriesArray.reduce((acc, val) => {
                    return val[1];
                }, []);
                console.log("VALUE SNAP: ", enabledQueries)
            })
    }

    displayEnabledQueries = queries => (
        queries.length > 0 && queries.map(query => (
            <Menu.Item
                key={query.id}
                active={query.id === this.state.activeQuery}
                onClick={() => this.changeCurrentQuery(query)}
                style={{cursor: "pointer", textDecoration: "none"}}>
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

    setFirstQuery = () => {
        const { enabledQueries } = this.state;
        this.changeCurrentQuery(enabledQueries[0]);
    }

    render() {

        const { enabledQueries } = this.state;

        return (
            <React.Fragment>
                <Menu vertical secondary fluid inverted>
                    <Menu.Item as="h3">
                        <span><Icon name='exchange' /> QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayEnabledQueries(enabledQueries)}
                </Menu>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);