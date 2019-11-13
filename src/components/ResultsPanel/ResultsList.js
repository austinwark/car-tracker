import React from 'react';

import { connect } from 'react-redux';

import { Table } from 'semantic-ui-react';

import Spinner from '../../Spinner';

class ResultsList extends React.Component {

    state = {
        currentUser: this.props.currentUser
    }

    displayResults = results => {
        console.log("props: ", this.props.currentQuery);
        if (results) {
            return this.props.currentQuery.results.arr.map(result => {
                return (
                    <Table.Row key={result.stock}>
                        <Table.Cell>{result.stock}</Table.Cell>
                        <Table.Cell>{result.year}</Table.Cell>
                        <Table.Cell>{result.make}</Table.Cell>
                        <Table.Cell>{result.model}</Table.Cell>
                        <Table.Cell>{result.trim}</Table.Cell>
                        <Table.Cell>{result.price}</Table.Cell>
                        <Table.Cell>{result.extColor}</Table.Cell>
                    </Table.Row>
                )
            })
        }
        }

    render() {

        const { currentQuery } = this.props;

        if (currentQuery) {
            return (
                <div className="table__container">
                    <Table celled>
                        <Table.Header fullWidth>
                            <Table.Row>
                                <Table.HeaderCell>Stock #</Table.HeaderCell>
                                <Table.HeaderCell>Year</Table.HeaderCell>
                                <Table.HeaderCell>Make</Table.HeaderCell>
                                <Table.HeaderCell>Model</Table.HeaderCell>
                                <Table.HeaderCell>Trim</Table.HeaderCell>
                                <Table.HeaderCell>Price</Table.HeaderCell>
                                <Table.HeaderCell>Ext. Color</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.displayResults(currentQuery.results)}
                        </Table.Body>
                    </Table>
                </div>
            )
        } else {
            return <Spinner />
        }
    }
}

const mapStateToProps = state => ({
    currentQuery: state.query.currentQuery
});


export default connect(mapStateToProps, null)(ResultsList);