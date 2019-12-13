import React from 'react';

import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';

import { Table, Checkbox, Message } from 'semantic-ui-react';

import Skeleton from './Skeleton';

class ResultsList extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        resultsLoading: !(this.props.currentQuery)    // => when query is loaded, sets loading state to false
        // checkedRows: []
    }

    

    // checkForValue = val => {
    //     let flag = false;
    //     this.state.checkedRows.forEach(el => {
    //         if (el === val) {
    //             flag = true;
    //         }
    //     })
    //     return flag;
    // }

    // handleCheck = (event, data) => {
    //     const { rowstock } = data;
        
    //     const isChecked = this.checkForValue(rowstock)
    //         if (!isChecked) {
    //             const currentChecked = this.state.checkedRows;
    //             currentChecked.push(rowstock)
    //             this.setState({ checkedRows: currentChecked });
    //             this.updateGlobalState(rowstock, false)
    //         } else {
    //             const currentChecked = this.state.checkedRows;
    //             const updatedChecked = currentChecked.filter(row => row !== rowstock);
    //             console.log(updatedChecked)
    //             this.setState({ checkedRows: updatedChecked })
    //             this.updateGlobalState(rowstock, true)
    //         }
    // }

    // updateGlobalState = (stock, toDisable) => {
    //     const { currentQuery } = this.props;
    //     // console.log(currentQuery)
    //     const currentResults = currentQuery.results;
    //     const updatedResults = currentResults.map(el => {
    //         const result = el;
    //         if (result.stock === stock) {
    //             if (toDisable) {
    //                 result.disabled = true;
    //             } else {
    //                 result.disabled = false;
    //             }
    //         }
    //         return result;
    //     })
    //     console.log(updatedResults)
    // }

    displayResults = results => {
        if (results && results.length > 0) {
            return results.map((result, i) => {
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
                        {/* <Table.Cell>
                            <Checkbox
                                name={`row-${i}`}
                                onClick={this.handleCheck}
                                value={`row-${i}`}
                                rowstock={result.stock}
                                checked={this.state.checkedRows.includes(result.stock)}  // -> starts all as checked
                            />
                        </Table.Cell> */}
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
                <div>
                    <Table striped selectable>
                        <Table.Header fullWidth>
                            <Table.Row className="results__row">
                                <Table.HeaderCell className="results__row">Stock #</Table.HeaderCell>
                                <Table.HeaderCell>Year</Table.HeaderCell>
                                <Table.HeaderCell>Make</Table.HeaderCell>
                                <Table.HeaderCell>Model</Table.HeaderCell>
                                <Table.HeaderCell>Trim</Table.HeaderCell>
                                <Table.HeaderCell>Price</Table.HeaderCell>
                                <Table.HeaderCell>Ext. Color</Table.HeaderCell>
                                {/* <Table.HeaderCell collapsing>
                                    <Checkbox 
                                        toggle
                                        checked={this.state.checkedRows.length === currentQuery.results.arr.length} 
                                    />
                                </Table.HeaderCell> */}
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
                <Message id="no__results__message" >No Queries, create one now!</Message>
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


export default connect(mapStateToProps, { setCurrentQuery })(ResultsList);