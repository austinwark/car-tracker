import React from "react";
import axios from "axios";
import { connect } from 'react-redux';
import moment from "moment";
import {
  Form,
  Icon,
  Input,
  Button,
  Modal,
  Dropdown,
  Checkbox
} from "semantic-ui-react";
import { setCurrentQuery } from '../../actions';
const firebase = require("../../firebase");

/* Options to populate dropdown menu */
const modelOptions = [
  { text: "Avalon", value: "avalon", key: 0 },
  { text: "Camry", value: "camry", key: 1 },
  { text: "Corolla", value: "corolla", key: 2 },
  { text: "Prius", value: "prius", key: 3 },
  { text: "Sienna", value: "sienna", key: 4 },
  { text: "4runner", value: "4runner", key: 5 },
  { text: "Highlander", value: "highlander", key: 6 },
  { text: "Rav4", value: "rav4", key: 7 },
  { text: "Tacoma", value: "tacoma", key: 8 },
  { text: "Tundra", value: "tundra", key: 9 }
];

/* Initial values for query details, vehicle details, and customer details in local state */
const INITIAL_QUERY = {
  queryName: "",
  settings: {
    autoEmails: true,
    onlyNew: true,
    allStores: false
  }
};
const INITIAL_VEHICLE = {
  model: "",
  price: "",
  minYear: 0,
  maxYear: moment().year() + 1,
  settings: {
    operator: "less"
  }
};
const INITIAL_CUSTOMER = {
  customerName: "",
  customerPhone: "",
  customerNotes: ""
};
// used to keep track of validated inputs
const INITIAL_VALIDATION = {
  queryName: "",
  model: "",
  price: "",
  minYear: "",
  maxYear: ""
};

/* Multi-step form used to create & save a query */
class Create extends React.Component {
  state = {
    currentUser: this.props.currentUser,
    queriesRef: firebase.database().ref(`queries`),
    numberOfQueries: 0,
    query: INITIAL_QUERY,
    vehicle: INITIAL_VEHICLE,
    customer: INITIAL_CUSTOMER,
    enabled: false,
    disabled: true,
    loading: false,
    error: null,
    success: true,
    modal: false,
    index: 0,
    lastIndex: 0,
    validation: INITIAL_VALIDATION,
    helpMessage: ""
  };

  /* Keeps track of number of queries user has. Runs every component update, but only acts if number of queries has changed */
  componentDidUpdate() {
    const { currentUser } = this.props;
    this.state.queriesRef.child(currentUser.uid).once("value", snap => {
      if (snap.val()) {
        const numberOfQueries = Object.keys(snap.val()).length;
        if (numberOfQueries !== this.state.numberOfQueries)
          this.setState({ numberOfQueries });
      }
    });
  }

  /* Helper function to reset local state objects and close modal */
  resetFields = () => {
    this.setState({
      query: INITIAL_QUERY,
      vehicle: INITIAL_VEHICLE,
      customer: INITIAL_CUSTOMER,
      modal: false
    });
  };

  /* Controls modal open/close state */
  openModal = () => this.setState({ modal: true, index: 0 });
  closeModal = () => this.resetFields();

  /* Updates local state with query input. Validates in real-time */
  handleQueryChange = event => {
    const { name, value } = event.target;
    let err = "";
    // Error feedback will be either shown or removed on each change
    if (name === "queryName" && value.length >= 21)
      err = "Query name must be less than 21 characters";
    this.setState(prevState => ({
      query: { ...prevState.query, [name]: value },
      validation: { ...prevState.validation, [name]: err }
    }));
  };

  /* Toggles query settings checkboxes values in state */
  handleQuerySettingsChange = (event, { name }) => {
    const currentValue = this.state.query.settings[name];

    this.setState(prevState => ({
      query: {
        ...prevState.query,
        settings: {
          ...prevState.query.settings,
          [name]: !currentValue
        }
      }
    }));
  };

  /* Updates local state with vehicle data. Validates in real time */
  handleVehicleChange = (event, { name, value }) => {
    let err = "";
    if (name === "price" && value > 100000)
      err = "Price must not be greater than $100,000";
    else if (name === "price" && value < 0)
      err = "Price must not be less than $0";  
    if (
      (name === "minYear" && value < 0) || (name === "minYear" && value > moment().year() + 1)
      || ((name === "maxYear" && value < 0) || (name === "maxYear" && value > moment().year() + 1))
    ) err = `Model years must be between 0 and ${moment().year() + 1}`;

    this.setState(prevState => ({
      vehicle: { ...prevState.vehicle, [name]: value },
      validation: { ...prevState.validation, [name]: err }
    }));
  };

  /* Updates local state with vehicle settings data */
  handleVehicleSettingsChange = (event, { name }) => {
    this.setState(prevState => ({
      vehicle: {
        ...prevState.vehicle,
        settings: {
          operator: name
        }
      }
    }));
  };

  /* Updates local state with customer data -> validates in real time */
  handleCustomerChange = event => {
    const { name, value } = event.target;
    let err = "";
    if (name === "customerName" && value.length >= 16)
      err = "Name must be less than 16 characters";
    if (name === "customerPhone" && value.length >= 15)
      err = "Phone must be less than 15 characters";
    if (name === "customerNotes" && value.length >= 31)
      err = "Notes must be less than 31 characters";
    this.setState(prevState => ({
      customer: {
        ...prevState.customer,
        [name]: value
      },
      validation: {
        ...prevState.validation,
        [name]: err
      }
    }));
  };

  /* Validates inputs on submit -> uses three helper functions below */
  isValid = (query, vehicle, customer = null) => {
    const isQueryValid = this.isQueryValid(query.queryName);
    // prettier-ignore
    const isVehicleValid = this.isVehicleValid(vehicle.model, vehicle.price, vehicle.settings.operator);
    //prettier-ignore
    const isCustomerValid = customer  // customer fields are optional
      ? this.isCustomerValid(customer.customerName, customer.customerPhone, customer.customerNotes)
      : true;
    return (isQueryValid && isVehicleValid && isCustomerValid);
  };

  isQueryValid = queryName => {
    return (queryName.length >= 1 && queryName.length <= 20);
  };

  isVehicleValid = (model, price, operator) => {
    return (model && price && price >= 0 && price <= 100000);
  };

  // prettier-ignore
  isCustomerValid = ( customerName = "", customerPhone = "", customerNotes = "" ) => {
    return (customerName.length <= 15 && customerPhone.length <= 14 && customerNotes.length <= 30);
  };

  /* Submits new query data to database and generates the first round of query results */
  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ loading: true });
    const { query, vehicle, customer, currentUser, queriesRef } = this.state;
    const { queryName } = query;
    // prettier-ignore
    const { model, price, minYear, maxYear } = vehicle, { operator } = vehicle.settings;
    const isValid = this.isValid(query, vehicle, customer); // 1) Validates input
    if (!isValid) {
      this.setState({ error: "Something is not valid", loading: false });
    } else {
      const creationDate = moment().format("L");
      const key = queriesRef.child(currentUser.uid).push().key; // 2) Adds child to collection in database
      let newQuery = { // 3) Collects all query data into one object, using the returned key from DB as an ID
        id: key,
        name: queryName,
        model,
        price,
        minYear,
        maxYear,
        operator,
        customer,
        creationDate,
        isOwnerAnonymous: currentUser.isAnonymous,
        sentResults: [],
        settings: query.settings
      };
      newQuery = await this.getQueryResults(newQuery); // 4) retrieves new query's results through web scraping
      queriesRef
        .child(currentUser.uid)
        .child(key)
        .update(newQuery) // 5) saves the new query w/ results in firebase
        .then(() => {
          this.closeModal();
          this.setState({ loading: false, error: null });
          this.props.setCurrentQuery(newQuery);
        })
        .catch(err => {
          //this.resetFields();
          this.setState({ loading: false, error: err });
        });
    }
  };

  /* Retrieves and returns query results through web scraping on the back end */
  getQueryResults = async query => {
    const { model, price, minYear, maxYear, operator, settings } = query;
    const { allStores } = settings;
    const url = "/api/scrape";
    const payload = { model, price, minYear, maxYear, operator, allStores }; 
    const response = await axios.post(url, payload); // sends required vehicle info on request to server and saves the returned list of results
    const queryResults = response.data.arr;
    const newQuery = query;
    newQuery.results = queryResults || []; // attaches results to passed in query as key / value pair
    return newQuery;
  };

  /* controls the step "slideshow" on the multi step form */
  handleSlide = i => {
    this.setState({ lastIndex: this.state.index, index: Number(i) });
  };

  /* returns a className to the "slide" containers -- used to determine correct animation for tranisitions */
  determineDirection(index, lastIndex, dataIndex) {
    let direction;
    if (index === dataIndex) { // --if slide is the next one to show, used to transition in
      if (index === lastIndex) direction = "primary activeSlide";
      else if (index > lastIndex) direction = "forwardsIn activeSlide";
      else direction = "backIn activeSlide";
    } else {
      if (dataIndex === lastIndex) { // --if slide was the last shown slide, used to tranisition out
        if (index > lastIndex) direction = "forwardsOut";
        else if (index < lastIndex) direction = "backOut";
      }
    }
    return direction;
  }

  /* Controls form progress bar width */
  getProgressWidth() {
    const { index } = this.state;
    if (index === 0) return "25%";
    if (index === 1) return "50%";
    if (index === 2) return "75%";
    if (index === 3) return "100%";
  }

  /* Validates query info upon the next button clicked */
  handleQuerySubmit(queryName) {
    let err = "";
    if (!queryName) err = "Query name is required";
    else if (queryName.length > 20)
      err = "Query name must be less than 21 characters";
    this.setState(prevState => ({
      validation: {
        ...prevState.validation,
        queryName: err
      }
    }));
    if (!err) this.handleSlide(1); // --if not error, proceed to next step
  }
  
  /* Validates vehicle info upon the next button being clicked */
  handleVehicleSubmit(model, price) {
    let modelErr = "",
      priceErr = "";
    if (!model) modelErr = "Model is required";
    if (!price) priceErr = "Price is required";
    else if (price > 100000) priceErr = "Price must not be greater than $100,000";
    else if (price < 0) priceErr = "Price must not be less than $0";
    this.setState(prevState => ({
      validation: {
        ...prevState.validation,
        model: modelErr,
        price: priceErr
      }
    }));
    if (!modelErr && !priceErr) this.handleSlide(2); // --if no error, proceed to next step
  }

  /* Validates customer info upon the next button being clicked */
  handleCustomerSubmit(name, phone, notes) {
    let nameErr = "",
      phoneErr = "",
      notesErr = "";
    if (name.length > 15) nameErr = "Name must be less than 16 characters";
    if (phone.length > 14)
      phoneErr = "Phone number must be less than 15 characters";
    if (notes.length > 30) notesErr = "Notes must be less than 31 characters";
    this.setState(prevState => ({
      validation: {
        ...prevState.validation,
        customerName: nameErr,
        customerPhone: phoneErr,
        customerNotes: notesErr
      }
    }));
    if (!nameErr && !phoneErr && !notesErr) this.handleSlide(3); // --if no error, proceed to last step
  }

  /* Toggles visibility of help message on each form step, uses attribute on clicked icon to determine section to display */
  toggleHelpMessage = e => {
    const sectionName = e.target.getAttribute("data-section");
    this.state.helpMessage === sectionName
      ? this.setState({ helpMessage: "" })
      : this.setState({ helpMessage: sectionName });
  };

  render() {
    const {
      modal,
      query,
      vehicle,
      customer,
      loading,
      index,
      lastIndex,
      validation,
      helpMessage
    } = this.state;
    return (
      <div>
        <Modal
          open={modal}
          onClose={this.closeModal}
          className="mx-auto"
          id="create__modal"
        >
          <Modal.Header id="create__header">
            <div>Query</div>
            <div>Vehicle</div>
            <div>Customer</div>
            <div>Finish</div>
            <p
              className="create__progress"
              style={{ width: this.getProgressWidth() }}
            ></p>
          </Modal.Header>
          <Modal.Content>
            <Form autoComplete="off" loading={loading}>
              <div className="step__container">
                <div className={this.determineDirection(index, lastIndex, 0)}>
                  <section>
                    <Icon
                      className="section__help"
                      name="question circle outline"
                      size="big"
                      data-section="query"
                      onClick={this.toggleHelpMessage}
                    />
                    <div className="form__section">
                      <Form.Field
                        control={Input}
                        name="queryName"
                        label="Query Name"
                        placeholder="e.g. John Smith's Corolla"
                        onChange={this.handleQueryChange}
                        type="text"
                        value={query.queryName}
                        id="form__field"
                      />
                      <p
                        className={
                          validation.queryName ? "not__valid" : "valid"
                        }
                      >
                        {validation.queryName || "valid"}
                      </p>
                      <div className="options__container">
                        <Form.Field>
                          <Checkbox
                            checked={query.settings.autoEmails}
                            radio
                            label="Automatic Email Updates"
                            name="autoEmails"
                            onClick={this.handleQuerySettingsChange}
                          />
                        </Form.Field>
                        <Form.Field>
                          <Checkbox
                            checked={
                              query.settings.autoEmails
                                ? query.settings.onlyNew
                                : false
                            }
                            radio
                            label="Send only new results"
                            name="onlyNew"
                            disabled={query.settings.autoEmails ? false : true}
                            onClick={
                              query.settings.autoEmails
                                ? this.handleQuerySettingsChange
                                : null
                            }
                          />
                        </Form.Field>
                        <Form.Field>
                          <Checkbox
                            checked={query.settings.allStores}
                            radio
                            label="Search all stores"
                            name="allStores"
                            onClick={this.handleQuerySettingsChange}
                          />
                        </Form.Field>
                      </div>
                    </div>
                    <div className="nav__section">
                      <Button
                        type="button"
                        fluid
                        className="secondary__button"
                        onClick={() => this.handleQuerySubmit(query.queryName)}
                      >
                        Next
                      </Button>
                    </div>
                  </section>
                  <section
                    className={`field__info ${
                      helpMessage === "query" ? "active" : ""
                    }`}
                  >
                    <div className="help__message">
                      <h3>Query Info</h3>
                      <ol>
                        <li>The query name is used to identify your query</li>
                        <li>
                          Disabling the automatic email updates will prevent the
                          Trackr Appr from sending you daily query results via
                          email
                        </li>
                        <li>
                          If automatic email updates are kept enabled, you can
                          decide whether the app will send only unseen query
                          results, or everything the search finds every time.
                        </li>
                        <li>
                          You can choose to search every Lia Toyota Dealer, or
                          just Toyota of Colonie. Default is just Toyota of
                          Colonie.
                        </li>
                      </ol>
                    </div>
                  </section>
                </div>
                <div className={this.determineDirection(index, lastIndex, 1)}>
                  <section>
                    <Icon
                      className="section__help"
                      name="question circle outline"
                      size="big"
                      data-section="vehicle"
                      onClick={this.toggleHelpMessage}
                    />
                    <div className="form__section">
                      <label
                        className="dropdown__label"
                        htmlFor="dropdown__field"
                      >
                        Model
                      </label>
                      <Dropdown
                        onChange={this.handleVehicleChange}
                        name="model"
                        label="Model"
                        labeled
                        placeholder="Model"
                        options={modelOptions}
                        value={vehicle.model}
                        selection
                        id="dropdown__field"
                      />
                      <p className={validation.model ? "not__valid" : "valid"}>
                        {validation.model || "valid"}
                      </p>
                      <Form.Field
                        control={Input}
                        label="Price"
                        name="price"
                        placeholder="Price"
                        value={vehicle.price}
                        type="number"
                        onChange={this.handleVehicleChange}
                      />
                      <p className={validation.price ? "not__valid" : "valid"}>
                        {validation.price || "valid"}
                      </p>
                      <Form.Group className="create__years">
                        <Form.Field
                          inline
                          control={Input}
                          label="Min Year"
                          name="minYear"
                          placeholder="0"
                          type="number"
                          value={vehicle.minYear}
                          onChange={this.handleVehicleChange}
                          />
                        <Form.Field
                          inline
                          control={Input}
                          label="Max Year"
                          name="maxYear"
                          placeholder={moment().year() + 1}
                          type="number"
                          value={vehicle.maxYear}
                          onChange={this.handleVehicleChange}
                        />
                      </Form.Group>
                      <p className={validation.minYear || validation.maxYear ? "not__valid" : "valid"}>
                        {validation.minYear || validation.maxYear || "valid"}
                      </p>
                      <div className="options__container">
                        <Form.Field>
                          <Checkbox
                            checked={vehicle.settings.operator === "less"}
                            radio
                            label={`Less than ${
                              vehicle.price ? "$" + vehicle.price : ""
                            }`}
                            name="less"
                            onChange={this.handleVehicleSettingsChange}
                          />
                        </Form.Field>
                        <Form.Field>
                          <Checkbox
                            checked={vehicle.settings.operator === "greater"}
                            radio
                            label={`Greater than ${vehicle.price &&
                              "$" + vehicle.price}`}
                            name="greater"
                            onChange={this.handleVehicleSettingsChange}
                          />
                        </Form.Field>
                      </div>
                    </div>
                    <div className="nav__section">
                      <Button
                        type="button"
                        icon
                        className="secondary__button"
                        onClick={() => this.handleSlide(index - 1)}
                      >
                        <Icon name="arrow left" />
                      </Button>
                      <Button
                        type="button"
                        fluid
                        className="secondary__button"
                        onClick={() =>
                          this.handleVehicleSubmit(vehicle.model, vehicle.price)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </section>
                  <section
                    className={`field__info ${
                      helpMessage === "vehicle" ? "active" : ""
                    }`}
                  >
                    <div className="help__message">
                      <h3>Vehicle Info</h3>
                      <ol>
                        <li>Select a model to search for daily</li>
                        <li>
                          Input a price and select an operator to either search
                          below or above the chosen price
                        </li>
                      </ol>
                    </div>
                  </section>
                </div>
                <div className={this.determineDirection(index, lastIndex, 2)}>
                  <section>
                    <Icon
                      className="section__help"
                      name="question circle outline"
                      size="big"
                      data-section="customer"
                      onClick={this.toggleHelpMessage}
                    />
                    <div className="form__section">
                      <Form.Field
                        control={Input}
                        name="customerName"
                        label="Name (optional)"
                        placeholder="e.g. John Smith"
                        onChange={this.handleCustomerChange}
                        type="text"
                        value={customer.customerName}
                      />
                      <p
                        className={
                          validation.customerName ? "not__valid" : "valid"
                        }
                      >
                        {validation.customerName || "valid"}
                      </p>
                      <Form.Field
                        control={Input}
                        name="customerPhone"
                        label="Phone (optional)"
                        placeholder="e.g. 518 555-5555"
                        onChange={this.handleCustomerChange}
                        type="tel"
                        value={customer.customerPhone}
                      />
                      <p
                        className={
                          validation.customerPhone ? "not__valid" : "valid"
                        }
                      >
                        {validation.customerPhone || "valid"}
                      </p>
                      <Form.Field
                        control={Input}
                        name="customerNotes"
                        label="Notes (optional)"
                        placeholder="e.g. Needs by end of month"
                        onChange={this.handleCustomerChange}
                        type="text"
                        value={customer.customerNotes}
                        id="notes__field"
                      />
                      <p
                        className={
                          validation.customerNotes ? "not__valid" : "valid"
                        }
                      >
                        {validation.customerNotes || "valid"}
                      </p>
                    </div>
                    <div className="nav__section">
                      <Button
                        type="button"
                        icon
                        className="secondary__button"
                        onClick={() => this.handleSlide(index - 1)}
                      >
                        <Icon name="arrow left" />
                      </Button>
                      <Button
                        type="submit"
                        fluid
                        className="secondary__button"
                        onClick={() =>
                          this.handleCustomerSubmit(
                            customer.customerName,
                            customer.customerPhone,
                            customer.customerNotes
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </section>
                  <section
                    className={`field__info ${
                      helpMessage === "customer" ? "active" : ""
                    }`}
                  >
                    <div className="help__message">
                      <h3>Customer Info</h3>
                      <ol>
                        <li>
                          This section is simply for keeping track of the
                          customer the query is designed for
                        </li>
                      </ol>
                    </div>
                  </section>
                </div>
                <div className={this.determineDirection(index, lastIndex, 3)}>
                  <section className="review__list__container"> 
                    <div>
                      <h2>Review</h2>
                      <ol className="review__list">
                        <li className="review__list__header">Query</li>
                        <li>
                          <ol>
                            <li>Name: {query.queryName}</li>
                            <li>Auto emails: {query.settings.autoEmails ? "yes" : "no"}</li>
                            <li>Only new: {query.settings.onlyNew ? "yes" : "no"}</li>
                            <li>All stores: {query.settings.allStores ? "yes" : "no"}</li>
                          </ol>
                        </li>
                        <li className="review__list__header">Vehicle</li>
                        <li>
                          <ol>
                            <li>Model: {vehicle.model}</li>
                              <li>
                                Price: {vehicle.settings.operator} than {Number(vehicle.price).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD"
                                })}
                            </li>
                          </ol>
                        </li>
                        <li className="review__list__header">Customer</li>
                        <li>
                          <ol>
                            <li>Name: {customer.customerName}</li>
                            <li>Phone: {customer.customerPhone}</li>
                            <li>Notes: {customer.customerNotes}</li>
                          </ol>
                        </li>
                      </ol>
                    </div>
                    <div className="nav__section">
                        <Button
                          type="button"
                          icon
                          className="secondary__button"
                          onClick={() => this.handleSlide(index - 1)}
                        >
                          <Icon name="arrow left" />
                        </Button>
                      </div>
                  </section>
                  <section>
                    <div className="submit__section">
                      <h3>Everything looks good?</h3>
                        <Button
                          type="button"
                          fluid
                          className="secondary__button"
                          onClick={this.handleSubmit}
                        >
                          Submit
                        </Button>
                    </div>
                  </section>
                </div>
              </div>
            </Form>
          </Modal.Content>
        </Modal>
        <Button
          id="sidePanel__button"
          className="button__3d"
          content="Create Query"
          onClick={this.openModal}
          disabled={this.state.numberOfQueries >= 5}
        />
        {this.state.numberOfQueries >= 5 && ( // shows error message is max queries is reached
          <span className="max__queries__span">
            Maximum number of queries reached
          </span>
        )}
      </div>
    );
  }
}

export default connect(null, { setCurrentQuery })(Create);
