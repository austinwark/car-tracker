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

    componentWillUnmount() {
        this.removeListeners();
        console.log("UNMOUNTING state queries", this.state.queries)
    }

    removeListeners = () => {
        const { currentUser, queriesRef } = this.state;
        queriesRef.child(currentUser.uid).off();
    }

    // is called on changeCurrentQuery -> ensuring props && state is loaded
    addRemovedQueryListener = () => {
        const { currentUser, queriesRef, queries } = this.state;
        //console.log(this.props.currentQuery)
        queriesRef
            .child(currentUser.uid)
            .on("child_removed", snap => {
                const updatedQueries = queries.filter(quer => quer.id !== snap.val().id); // -> remove deleted query from local state
                console.log("UPDATEDDDDDD : ", updatedQueries)
                this.setState({ queries: updatedQueries });
                //console.log("STATE: ", this.state.queries)
                this.setFirstQuery(updatedQueries)
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
                this.setState({ queries: loadedQueries }, () => {
                    loadedQueries.length == 1 && this.setFirstQuery(loadedQueries)  // --> if this is the first time
                });
            })
    }

    displayQueries = queries => (
        // eslint-disable-next-line
        queries.length > 0 && queries.map(query => {
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

    changeCurrentQuery = async nextQuery => {
        console.log('changeCurrentQuery')
        this.setActiveQuery(nextQuery);
        await this.props.setCurrentQuery(nextQuery);
        this.addRemovedQueryListener();
    }

    setActiveQuery = query => {
        this.setState({ activeQuery: query.id })
    }

    setFirstQuery = queries => {
        queries.length > 0 ? this.changeCurrentQuery(queries[0]) : this.props.setCurrentQuery(null);
    }

    render() {
        return (
            <React.Fragment>
                <Menu vertical secondary pointing fluid inverted borderless className="sidePanel__menu">
                    <Menu.Item as="h3" className="sidePanel__color">
                        <span><Icon name='exchange' />QUERIES</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayQueries(this.state.queries)}
                </Menu>
            </React.Fragment>
        )
    }
}

// const mapStateToProps = state => ({
//     currentQuery: state.query.currentQuery
// })

export default connect(null, { setCurrentQuery })(CurrentQueries);