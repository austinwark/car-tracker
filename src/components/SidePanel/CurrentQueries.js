import React from 'react';

import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Icon, Label } from 'semantic-ui-react';

class CurrentQueries extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref('queries'),
        activeQuery: '',
        enabledQueries: [],
        disabledQueries: []
    }

    componentDidMount() {
        this.addQueryListener();
    }

    addQueryListener = () => {
        const { currentUser, queriesRef } = this.state;
        const enabledQueries = [];
        const disabledQueries = [];
        queriesRef
            .child(currentUser.uid)
            .on('value', snap => {
                const queriesArray = Object.entries(snap.val());

                // const enabledQueries = queriesArray.reduce((acc, val) => {
                //     acc.push(val[1]);
                //     return acc;
                // }, []);
                queriesArray.forEach(set => {
                    const query = set[1];
                    query.enabled ? enabledQueries.push(query) : disabledQueries.push(query)
                })

                console.log("ENABLED QUERIES: ", enabledQueries);
                console.log("DISABLED QUERIES: ", disabledQueries);

                this.setState({ enabledQueries, disabledQueries })
                this.setFirstQuery();
            })
    }

    displayEnabledQueries = queries => (
        queries.length > 0 && queries.map(query => (
            <Menu.Item
                key={query.id}
                active={query.id === this.state.activeQuery}
                onClick={() => this.changeCurrentQuery(query)}
                style={{cursor: "pointer", textDecoration: "none"}}
            >
                # { query.name} <span>({query.results.arr.length})</span>
            </Menu.Item>
        ))
    )

    displayDisabledQueries = queries => (
        queries.length > 0 && queries.map(query => (
            <Menu.Item
                key={query.id}
                active={query.id === this.state.activeQuery}
                onClick={() => this.changeCurrentQuery(query)}
                style={{cursor: "pointer", textDecoration: "none"}}
            >
                # {query.name}

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

        const { enabledQueries, disabledQueries } = this.state;

        return (
            <React.Fragment>
                <Menu vertical secondary pointing fluid inverted>
                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> ENABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayEnabledQueries(enabledQueries)}

                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> DISABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayEnabledQueries(disabledQueries)}
                </Menu>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);