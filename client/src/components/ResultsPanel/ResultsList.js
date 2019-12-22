import React from "react";
import { connect } from "react-redux";
import { Table, Popup, Icon, Card } from "semantic-ui-react";
import { setCurrentQuery } from "../../actions";
import oopsImage from "../../assets/oopsImage.png";
import Skeleton from "./Skeleton";

/* List of query results */
class ResultsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: this.props.currentUser,
      resultsLoading: !this.props.currentQuery, // => when query is loaded, sets loading state to false
      windowDimensions: this.getWindowDimensions()
    };
    this.getWindowDimensions = this.getWindowDimensions.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  /* Adds listener to watch for window resize */
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }
  /* Removes window resize listener */
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  /* Retrieves window dimensions from the window API */
  getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  };

  /* Updates local state on window resize */
  handleResize = () => {
    const dimensions = this.getWindowDimensions();
    this.setState({ windowDimensions: dimensions });
  };

  /* Iterates through passed in query results to format and display list of data. */
  displayResults = results => {
    if (results && results.length > 0) {
      return results.map((result, i) => {
        return (
          <Table.Row key={i}>
            <Table.Cell>{result.stock}</Table.Cell>
            <Table.Cell>{result.year}</Table.Cell>
            <Table.Cell>{result.make}</Table.Cell>
            <Table.Cell>{result.model}</Table.Cell>
            <Table.Cell>{result.trim}</Table.Cell>
            <Table.Cell>
              {Number(result.price).toLocaleString("en-US", {
                style: "currency",
                currency: "USD"
              })}
            </Table.Cell>
            <Table.Cell className="seemore__container">
              {result.extColor}
              <Popup
                trigger={
                  <Icon
                    name="ellipsis horizontal"
                    size="big"
                    className="seemore__icon"
                  />
                }
                flowing
                hoverable
                position="top right"
                style={{ border: "solid blue 2px" }}
              >
                <h3>
                  {result.year} {result.make} {result.model} {result.trim}
                </h3>
                <div className="vehicle__details">
                  <div className="vehicle__details__primary">
                    <span>Stock #: {result.stock}</span>
                    <span>Engine: {result.metadata.engine}</span>
                    <span>Transmission: {result.metadata.transmission}</span>
                    <span>Ext. Color: {result.extColor}</span>
                    <span>Int. Color: {result.metadata.intColor}</span>
                    <span>Mileage: {result.metadata.miles}</span>
                    <span>Vin #: {result.metadata.vin}</span>
                  </div>
                  <div className="vehicle__details__secondary">
                    <h5>Price: ${result.price}</h5>
                    <a href={result.metadata.link} target="_blank">
                      See more
                    </a>
                    <a href={result.metadata.carfaxLink} target="_blank">
                      See Carfax
                    </a>
                  </div>
                </div>
                <h4>
                  <Icon name="point" />
                  {result.metadata.dealer}
                </h4>
              </Popup>
            </Table.Cell>
          </Table.Row>
        );
      });
    }
  };

  /* Mobile version of query results list, more mobile-friendly */
  displayMobileResults = results => {
    if (results && results.length > 0) {
      return results.map((result, i) => (
        // <div className="results__card">
        //     <h4>{result.year} {result.make} {result.model} {result.trim}</h4>
        // </div>
        <Card className="results__card" key={result.stock}>
          <Card.Content>
            <Card.Header>
              {result.year} {result.make} {result.model} {result.trim}
            </Card.Header>
            <Card.Description>
              <p>
                Price:{" "}
                {Number(result.price).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD"
                })}
              </p>
              <p>Stock #: {result.stock}</p>
              <hr></hr>
              <p>
                <Icon name="point" />
                {result.metadata.dealer}
              </p>
              <p>Engine: {result.metadata.engine}</p>
              <p>Transmission: {result.metadata.transmission}</p>
              <p>Ext. Color: {result.extColor}</p>
              <p>Int. Color: {result.metadata.intColor}</p>
              <p>Mileage: {result.metadata.miles}</p>
              <p>Vin #: {result.metadata.vin}</p>
            </Card.Description>
          </Card.Content>
          <Card.Content
            extra
            style={{ padding: 0 }}
            className="mobile__links__container"
          >
            <a href={result.metadata.link} target="_blank">
              See more
            </a>
            <a href={result.metadata.carfaxLink} target="_blank">
              See Carfax
            </a>
          </Card.Content>
        </Card>
      ));
    }
  };

  /* UI effect to show results are loading */
  displayResultsSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    const { currentQuery, isLoading } = this.props;
    const { resultsLoading } = this.state;

    if (!isLoading && currentQuery) { // --if props are done loading and there is a current query

      if (this.state.windowDimensions.width < 768) // --if mobile device size
        return (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" /> Query Results
            </h1>
            <div className="mobile__results__container">
              {this.displayMobileResults(currentQuery.results)}
            </div>
          </React.Fragment>
        );
      else // --if-not mobile device size
        return (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" /> Query Results
            </h1>
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
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.displayResults(currentQuery.results)}
                </Table.Body>
              </Table>
            </div>
          </React.Fragment>
        );

    } else if (!isLoading && !currentQuery) { // --if props are done loading but there is no current query
      return (
        <div className="oops__container">
          <img src={oopsImage} className="no__results__image" />
        </div>
      );

    } else { // --if props are loading
      return (
        <div className="table__container">
          {this.displayResultsSkeleton(resultsLoading)}
        </div>
      );
    }
  }
}

const mapStateToProps = state => ({
  currentQuery: state.query.currentQuery,
  isLoading: state.query.isLoading
});

export default connect(mapStateToProps, { setCurrentQuery })(ResultsList);
