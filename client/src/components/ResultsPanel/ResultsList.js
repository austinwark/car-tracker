import React from 'react';
import oopsImage from "../../assets/oopsImage.png";
import { connect } from 'react-redux';
import { setCurrentQuery } from '../../actions';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { Table, Popup, Icon, Header, Card } from 'semantic-ui-react';

import Skeleton from './Skeleton';

class ResultsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: this.props.currentUser,
            resultsLoading: !(this.props.currentQuery),    // => when query is loaded, sets loading state to false
            windowDimensions: this.getWindowDimensions()
            // checkedRows: []
        }
        this.getWindowDimensions = this.getWindowDimensions.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    // state = {
    //     currentUser: this.props.currentUser,
    //     resultsLoading: !(this.props.currentQuery),    // => when query is loaded, sets loading state to false
    //     windowDimensions: this.getWindowDimensions()
    //     // checkedRows: []
    // }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    
    getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window;
        return {
          width,
          height
        };
      }

      handleResize = () => {
          const dimensions = this.getWindowDimensions();
          this.setState({ windowDimensions: dimensions });
      }


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
                        <Table.Cell className="seemore__container">
                            {result.extColor}
                        
                        <Popup
                            trigger={<Icon name="ellipsis horizontal" size="big" className="seemore__icon" />}
                            flowing
                            hoverable
                            position="top right"
                            style={{border: "solid blue 2px"}}
                        >
                                    <h3>{result.year} {result.make} {result.model} {result.trim}</h3>
                            <div className="vehicle__details">
                                     <Icon name="car" size="big" />
                                <div className="vehicle__details__primary">
                                    <span>Stock #: {result.stock}</span>
                                    <span>Engine: {result.metadata.engine}</span>
                                    <span>Transmission: {result.metadata.transmission}</span>
                                    <span>Ext. Color: {result.extColor}</span>
                                    <span>Int. Color: {result.metadata.intColor}</span>
                                    <span>Mileage: {result.metadata.miles}</span>
                                    <span>Vin #: {result.vin}</span>
                                </div>
                                <div className="vehicle__details__secondary">
                                    <h5>Price: ${result.price}</h5>
                                    <a href={result.metadata.link} target="_blank">See more</a>
                                    <a href={result.metadata.carfaxLink} target="_blank">See Carfax</a>
                                </div>
                            </div>
                        </Popup>
                        </Table.Cell>
                    </Table.Row>
                )
            })
        }
    }

    displayMobileResults = results => {
        if (results && results.length > 0) {
            return results.map((result, i) => (
                // <div className="results__card">
                //     <h4>{result.year} {result.make} {result.model} {result.trim}</h4>
                // </div>
                <Card className="results__card">
                    <Card.Content>
                        <Card.Header>{result.year} {result.make} {result.model} {result.trim}</Card.Header>
                        <Card.Description>
                            <p>Price: {Number(result.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            <p>Stock #: {result.stock}</p>
                            <hr></hr>
                            <p>Engine: {result.metadata.engine}</p>
                            <p>Transmission: {result.metadata.transmission}</p>
                            <p>Ext. Color: {result.extColor}</p>
                            <p>Int. Color: {result.metadata.intColor}</p>
                            <p>Mileage: {result.metadata.miles}</p>
                            <p>Vin #: {result.metadata.vin}</p>
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <a href={result.metadata.carfaxLink} target="_blank">See Carfax</a>
                    </Card.Content>
                </Card>
            ))
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
            if (this.state.windowDimensions.width < 768)
                return (
                    <React.Fragment>
                        <h1 style={{textAlign: "center"}}>
                            <Icon name="filter" />{" "}
                            Query Results
                        </h1>
                        <div className="mobile__results__container">
                            {this.displayMobileResults(currentQuery.results)}
                        </div>
                    </React.Fragment>
                )   
            else
                return (
                    <React.Fragment>
                    <h1 style={{textAlign: "center"}}>
                        <Icon name="filter" />{" "}
                        Query Results
                    </h1>
                    {/* <Header textAlign="center" as="h3" className="table__header">{currentQuery.name}</Header>  */}
                    <div>
                        <Table striped selectable className="results__table">
                            <Table.Header fullWidth>
                                <Table.Row className="results__row">
                                    <Table.HeaderCell>Stock #</Table.HeaderCell>
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
                <div className="oops__container">
                    <img src={oopsImage} className="no__results__image" />
                </div>
                // <Message id="no__results__message" >No queries, go create one now!</Message>
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