import React from "react";
import { connect } from "react-redux";
import axios from 'axios';
import { Table, Popup, Icon, Button } from "semantic-ui-react";
import { setCurrentQuery, toggleMetaPanel, toggleSidePanel } from "../../actions";
import oopsImage from "../../assets/oopsImage.png";
import Skeleton from "./Skeleton";
const firebase = require("../../firebase");

/* List of query results */
class ResultsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queriesRef: firebase.database().ref('queries'),
      currentUser: this.props.currentUser,
      sortDirection: "asc",
      resultsLoading: !this.props.currentQuery, // => when query is loaded, sets loading state to false
      activeResult: null
    };
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.currentQuery)
  //     if (this.props.currentQuery.results)
  //       if (this.props.currentQuery.results.length !== prevState.sortedResults.length) {
  //         this.setState({ sortedResults: this.props.currentQuery.results })
  //       }
  //     else if (prevState.sortedResults.length > 0)
  //       this.setState({ sortedResults: [] })
  // }

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

  displayMobileResults = results => {
    if (results && results.length > 0) {
      return results.map((result, i) => (
        <div>
          <div className="mobile__results__primary">
            <span>{result.year} {result.make} {result.model} {result.trim}</span>
            <small>
              {Number(result.price).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD"
              })}
            </small>
          </div>
          <div className="mobile__results__secondary" onClick={() => this.showDetails(result)}>
                <span className="stock__badge">
                  #{result.stock}
                </span>
                <Icon name="angle right" onClick={this.closeDetails} />
          </div>
        </div>
      ))
    }
  }

  showDetails = result => {
    this.setState({ activeResult: result });
  }
  closeDetails = () => {
    this.setState({ activeResult: null });
  }

  /* UI effect to show results are loading */
  displayResultsSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

    toggleSortDirection = () => {
      const { sortDirection } = this.state;
      sortDirection === "asc"
        ? this.setState({ sortDirection: "desc" })
        : this.setState({ sortDirection: "asc"})
    }

    refreshResults = async (query, currentUser) => {
      const { model, price, operator, settings } = query;
      const { allStores } = settings;
      const url = "/api/scrape";
      const payload = { model, price, operator, allStores };
      const response = await axios.post(url, payload);
      const queryResults = response.data.arr;
      if (queryResults.length <= 0) {
        const newQuery = query;
        newQuery.results = [];
        return newQuery;
      }
      const newQuery = query;
      newQuery.results = queryResults;
      console.log(newQuery)
      await this.state.queriesRef
        .child(currentUser.uid)
        .child(query.id)
        .update(newQuery)
        .then(() => {
          this.props.setCurrentQuery(newQuery);
        })
        .catch(err => {
          console.log(err)
        })
    };

  render() {
    const { currentQuery, currentUser, isLoading, sidePanelOpen, metaPanelOpen } = this.props;
    const { resultsLoading, activeResult, sortDirection } = this.state;

    if (!isLoading && currentQuery) { // --if props are done loading and there is a current query
      
      // let sortedResults = currentQuery.results
      //   ? currentQuery.results.sort((a, b) => (a.price > b.price ? 1 : -1))
      //   : []
      
      let sortedResults = currentQuery.results
        ? ( sortDirection === "asc"
            ? currentQuery.results.sort((a, b) => (a.price > b.price ? 1 : -1))
            : currentQuery.results.sort((a, b) => (a.price < b.price ? 1 : -1)) )
        : []

      if (this.props.windowDimensions.width < 768) // --if mobile device size
        return (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" />{" "}
              Query Results
            </h1>
            <div className="mobile__results__actions">
              <Icon name="arrow alternate circle down outline" size="large" onClick={this.toggleSortDirection} className={sortDirection} />
              <Icon name="refresh" size="large" onClick={() => this.refreshResults(currentQuery, currentUser)} />
            </div>
            <div className={`mobile__results__container ${activeResult && "active__detail"}`}>
              {this.displayMobileResults(sortedResults)}
            </div>
            <div className="mobile__actions">
              <div onClick={this.props.toggleSidePanel} className={sidePanelOpen ? "open" : ""}>
                <Icon name="magnify" size="big" />
              </div>
              <div onClick={this.props.toggleMetaPanel} className={metaPanelOpen ? "open" : ""}>
                <Icon name="settings" size="big" />
              </div>
            </div>
            <div className={`mobile__result__details ${activeResult && "active__detail"}`}>
              <div className="details__header">
                <div onClick={this.closeDetails}>
                  <Icon name="angle right" />
                </div>
                <h3>Details</h3>
              </div>
              <div className="details__body">
                {activeResult && (
                  <>
                    <div className="details__body__header">
                      <h3>{activeResult.year} {activeResult.make} {activeResult.model} {activeResult.trim}</h3>
                      <p style={{fontWeight: 600}}>{Number(activeResult.price).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD"
                        })}</p>
                    </div>
                    <div className="details__body__data">
                      <div>
                        <p>Stock #: <span>{activeResult.stock}</span></p>
                        <p>Miles: <span>{activeResult.metadata.miles}</span></p>
                        <p>Engine: <span>{activeResult.metadata.engine}</span></p>
                        <p>Transmission: <span>{activeResult.metadata.transmission}</span></p>
                      </div>
                      <div>
                        <p>Ext. Color: <span>{activeResult.extColor}</span></p>
                        <p>Int. Color: <span>{activeResult.metadata.intColor}</span></p>
                        <p>Vin #: <span>{activeResult.metadata.vin}</span></p>
                        <p>Dealer: <span>{activeResult.metadata.dealer}</span></p>
                      </div>
                    </div>
                    <div className="details__body__footer">
                      <Button className="button__3d"><a href={activeResult.metadata.link} target="_blank">See More</a></Button>
                      <Button className="button__3d"><a href={activeResult.metadata.carfaxLink} target="_blank">CarFax</a></Button>
                      {/* <button className="button__3d">See More</button>
                      <button className="button__3d">CarFax</button> */}
                      {/* <a href={activeResult.metadata.link}>See More</a>
                      <a href={activeResult.metadata.carfaxLink}>CarFax</a> */}
                    </div>
                  </>
                )}
              </div>
              
            </div>
          </React.Fragment>
        );
      else // --if-not mobile device size
        return (
          <React.Fragment>
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" />{" "}
              Query Results
              {/* <img src={metadata} className="metadata__icon1" /> */}
              <Icon name="settings" className="metadata__icon1" onClick={this.props.toggleMetaPanel} />
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
                  {this.displayResults(sortedResults)}
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
  isLoading: state.query.isLoading,
  windowDimensions: state.window.windowDimensions,
  sidePanelOpen: state.panel.sidePanelOpen,
  metaPanelOpen: state.panel.metaPanelOpen
});

export default connect(mapStateToProps, { setCurrentQuery, toggleMetaPanel, toggleSidePanel })(ResultsList);
