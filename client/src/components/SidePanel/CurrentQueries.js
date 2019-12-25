import React from 'react';

// import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Menu, Icon } from 'semantic-ui-react';

const firebase = require('../../firebase');
class CurrentQueries extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref(`queries`),
        activeQuery: '',
        queries: []
    }

    componentDidMount() {
        this.addNewQueryListener();
        this.addChangedQueryListener();
    }

    componentWillUnmount() {
        this.removeListeners();
        console.log("UNMOUNTING state queries", this.state.queries)
    }

    removeListeners = () => {
        const { currentUser, queriesRef } = this.state;
        queriesRef.child(currentUser.uid).off();
    }

    addChangedQueryListener = () => {
        const { currentUser ,queriesRef } = this.state;
        queriesRef
            .child(currentUser.uid)
            .on("child_changed", snap => {
                const changedQuery = snap.val();
                if (changedQuery.id && changedQuery.name) {
                    this.props.setCurrentQuery(changedQuery);
                }
            })
    }

    // is called on changeCurrentQuery -> ensuring props && state is loaded
    addRemovedQueryListener = () => {
        const { currentUser, queriesRef } = this.state;
        //console.log(this.props.currentQuery)
        queriesRef
            .child(currentUser.uid)
            .on("child_removed", snap => {
                const { queries } = this.state;
                const updatedQueries = queries.filter(quer => quer.id !== snap.val().id); // -> remove deleted query from local state
                console.log("UPDATEDDDDDD : ", updatedQueries)
                this.setState({ queries: updatedQueries });
                //console.log("STATE: ", this.state.queries)
                updatedQueries.length > 0 ? this.changeCurrentQuery(updatedQueries[0]) : this.props.setCurrentQuery(null);

            })
    }

    /* Listens for initial queries loaded in & new queries created -> then updates state */
    addNewQueryListener = () => {
        // const { currentUser, queriesRef, queries } = this.state;
        // const loadedQueries = queries;
        const { currentUser, queriesRef } = this.state;

        // console.log("NEW QUERY LISTNER BEFORE PUSH", loadedQueries)
        queriesRef
            .child(currentUser.uid)
            .on('child_added', snap => {
                const loadedQueries = this.state.queries;
                // console.log("NEW QUERY LISTNER BEFORE PUSH", JSON.stringify(loadedQueries))
                loadedQueries.push(snap.val());
                // console.log("NEW QUERY LISTNER AFTER PUSH", JSON.stringify(loadedQueries))
                this.setState({ queries: loadedQueries }, () => {
                    console.log("")
                    loadedQueries.length == 1 && this.setFirstQuery(loadedQueries)  // --> if this is the first time
                });
            })
    }

    // displayQueries = queries => (
    //     // eslint-disable-next-line
    //     queries.length > 0 && queries.map(query => {
    //         return (
    //             <Menu.Item
    //                 key={query.id}
    //                 // active={query.id === this.state.activeQuery}
    //                 className={query.id === this.state.activeQuery ? "query__item active__item" : "query__item"}
    //                 onClick={() => this.changeCurrentQuery(query)}
    //                 style={{cursor: "pointer", textDecoration: "none", color: "#FFF"}}
    //             >  
    //                 <div className="query__item__overlay"></div>
    //                 # { query.name} <span id="results__count">({query.results ? query.results.length : 0})</span>
    //             </Menu.Item>
    //         )
    //     })
    // )
    displayQueries = queries => (
        queries.length > 0 && queries.map(query => {
            return (
                <div
                    key={query.id}
                    className={query.id === this.state.activeQuery ? "query__item active__item" : "query__item"}
                    onClick={() => this.changeCurrentQuery(query)}
                    style={{ cursor: "pointer", textDecoration: "none", color: "#FFF" }}
                >
                    <div className="query__item__overlay"></div>
                    # {query.name} <span id="results__count">({ query.results ? query.results.length : 0 })</span>
                </div>
            )
        })
    )

    changeCurrentQuery = async nextQuery => {
        console.log("CHANGE CURRENT QUERY: ", nextQuery)
        this.setActiveQuery(nextQuery);
        await this.props.setCurrentQuery(nextQuery);
        if (this.props.sidePanelOpen)
            this.props.handleSideToggle();
        // this.addRemovedQueryListener();
    }

    setActiveQuery = query => {
        console.log("SET ACTIVE QUERY: ", query)
        this.setState({ activeQuery: query.id })
    }

    setFirstQuery = queries => {
        console.log("SET FIRST QUERY: ", queries)
        queries.length > 0 ? this.changeCurrentQuery(queries[0]) : this.props.setCurrentQuery(null);
        this.addRemovedQueryListener();
    }

    render() {
        return (
            <React.Fragment>
                <div className="sidePanel__menu main__sidepanel__colors">
                    <h3 className="main__sidepanel__colors">
                        <span><Icon name="exchange" />Queries</span>{" "}
                    </h3>
                    {this.state.queries.length > 0 && this.displayQueries(this.state.queries)}
                </div>
                {/* <Menu vertical secondary stackable pointing fluid borderless className="sidePanel__menu main__sidepanel__colors">
                    <Menu.Item as="h3" className="main__sidepanel__colors">
                        <span><Icon name='exchange' />Queries</span>{" "}
                    </Menu.Item>
                    {this.state.queries.length > 0 && this.displayQueries(this.state.queries)}
                </Menu> */}
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);