import React from 'react';

import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Icon, Label } from 'semantic-ui-react';

class CurrentQueries extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref(`queries`),
        activeQuery: '',
        queries: []
    }

    componentDidMount() {
        this.addNewQueryListener();
    }

    // listens for change in enabled properties of current query, and updates local state -> which updates components
    addEnabledListener = (nextQuery) => {
        const { queriesRef, currentUser } = this.state;
        queriesRef
            .child(currentUser.uid)
            .child(nextQuery.id)
            .child('enabled')
            .on("value", snap => {
                const enabledVal = snap.val();
                if (enabledVal !== this.props.currentQuery.enabled) {
                    const { queries } = this.state;
                    const updatedQuery = queries.find(quer => quer.id === nextQuery.id)
                    const otherQueries = queries.filter(quer => quer.id !== nextQuery.id)
                    updatedQuery.enabled = enabledVal;
                    const updatedQueries = [updatedQuery, ...otherQueries]
                    console.log(updatedQueries)
                    this.setState({ queries: updatedQueries });
                } 
            })
    }

    /* Listens for initial queries loaded in & new queries created -> then updates state */
    addNewQueryListener = () => {
        const { currentUser, queriesRef, queries } = this.state;
        const loadedQueries = queries;
        queriesRef
            .child(currentUser.uid)
            .on('child_added', snap => {
                const queriesArray = Object.entries(snap.val());
                loadedQueries.push(snap.val());
                this.setState({ queries: loadedQueries }, () => this.setFirstQuery());

            })
            //this.setFirstQuery();
    }

    displayEnabledQueries = queries => (
        queries.length > 0 && queries.map(query => {
            if (query.enabled)
                return (
                    <Menu.Item
                        key={query.id}
                        active={query.id === this.state.activeQuery}
                        onClick={() => this.changeCurrentQuery(query)}
                        style={{cursor: "pointer", textDecoration: "none"}}
                    >
                        # { query.name} <span>({query.results.arr.length})</span>
                </Menu.Item>
                )
        })
    )

    displayDisabledQueries = queries => (
        queries.length > 0 && queries.map(query => {
            if (!query.enabled) 
                return (
                    <Menu.Item
                    key={query.id}
                    active={query.id === this.state.activeQuery}
                    onClick={() => this.changeCurrentQuery(query)}
                    style={{cursor: "pointer", textDecoration: "none"}}
                    >
                        # {query.name}

                </Menu.Item> )
        })
    )

    changeCurrentQuery = async nextQuery => {
        this.setActiveQuery(nextQuery);
        await this.props.setCurrentQuery(nextQuery);
        this.addEnabledListener(nextQuery);
    }

    setActiveQuery = query => {
        this.setState({ activeQuery: query.id })
    }

    setFirstQuery = () => {
        const { queries } = this.state;
        //enabledQueries.length > 0 ? this.changeCurrentQuery(enabledQueries[0]) : this.changeCurrentQuery(disabledQueries[0]);
        queries.length > 0 && this.changeCurrentQuery(queries[0]);
    }

    render() {

        //const { enabledQueries, disabledQueries } = this.state;
        return (
            <React.Fragment>
                <Menu vertical secondary pointing fluid inverted>
                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> ENABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayEnabledQueries(this.state.queries)}

                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> DISABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayDisabledQueries(this.state.queries)}
                </Menu>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);