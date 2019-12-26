import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Table, Popup, Icon, Button } from "semantic-ui-react";
import {
  setCurrentQuery,
  toggleMetaPanel,
  toggleSidePanel
} from "../../actions";
import oopsImage from "../../assets/oopsImage.png";
import Skeleton from "./Skeleton";
const firebase = require("../../firebase");

/* List of query results */
class ResultsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queriesRef: firebase.database().ref("queries"),
      currentUser: this.props.currentUser,
      currentQuery: this.props.currentQuery,
      sort: {
        method: "price",
        direction: "asc"
      },
      refreshLoading: false,
      resultsLoading: !this.props.currentQuery, // => when query is loaded, sets loading state to false
      activeResult: null
    };
  }

  /* Performs shallow comparison of current query in props, only updates local state if new data */
  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.currentQuery) !==
      JSON.stringify(this.props.currentQuery)
    ) {
      this.setState({ currentQuery: this.props.currentQuery });
    }
  }

  /* Iterates through passed in query results to format and display list of data. */
  displayResults = () => {
    const { currentQuery, sort } = this.state;
    let results = this.sortResults(currentQuery.results, sort); // sorts results using flag in state - can be changed by user

    if (results.length > 0) {
      return results.map((result, i) => (
          <Table.Row key={result.stock}>
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
        )
      )} else {
        return (
          <p>No results right now, check again tomorrow!</p>
        )
      }
    };
    

  displayMobileResults = () => {
    const { currentQuery, sort } = this.state;
    let results = this.sortResults(currentQuery.results, sort);

    if (results.length > 0) {
      return results.map((result, i) => (
        <div key={result.stock}>
          <div className="mobile__results__primary">
            <span>
              {result.year} {result.make} {result.model} {result.trim}
            </span>
            <small>
              {Number(result.price).toLocaleString("en-US", {
                style: "currency",
                currency: "USD"
              })}
            </small>
          </div>
          <div
            className="mobile__results__secondary"
            onClick={() => this.showDetails(result)}
          >
            <span className="stock__badge">#{result.stock}</span>
            <Icon name="angle right" onClick={this.closeDetails} />
          </div>
        </div>
      ));
    } else {
      return <p>No results right now, check again tomorrow!</p>
    }
  };

  /* Two functions to toggle mobile result detail screen */
  showDetails = result => {
    window.scrollTo(0, 0);
    this.setState({ activeResult: result });
  };
  closeDetails = () => {
    this.setState({ activeResult: null });
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

  /* Sets sort method and direction in local state, determined by user */
  setSort = (method, currentDirection) => {
    const newDirection = currentDirection === "asc" ? "desc" : "asc";
    this.setState({ sort: { method, direction: newDirection } });
  };

  /* Helper function to sort list of results depending on method and price */
  sortResults = (currentResults, sort) => {
    let results;
    if (currentResults)
      if (sort.method === "price")
        results =
          sort.direction === "asc"
            ? currentResults.sort((a, b) => (a.price > b.price ? 1 : -1))
            : currentResults.sort((a, b) => (a.price < b.price ? 1 : -1));
      else if (sort.method === "year")
        results =
          sort.direction === "asc"
            ? currentResults.sort((a, b) => (a.year > b.year ? 1 : -1))
            : currentResults.sort((a, b) => (a.year < b.year ? 1 : -1));
      else results = currentResults;
    else results = [];
    return results;
  };

  /* Refreshes results with new query data, scrapes website for required vehicles, then updates global state and firebase */
  refreshResults = async (query, currentUser) => {
    this.setState({ refreshLoading: true });
    const { model, price, minYear, maxYear, operator, settings } = query;
    const { allStores } = settings;
    const url = "/api/scrape";
    const payload = { model, price, minYear, maxYear, operator, allStores };
    const response = await axios.post(url, payload); // sends request to server for new vehicle data
    const queryResults = response.data.arr;
    const newQuery = query;
    newQuery.results = queryResults || [];
    await this.state.queriesRef // updates firebase with new results
      .child(currentUser.uid)
      .child(query.id)
      .update(newQuery)
      .then(() => {
        this.props.setCurrentQuery(newQuery); // updates global state with new query results
      })
      .catch(err => {
        console.log(err);
      });

    this.setState({ refreshLoading: false });
  };

  render() {
    const { currentUser, isLoading, sidePanelOpen, metaPanelOpen } = this.props;
    const {
      resultsLoading,
      activeResult,
      refreshLoading,
      currentQuery,
      sort
    } = this.state;

    if (!isLoading && currentQuery) {
      // --if props are done loading and there is a current query selected
      return (
        <React.Fragment>
          <div className="mobile__results__main"> {/* will only show if screen width <= 767px */}
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" /> Query Results
            </h1>
            <div className="results__actions">
              <div>
                <span
                  className="refresh__badge"
                  onClick={() => this.refreshResults(currentQuery, currentUser)}
                >
                  Refresh <Icon name="refresh" size="large" />
                </span>
              </div>
              <div>
                <span
                  className={`sort__badge ${
                    sort.method === "price" ? "active" : "disabled"
                  }`}
                  onClick={() => this.setSort("price", sort.direction)}
                >
                  Price{" "}
                  <Icon
                    name="arrow down"
                    size="large"
                    className={sort.direction}
                  />
                </span>
                <span
                  className={`sort__badge ${
                    sort.method === "year" ? "active" : "disabled"
                  }`}
                  onClick={() => this.setSort("year", sort.direction)}
                >
                  Year{" "}
                  <Icon
                    name="arrow down"
                    size="large"
                    className={sort.direction}
                  />
                </span>
              </div>
            </div>
            <div
              className={`mobile__results__container ${
                activeResult ? "active__detail" : ""
              }`}
            >
              {!refreshLoading
                ? this.displayMobileResults()
                : this.displayResultsSkeleton(refreshLoading)}
            </div>
            <div className="mobile__actions">
              <div
                onClick={this.props.toggleSidePanel}
                className={sidePanelOpen ? "open" : ""}
              >
                <Icon name="magnify" size="big" />
              </div>
              <div
                onClick={this.props.toggleMetaPanel}
                className={metaPanelOpen ? "open" : ""}
              >
                <Icon name="settings" size="big" />
              </div>
            </div>
            <div
              className={`mobile__result__details ${
                activeResult ? "active__detail" : ""
              }`}
            >
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
                      <h3>
                        {activeResult.year} {activeResult.make}{" "}
                        {activeResult.model} {activeResult.trim}
                      </h3>
                      <p style={{ fontWeight: 600 }}>
                        {Number(activeResult.price).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD"
                        })}
                      </p>
                    </div>
                    <div className="details__body__data">
                      <div>
                        <p>
                          Stock #: <span>{activeResult.stock}</span>
                        </p>
                        <p>
                          Miles: <span>{activeResult.metadata.miles}</span>
                        </p>
                        <p>
                          Engine: <span>{activeResult.metadata.engine}</span>
                        </p>
                        <p>
                          Transmission:{" "}
                          <span>{activeResult.metadata.transmission}</span>
                        </p>
                      </div>
                      <div>
                        <p>
                          Ext. Color: <span>{activeResult.extColor}</span>
                        </p>
                        <p>
                          Int. Color:{" "}
                          <span>{activeResult.metadata.intColor}</span>
                        </p>
                        <p>
                          Vin #: <span>{activeResult.metadata.vin}</span>
                        </p>
                        <p>
                          Dealer: <span>{activeResult.metadata.dealer}</span>
                        </p>
                      </div>
                    </div>
                    <div className="details__body__footer">
                      <Button className="button__3d">
                        <a href={activeResult.metadata.link} target="_blank">
                          See More
                        </a>
                      </Button>
                      <Button className="button__3d">
                        <a
                          href={activeResult.metadata.carfaxLink}
                          target="_blank"
                        >
                          CarFax
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="large__results__main"> {/* will only show if screen width >= 768px */}
            <h1 style={{ textAlign: "center" }}>
              <Icon name="filter" /> Query Results
              {/* <img src={metadata} className="metadata__icon1" /> */}
              <Icon
                name="settings"
                className="metadata__icon1"
                onClick={this.props.toggleMetaPanel}
              />
            </h1>
            <div className="results__actions">
              <div>
                <span
                  className="refresh__badge"
                  onClick={() => this.refreshResults(currentQuery, currentUser)}
                >
                  Refresh <Icon name="refresh" size="large" />
                </span>
              </div>
              <div>
                <span
                  className={`sort__badge ${
                    sort.method === "price" ? "active" : "disabled"
                  }`}
                  onClick={() => this.setSort("price", sort.direction)}
                >
                  Price{" "}
                  <Icon
                    name="arrow down"
                    size="large"
                    className={sort.direction}
                  />
                </span>
                <span
                  className={`sort__badge ${
                    sort.method === "year" ? "active" : "disabled"
                  }`}
                  onClick={() => this.setSort("year", sort.direction)}
                >
                  Year{" "}
                  <Icon
                    name="arrow down"
                    size="large"
                    className={sort.direction}
                  />
                </span>
              </div>
            </div>
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
                  {!refreshLoading && this.displayResults()}
                </Table.Body>
              </Table>
              {refreshLoading && this.displayResultsSkeleton(refreshLoading)}
            </div>
          </div>
        </React.Fragment>
      );
    } else if (!isLoading && !currentQuery) {
      // --if props are done loading but there is no current query
      return (
        <div className="oops__container">
          <img src={oopsImage} className="no__results__image" />
          <div className="mobile__actions">
            <div
              onClick={this.props.toggleSidePanel}
              className={sidePanelOpen ? "open" : ""}
            >
              <Icon name="magnify" size="big" />
            </div>
            <div
              onClick={this.props.toggleMetaPanel}
              className={metaPanelOpen ? "open" : ""}
            >
              <Icon name="settings" size="big" />
            </div>
          </div>
        </div>
      );
    } else {
      // --if props are loading
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
  sidePanelOpen: state.panel.sidePanelOpen,
  metaPanelOpen: state.panel.metaPanelOpen
});

export default connect(mapStateToProps, {
  setCurrentQuery,
  toggleMetaPanel,
  toggleSidePanel
})(ResultsList);
