import axios from 'axios';
import React from 'react';
import moment from 'moment';

// import firebase from '../../firebase';

import { Form, Icon, Checkbox, Input, Select, Button, Modal, Label, Dropdown } from 'semantic-ui-react';

const firebase = require('../../firebase');
const uuidv4 = require('uuid/v4');

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
]
/* for validating model input */
const modelOptionsArray = ["avalon", "camry", "corolla", "prius", "sienna", "4runner", "highlander", "rav4", "tacoma", "tundra"];

const INITIAL_QUERY = {
    queryName: "",
    settings: {
        autoEmails: true,
        onlyNew: true,
        allStores: false
    }
}
const INITIAL_VEHICLE = {
    model: "",
    price: "",
    settings: {
        operator: "less"
    }
}
const INITIAL_CUSTOMER = {
    customerName: '',
    customerPhone: '',
    customerNotes: ''
}
const INITIAL_VALIDATION = {
    queryName: "",
    model: "",
    price: ""
}
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
    }

    componentDidUpdate() {
        const { currentUser } = this.props;
        this.state.queriesRef.child(currentUser.uid).once('value', snap => {
            if (snap.val()) {
                const numberOfQueries = Object.keys(snap.val()).length;
                if (numberOfQueries !== this.state.numberOfQueries)
                    this.setState({ numberOfQueries });
            }
        })
    }
    //
    // componentDidUpdate() {
    //     const createModal = document.getElementById("create__modal");
    //     if (createModal) {
    //         const inputs = document.getElementsByTagName("input");
    //         const buttons = document.getElementsByTagName("button");
    //         const dropDown = document.getElementById("dropdown__field");
    //         for (let i = 0;i < inputs.length;i++) {
    //             inputs[i].setAttribute("tabindex", "-1");
    //         }   
    //         for (let i = 0;i < buttons.length;i++) {
    //             buttons[i].setAttribute("tabindex", "-1");
    //         }   
    //         dropDown.setAttribute("tabindex", "-1");
    //     }
    // }
    
    resetFields = () => {
        this.setState({
            query: INITIAL_QUERY,
            vehicle: INITIAL_VEHICLE,
            customer: INITIAL_CUSTOMER,
            modal: false
        })
    }
    // resetFields = () => {
    //     this.setState({
    //         queryName: "",
    //         model: "",
    //         operator: "",
    //         price: 0,
    //         enabled: false,
    //         customerName: '',
    //         customerPhone: '',
    //         customerNotes: '',
    //         modal: false
    //     });
    // }

    openModal = () => this.setState({ modal: true, index: 0 });

    closeModal = () => this.resetFields();

    handleNameChange = event => {
        this.setState({ queryName: event.target.value });
    }

    handleOperatorChange = (event, { value }) => {
        this.setState({ operator: value });
    }

    handleQueryChange = event => {
        const { name, value } = event.target;
        const { query } = this.state;
        let err = "";
        if (name === "queryName" && query.queryName.length >= 20) err = "Query name must be less than 21 characters";

        this.setState(prevState => ({
            query: { ...prevState.query, [name]: value },
            validation: { ...prevState.validation, [name]: err }
        }));
    }

    
    handleQuerySettingsChange = (name, value) => {
        if (name === "onlyNew" && this.state.query.settings.autoEmails === false)
            return;
        else if (name === "autoEmails" && this.state.query.settings.autoEmails === true)
            this.setState(prevState => ({
                query: {
                    ...prevState.query,
                    settings: { autoEmails: false, onlyNew: false }
                }
            }))
        else
            this.setState(prevState => ({
                query: {
                    ...prevState.query,
                    settings: {
                        ...prevState.query.settings,
                        [name]: !value
                    }
                }
            }))
    }
    handleModelChange = (event, { value }) => {
        // this.setState({ model: value });
        this.setState(prevState => ({
            vehicle: {
                ...prevState.vehicle,
                model: value
            }
        }))
    }
    handleVehicleChange = event => {
        const { name, value } = event.target;
        console.log(name, value)
        this.setState(prevState => ({
            vehicle: {
                ...prevState.vehicle,
                [name]: value
            }
        }))
    }
    
    handleVehicleSettingsChange = (name, value) => {
        this.setState(prevState => ({
            vehicle: {
                ...prevState.vehicle,
                settings: {
                    [name]: value
                }
            }
            
        }))
    }

    handleCustomerChange = event => {
        const { name, value } = event.target;
        const { customer } = this.state;
        let err = "";
        if (name === "customerName" && customer.customerName.length >= 16) err = "Name must be less than 16 characters";
        if (name === "customerPhone" && customer.customerPhone.length >= 15) err = "Phone must be less than 15 characters";
        if (name === "customerNotes" && customer.customerNotes.length >= 31) err = "Notes must be less than 31 characters";
        this.setState(prevState => ({
            customer: {
                ...prevState.customer,
                [name]: value
            },
            validation: {
                ...prevState.validation,
                [name]: err
            }
        }))
    }

    isQueryValid = queryName => {
        if (queryName.length < 1) return false;
        else if (queryName.length > 20) return false;
        else return true;
    }
    isVehicleValid = (model, price, operator) => {
        if (!model) return false;
        else if (!price) return false;
        else if (price < 5000) return false;
        else if (price > 50000) return false;
        else return true;
    }
    isCustomerValid = (customerName = "", customerPhone = "", customerNotes = "") => {
        if (customerName.length > 15) return false;
        else if (customerPhone.length > 14) return false;
        else if (customerNotes.length > 30) return false;
        else return true;
    }
    isValid = (query, vehicle, customer = null) => {
        const isQueryValid = this.isQueryValid(query.queryName);
        const isVehicleValid = this.isVehicleValid(vehicle.model, vehicle.price, vehicle.settings.operator);
        const isCustomerValid = customer ? this.isCustomerValid(customer.customerName, customer.customerPhone, customer.customerNotes) : true;
        if (isQueryValid && isVehicleValid && isCustomerValid) return true;
        else return false;
    }


    /* Previous handling of new query */
    handleSubmit = async event => {
        this.setState({ loading: true });
        const { query, vehicle, customer, currentUser, queriesRef } = this.state;
        const { queryName } = query;
        const { model, price } = vehicle, { operator } = vehicle.settings; 
        const isValid = this.isValid(query, vehicle, customer);

        if (!isValid) {
            this.setState({ error: "Something is not valid", loading: false });
        } else {
            const creationDate = moment().format("L");
            const key = queriesRef.child(currentUser.uid).push().key;
            let newQuery = {
                id: key,
                name: queryName,
                model,
                price,
                operator,
                customer,
                creationDate,
                isOwnerAnonymous: currentUser.isAnonymous,
                sentResults: [],
                settings: query.settings
            };
            newQuery = await this.getQueryResults(newQuery);
            queriesRef
                .child(currentUser.uid)
                .child(key)
                .update(newQuery)
                .then(() => {
                    console.log('query added')
                    this.closeModal();
                    this.setState({ loading: false, error: null });
                    // window.location.reload(false);
                })
                .catch(err => {
                    console.error(err);
                    //this.resetFields();
                    this.setState({ loading: false, error: err });
                })
        }
    }

    

    getQueryResults = async query => {
        const { model, price, operator, settings } = query;
        const { allStores } = settings;
        const url = '/api/scrape';
        const payload = { model, price, operator, allStores };
        const response = await axios.post(url, payload);
        const queryResults = response.data.arr;
        if (queryResults.length <= 0) {
            const newQuery = query;
            
            newQuery.results = [];
            return newQuery
        }

        const newQuery = query;
        newQuery.results = queryResults;
        return newQuery;
    }

    handleSlide = i => {
        // setLastIndex(index);
        console.log(i)
        // setIndex(Number(i));
        this.setState({ lastIndex: this.state.index, index: Number(i) });
    }

    determineDirection(index, lastIndex, dataIndex) {
        let direction;
        if (index === dataIndex) {  
            if (index === lastIndex)
                direction = "primary activeSlide";
            else if (index > lastIndex)
                direction = "forwardsIn activeSlide";
            else
                direction = "backIn activeSlide";
        } else {
            if (dataIndex === lastIndex) {
                if (index > lastIndex)
                    direction = "forwardsOut";
                else if (index < lastIndex)
                    direction = "backOut";
            }
        }
        return direction; 
    }

    steps = [
        { key: "query", icon: "search", title: "Query Info", description: "Query Info", active: this.state.index === 0 },
        { key: "vehicle", icon: "car", title: "Vehicle Info", description: "Desired Vehicle Info", active: this.state.index === 1 },
        { key: "customer", icon: "user", title: "Customer Info", description: "Customer's contact info", active: this.state.index === 2 }
    ]    

    getProgressWidth() {
        const { index } = this.state;
        if (index === 0) return "33.33%";
        if (index === 1) return "66.66%";
        if (index === 2) return "100%";
    }

    handleQuerySubmit(queryName) {
        let err = "";
        if (!queryName) err = "Query name is required";
        else if (queryName.length > 20) err = "Query name must be less than 21 characters"; 
        this.setState(prevState =>({
            validation: {
                ...prevState.validation,
                queryName: err
            }
        }));
        if (!err)
            this.handleSlide(1);
    }
    handleVehicleSubmit(model, price) {
        let modelErr = "", priceErr = "";
        if (!model) modelErr = "Model is required";
        if (!price) priceErr = "Price is required";
        this.setState(prevState => ({
            validation: {
                ...prevState.validation,
                model: modelErr,
                price: priceErr
            }
        }));
        if (!modelErr && !priceErr) 
            this.handleSlide(2);
    }
    handleCustomerSubmit(name, phone, notes) {
        let nameErr = "", phoneErr = "", notesErr = "";
        if (name.length > 15) nameErr = "Name must be less than 16 characters";
        if (phone.length > 14) phoneErr = "Phone number must be less than 15 characters";
        if (notes.length > 30) notesErr = "Notes must be less than 31 characters";
        this.setState(prevState => ({
            validation: {
                ...prevState.validation,
                customerName: nameErr,
                customerPhone: phoneErr,
                customerNotes: notesErr
            }
        }));
        if (!nameErr && !phoneErr && !notesErr)
            this.handleSubmit();
    }

    handleDisplayhelp = e => {
        const sectionName = e.target.getAttribute("data-section");
        this.state.helpMessage === sectionName
            ? this.setState({ helpMessage: "" })
            : this.setState({ helpMessage: sectionName });
    }

    displayHelpMessage = () => {
        const { helpMessage } = this.state;
        let headerMsg = "";
        let tips = [];
        switch (helpMessage) {
            case "query":
                return (
                    <div className="help__message">
                        <h3>Query Info</h3>
                        <ol>
                            <li>The query name is used to identify your query</li>
                            <li>Disabling the automatic email updates will prevent the Trackr Appr from sending you daily query results via email</li>
                            <li>If automatic email updates are kept enabled, you can decide whether the app will send only unseen query results, or 
                                everything the search finds every time.
                            </li>
                        </ol>
                    </div>
                )
        }
    }

    render() {

        const { modal, enabled, query, vehicle, customer, loading, error, currentUser, index, lastIndex, validation, helpMessage } = this.state;
        return (
            <div>
                <Modal dimmer="blurring" open={modal} onClose={this.closeModal} className='mx-auto' id="create__modal">
                    <Modal.Header id="create__header">
                        <div onClick={() => this.setState({ lastIndex: index, index: 0 })} className={index === 0 ? "active__step" : ""}>1. Query</div>
                        <div onClick={() => this.setState({ lastIndex: index, index: 1 })} className={index === 1 ? "active__step" : ""}>2. Vehicle</div>
                        <div onClick={() => this.setState({ lastIndex: index, index: 2 })} className={index === 2 ? "active__step" : ""}>3. Customer</div>
                        <p className="create__progress" style={{width: this.getProgressWidth()}}></p>
                    </Modal.Header>
                    <Modal.Content>
                        <Form autoComplete="off" loading={loading}>
                            <div className="step__container">
                                <div className={this.determineDirection(index, lastIndex, 0)}>
                                    <section>   
                                        <Icon className="section__help" name="question circle outline" size="big" data-section="query" onClick={this.handleDisplayhelp} />
                                        <div className="form__section">
                                            <Form.Field
                                                control={Input}
                                                name="queryName"
                                                label="Query Name"
                                                placeholder="e.g. Corolla for the Smiths"
                                                onChange={this.handleQueryChange}
                                                type="text"
                                                value={query.queryName}
                                                id="form__field"
                                            />
                                            <p className={validation.queryName ? "not__valid" : "valid"}>{validation.queryName || "valid"}</p>
                                            <div className="checkbox__container">
                                                <div
                                                    className={query.settings.autoEmails ? "checkbox__active" : ""}
                                                >
                                                    <Icon name="exchange" onClick={() => this.handleQuerySettingsChange("autoEmails", query.settings.autoEmails)} />
                                                    <span>Automatic Email Updates</span>
                                                </div>
                                                <div
                                                    className={query.settings.autoEmails ? (query.settings.onlyNew ? "checkbox__active" : "") : "checkbox__disabled"}
                                                >
                                                    <Icon name="eye" onClick={() => this.handleQuerySettingsChange("onlyNew", query.settings.onlyNew)}/>
                                                    <span>Send Only New Results</span>
                                                </div>
                                                <div
                                                    className={query.settings.allStores ? "checkbox__active" : ""}
                                                >
                                                    <Icon name="eye" onClick={() => this.handleQuerySettingsChange("allStores", query.settings.allStores)}/>
                                                    <span>Search all stores</span>
                                                </div>
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
                                    <section className={`field__info ${helpMessage === "query" ? "active" : ""}`}>
                                        <div className="help__message">
                                            <h3>Query Info</h3>
                                            <ol>
                                                <li>The query name is used to identify your query</li>
                                                <li>Disabling the automatic email updates will prevent the Trackr Appr from sending you daily query results via email</li>
                                                <li>If automatic email updates are kept enabled, you can decide whether the app will send only unseen query results, or 
                                                    everything the search finds every time.
                                                </li>
                                                <li>You can choose to search every Lia Toyota Dealer, or just Toyota of Colonie. Default is just Toyota of Colonie.</li>
                                            </ol>
                                        </div>
                                    </section>
                                </div>
                                <div className={this.determineDirection(index, lastIndex, 1)}>
                                    <section>
                                        <Icon className="section__help" name="question circle outline" size="big" data-section="vehicle" onClick={this.handleDisplayhelp} />
                                        <div className="form__section">
                                            <label className="dropdown__label" for="dropdown__field">Model</label>
                                            <Dropdown
                                                onChange={this.handleModelChange}
                                                name="model"
                                                label="Model"
                                                labeled
                                                placeholder="Model"
                                                options={modelOptions}
                                                value={vehicle.model}
                                                selection
                                                id="dropdown__field"
                                            />
                                            {/* <Form.Field
                                                control={Select}
                                                name='model'
                                                label="Model"
                                                placeholder="Model"
                                                options={modelOptions}
                                                value={vehicle.model}
                                                onChange={this.handleModelChange}
                                            /> */}
                                            <p className={validation.model ? "not__valid" : "valid"}>{validation.model || "valid"}</p>
                                            <Form.Field
                                                control={Input}
                                                label='Price'
                                                name='price'
                                                placeholder="Price"
                                                value={vehicle.price}
                                                type='number'
                                                onChange={this.handleVehicleChange}
                                            />
                                            <p className={validation.price ? "not__valid" : "valid"}>{validation.price || "valid"}</p>
                                            <div className="checkbox__container">
                                                <div
                                                    className={vehicle.settings.operator === "less" ? "checkbox__active" : ""}
                                                    onClick={() => this.handleVehicleSettingsChange("operator", "less")}
                                                >
                                                    <Icon name="zoom-out" />
                                                    <span>Lesser Than</span>
                                                </div>
                                                <div
                                                    className={vehicle.settings.operator === "greater" ? "checkbox__active" : ""} 
                                                    onClick={() => this.handleVehicleSettingsChange("operator", "greater")}
                                                >
                                                    <Icon name="zoom-in" />
                                                    <span>Greater Than</span>
                                                </div>
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
                                                onClick={() => this.handleVehicleSubmit(vehicle.model, vehicle.price)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </section>
                                    <section className={`field__info ${helpMessage === "vehicle" ? "active" : ""}`}>
                                        <div className="help__message">
                                            <h3>Vehicle Info</h3>
                                            <ol>
                                                <li>Select a model to search for daily</li>
                                                <li>Input a price and select an operator to either search below or above the chosen price</li>
                                            </ol>
                                        </div>
                                    </section>
                                </div>
                                <div className={this.determineDirection(index, lastIndex, 2)}>
                                    <section>
                                        <Icon className="section__help" name="question circle outline" size="big" data-section="customer" onClick={this.handleDisplayhelp} />
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
                                            <p className={validation.customerName ? "not__valid" : "valid"}>{validation.customerName || "valid"}</p>
                                            <Form.Field
                                                control={Input}
                                                name="customerPhone"
                                                label="Phone (optional)"
                                                placeholder="e.g. 518 555-5555"
                                                onChange={this.handleCustomerChange}
                                                type="tel"
                                                value={customer.customerPhone}
                                            />
                                            <p className={validation.customerPhone ? "not__valid" : "valid"}>{validation.customerPhone || "valid"}</p>
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
                                            <p className={validation.customerNotes ? "not__valid" : "valid"}>{validation.customerNotes || "valid"}</p>
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
                                                onClick={() => this.handleCustomerSubmit(customer.customerName, customer.customerPhone, customer.customerNotes)}
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    </section>
                                    <section className={`field__info ${helpMessage === "customer" ? "active" : ""}`}>
                                        <div className="help__message">
                                            <h3>Customer Info</h3>
                                            <ol>
                                                <li>This section is simply for keeping track of the customer the query is designed for</li>
                                            </ol>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </Form>
                    </Modal.Content>
                    {/* <Modal.Header>
                        Create a New Query
                        <Button icon floated='right' onClick={this.closeModal}><Icon name='close' /></Button>
                    </Modal.Header>
                    <Modal.Content>
                        <Form error={Boolean(error)} onSubmit={this.handleSubmit} className="create__form">
                                <Message
                                    error
                                    attached="bottom"
                                    header="Oops!"
                                    content={error}
                                />
                            <Header as="h3">Query Specs</Header>
                                <Form.Field
                                    control={Input}
                                    name="queryName"
                                    label="Query Name"
                                    placeholder="Query Name"
                                    onChange={this.handleNameChange}
                                    type="text"
                                    value={queryName}
                                />
                                <Form.Field
                                    control={Select}
                                    name='model'
                                    label="Model"
                                    placeholder="Model"
                                    options={modelOptions}
                                    value={model}
                                    onChange={this.handleModelChange}
                                    required
                                />
                                <Form.Field
                                    control={Input}
                                    label='Price'
                                    name='price'
                                    placeholder="Price"
                                    value={price}
                                    type='number'
                                    step={100}
                                    max={50000}
                                    min={5000}
                                    onChange={this.handlePriceChange}
                                    required
                                />
                                <Form.Group>
                                <Form.Field
                                    control={Checkbox}
                                    label='greater than'
                                    value='greater'
                                    checked={operator === 'greater'}
                                    className='mt-4 pt-2'
                                    onChange={this.handleOperatorChange}
                                />
                                <Form.Field
                                    control={Checkbox}
                                    label='less than'
                                    value='less'
                                    checked={operator === 'less'}
                                    onChange={this.handleOperatorChange}
                                />
                                </Form.Group>
                                <Header as="h3">Customer Specs (optional)</Header>
                                <Form.Field
                                    control={Checkbox}
                                    label="Enable"
                                    onChange={this.handleEnable}
                                />
                                <Form.Field
                                    control={Input}
                                    name="customerName"
                                    label="Name (max 15 char)"
                                    placeholder="Name"
                                    onChange={this.handleCustomerChange}
                                    type="text"
                                    value={customerName}
                                    disabled={!enabled}
                                />
                                <Form.Field
                                    control={Input}
                                    name="customerPhone"
                                    label="Phone (max 14 char)"
                                    placeholder="Phone"
                                    onChange={this.handleCustomerChange}
                                    type="tel"
                                    value={customerPhone}
                                    disabled={!enabled}
                                />
                                <Form.Field
                                    control={Input}
                                    name="customerNotes"
                                    label="Notes (max 30 char)"
                                    placeholder="Notes"
                                    onChange={this.handleCustomerChange}
                                    type="text"
                                    value={customerNotes}
                                    disabled={!enabled}
                                    id="notes__field"
                                />
                                <Button
                                    loading={loading}
                                    fluid
                                    type="submit"
                                    className="button__3d"
                                    id="submit__button"
                                >
                                    Submit
                                </Button>
                                
                        </Form>
                    </Modal.Content> */}
                </Modal>
                <Button
                    id="sidePanel__button"
                    className="button__3d"
                    content="Create Query"
                    onClick={this.openModal}
                    disabled={this.state.numberOfQueries >= 5}
                />
                {this.state.numberOfQueries >= 5 &&
                    ( <span className="max__queries__span">Maximum number of queries reached</span> )
                }
            </div>
        )
    }
}


export default Create;