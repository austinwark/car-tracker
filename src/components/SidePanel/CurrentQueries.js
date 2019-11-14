import React from 'react';

import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Icon } from 'semantic-ui-react';

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

    // is called on changeCurrentQuery -> ensuring props && state is loaded
    addRemovedQueryListener = () => {
        const { currentUser, queriesRef, queries } = this.state;
        //console.log(this.props.currentQuery)
        queriesRef
            .child(currentUser.uid)
            .on("child_removed", snap => {
                const updatedQueries = queries.filter(quer => quer.id !== snap.val().id); // -> remove deleted query from local state
                console.log("UPDATED : ", updatedQueries)
                this.setState({ queries: updatedQueries }, () => {

                });
                console.log("STATE: ", this.state.queries)
                this.setFirstQuery();
            })
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
                    /* test again incase state changed in meantime */
                    const testRun = this.state.queries.find(quer => quer.id === nextQuery.id);
                    if (testRun !== -1) {
                        console.log('found', nextQuery)
                        this.setState({ queries: updatedQueries });
                    } else  
                        console.log('not found')
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
                loadedQueries.push(snap.val());
                this.setState({ queries: loadedQueries }, () => this.setFirstQuery());
            })
    }

    displayEnabledQueries = queries => (
        // eslint-disable-next-line
        queries.length > 0 && queries.map(query => {
            if (query.enabled)
                return (
                    <Menu.Item
                        key={query.id}
                        active={query.id === this.state.activeQuery}
                        onClick={() => this.changeCurrentQuery(query)}
                        style={{cursor: "pointer", textDecoration: "none"}}
                    >
                        # { query.name} <span>({query.results ? query.results.arr.length : 0})</span>
                </Menu.Item>
                )
        })
    )

    displayDisabledQueries = queries => (
        // eslint-disable-next-line
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
        console.log('changeCurrentQuery')
        this.setActiveQuery(nextQuery);
        await this.props.setCurrentQuery(nextQuery);
        this.addEnabledListener(nextQuery);
        this.addRemovedQueryListener();
    }

    setActiveQuery = query => {
        this.setState({ activeQuery: query.id })
    }

    setFirstQuery = () => {
        const { queries } = this.state;
        console.log('setFirstQuery')
        //enabledQueries.length > 0 ? this.changeCurrentQuery(enabledQueries[0]) : this.changeCurrentQuery(disabledQueries[0]);
        queries.length > 0 ? this.changeCurrentQuery(queries[0]) : this.props.setCurrentQuery(null);
    }

    render() {

        //const { enabledQueries, disabledQueries } = this.state;
        return (
            <React.Fragment>
                <Menu vertical secondary pointing fluid inverted borderless className="sidePanel__menu">
                    <Menu.Item as="h4" className="sidePanel__color">
                        <span><Icon name='exchange' /> ENABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayEnabledQueries(this.state.queries)}

                    <Menu.Item as="h4" className="sidePanel__color">
                        <span><Icon name='exchange' /> DISABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayDisabledQueries(this.state.queries)}
                </Menu>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);