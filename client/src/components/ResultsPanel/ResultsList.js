import React from 'react';

import { connect } from 'react-redux';

import { Table, Checkbox, Message } from 'semantic-ui-react';

import Skeleton from './Skeleton';

class ResultsList extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        resultsLoading: !(this.props.currentQuery),    // => when query is loaded, sets loading state to false
        uncheckedRows: []
    }

    

    handleCheck = (event, data) => {
        const { rowstock } = data;
        this.state.uncheckedRows.indexOf(String(rowstock)) === -1
        ? this.setState({ uncheckedRows: this.state.uncheckedRows.filter(row => row != String(rowstock))})
        : this.setState({ uncheckedRows: this.state.uncheckedRows.push(String(rowstock))})
    }

    displayResults = results => {
        if (results) {
            return this.props.currentQuery.results.arr.map((result, i) => {
                return (
                    <Table.Row key={result.stock}>
                        <Table.Cell>{result.stock}</Table.Cell>
                        <Table.Cell>{result.year}</Table.Cell>
                        <Table.Cell>{result.make}</Table.Cell>
                        <Table.Cell>{result.model}</Table.Cell>
                        <Table.Cell>{result.trim}</Table.Cell>
                        <Table.Cell>
                            {Number(result.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}  
                        </Table.Cell>
                        <Table.Cell>{result.extColor}</Table.Cell>
                        <Table.Cell>
                            <Checkbox
                                name={`row-${i}`}
                                onClick={this.handleCheck}
                                value={`row-${i}`}
                                rowstock={result.stock}
                                checked={this.state.uncheckedRows.indexOf(String(result.stock)) === -1}
                            />
                        </Table.Cell>
                    </Table.Row>
                )
            })
        }
        }
    displayResultsSkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[ ...Array(10)].map((_, i) => (
                    <Skeleton key={i} />
                ))}
            </React.Fragment>
        ) : null
    );

    render() {

        const { currentQuery, isLoading } = this.props;
        const { resultsLoading } = this.state;

        if (!isLoading && currentQuery) {
            return (
                <React.Fragment>

                {/* <Header textAlign="center" as="h3" className="table__header">{currentQuery.name}</Header> */}
                <div className="">
                    <Table striped selectable>
                        <Table.Header fullWidth>
                            <Table.Row>
                                <Table.HeaderCell>Stock #</Table.HeaderCell>
                                <Table.HeaderCell>Year</Table.HeaderCell>
                                <Table.HeaderCell>Make</Table.HeaderCell>
                                <Table.HeaderCell>Model</Table.HeaderCell>
                                <Table.HeaderCell>Trim</Table.HeaderCell>
                                <Table.HeaderCell>Price</Table.HeaderCell>
                                <Table.HeaderCell>Ext. Color</Table.HeaderCell>
                                <Table.HeaderCell collapsing><Checkbox toggle /></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.displayResults(currentQuery.results)}
                        </Table.Body>
                    </Table>
                </div>
                </React.Fragment>
            )
        } else if (!isLoading && !currentQuery) {
            return (
                <Message >No Queries, create one now!</Message>
            )
        } else {
            return (
                <div className="table__container">
                    {this.displayResultsSkeleton(resultsLoading)}
                </div>
            )
        }
    }
}

const mapStateToProps = state => ({
    currentQuery: state.query.currentQuery,
    isLoading: state.query.isLoading
});


export default connect(mapStateToProps, null)(ResultsList);