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
        let enabledLocalQueries = [];
        let disabledLocalQueries = [];
        queriesRef
            .child(currentUser.uid)
            .on('value', snap => {
                const queriesArray = Object.entries(snap.val());
                //console.log(queriesArray)
                console.log(1)
                queriesArray.forEach(set => {
                    const query = set[1];
                    //console.log(query.enabled)
                    query.enabled ? enabledLocalQueries.push(query) : disabledLocalQueries.push(query)
                })
                console.log(enabledLocalQueries)
                if (enabledLocalQueries.length > 0){
                    enabledLocalQueries = enabledLocalQueries.filter((item, index, self) => 
                        index === self.findIndex((t) => (
                            t.id === item.id && t.name === item.name
                        ))
                    )
                    enabledLocalQueries = enabledLocalQueries.filter((item, index) => item.enabled === true)
                }
                if (disabledLocalQueries.length > 0) {
                    disabledLocalQueries = disabledLocalQueries.filter((item, index, self) => 
                        index === self.findIndex((t) => (
                            t.id === item.id && t.name === item.name
                        ))
                    )
                    disabledLocalQueries = disabledLocalQueries.filter((item, index) => item.enabled === false)
                }

                console.log(enabledLocalQueries)
                this.setState({ enabledQueries: enabledLocalQueries, disabledQueries: disabledLocalQueries })
                this.setFirstQuery();
            })
    }

    displayEnabledQueries = queries => (
        queries.length > 0 && queries.map(query => {
            if (query.enabled === true) {
                console.log('is true')
            return (
                <Menu.Item
                    key={query.id}
                    active={query.id === this.state.activeQuery}
                    onClick={() => this.changeCurrentQuery(query)}
                    style={{cursor: "pointer", textDecoration: "none"}}
                >
                    # { query.name} <span>({query.results.arr.length})</span>
            </Menu.Item> ) }
        })
    )

    displayDisabledQueries = queries => (
        queries.length > 0 && queries.map(query => {
            if (query.enabled === false) {
                console.log('is false')
            return (
                <Menu.Item
                key={query.id}
                active={query.id === this.state.activeQuery}
                onClick={() => this.changeCurrentQuery(query)}
                style={{cursor: "pointer", textDecoration: "none"}}
                >
                    # {query.name}

            </Menu.Item> )}
        })
    )

    changeCurrentQuery = query => {
        this.setActiveQuery(query);
        this.props.setCurrentQuery(query);
    }

    setActiveQuery = query => {
        this.setState({ activeQuery: query.id })
    }

    setFirstQuery = () => {
        const { enabledQueries, disabledQueries } = this.state;
        enabledQueries.length > 0 ? this.changeCurrentQuery(enabledQueries[0]) : this.changeCurrentQuery(disabledQueries[0]);
    }

    render() {

        //const { enabledQueries, disabledQueries } = this.state;

        return (
            <React.Fragment>
                <Menu vertical secondary pointing fluid inverted>
                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> ENABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayEnabledQueries(this.state.enabledQueries)}

                    <Menu.Item as="h4">
                        <span><Icon name='exchange' /> DISABLED QUERIES</span>{" "}
                    </Menu.Item>
                    {this.displayDisabledQueries(this.state.disabledQueries)}
                </Menu>
                {console.log('-------------------')}
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentQuery })(CurrentQueries);