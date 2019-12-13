import axios from 'axios';
import React from 'react';
import moment from 'moment';

// import firebase from '../../firebase';

import { Form, Icon, Checkbox, Input, Select, Button, Modal, Header, Message, Step } from 'semantic-ui-react';

const firebase = require('../../firebase');
const uuidv4 = require('uuid/v4');

const modelOptions = [
    { text: "Avalon", value: "avalon"},
    { text: "Camry", value: "camry" },
    { text: "Corolla", value: "corolla" },
    { text: "Prius", value: "prius" },
    { text: "Sienna", value: "sienna" },
    { text: "4runner", value: "4runner" },
    { text: "Highlander", value: "highlander" },
    { text: "Rav4", value: "rav4" },
    { text: "Tacoma", value: "tacoma" },
    { text: "Tundra", value: "tundra" }
]
/* for validating model input */
const modelOptionsArray = ["avalon", "camry", "corolla", "prius", "sienna", "4runner", "highlander", "rav4", "tacoma", "tundra"];

const INITIAL_QUERY = {
    queryName: "",
    settings: {
        autoEmails: true,
        onlyNew: true
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

class Create extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref(`queries`),
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
        lastIndex: 0
    }
    
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

    handleEnable = () => {
        const { enabled } = this.state;
        // this.setState({ enabled: !enabled })
        enabled 
            ? this.setState({ customerName: "", customerPhone: "", customerNotes: "", enabled: false })
            : this.setState({ enabled: true });
    }

    handleQueryChange = event => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            query: {
                ...prevState.query,
                [name]: value
            }
        }))
    }
    handleQuerySettingsChange = (name, value) => {
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
        this.setState(prevState => ({
            customer: {
                ...prevState.customer,
                [name]: value
            }
        }))
    }

    queryNotValid = (name, model, price, operator) => {
        if (name.length > 20 || name.length <= 0) {
            return { error: "Name must be greater than 0 and less than or equal to 20"}
        } else if (price < 5000 || price > 50000) {
            return { error: "Price must be between $5,000 and $50,000, inclusive"}
        } else if (!modelOptionsArray.includes(model.toLowerCase())) {
            return { error: "Model must be a chosen from list"}
        } else if (operator !== "less" && operator !== "greater") {
            return { error: "Must pick an operator"}
        } else {
            return false;
        }
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
        event.preventDefault();
        this.setState({ loading: true });
        const { query, vehicle, customer, currentUser, queriesRef } = this.state;
        const { queryName } = query, {autoEmails, onlyNew } = query.settings;
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
        const { model, price, operator } = query;

        const url = '/api/scrape';
        const payload = { model, price, operator };
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
                direction = "primary";
            else if (index > lastIndex)
                direction = "forwardsIn";
            else
                direction = "backIn";
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
    render() {

        const { modal, enabled, query, vehicle, customer, loading, error, currentUser, index, lastIndex } = this.state;
        return (
            <div>
                <Modal dimmer="blurring" open={modal} onClose={this.closeModal} className='mx-auto'>
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
                                            <div className="checkbox__container">
                                                <div
                                                    className={query.settings.autoEmails && "checkbox__active"}
                                                    onClick={() => this.handleQuerySettingsChange("autoEmails", query.settings.autoEmails)}
                                                >
                                                    <Icon name="exchange" />
                                                    <span>Automatic Email Updates</span>
                                                </div>
                                                <div
                                                    className={query.settings.onlyNew && "checkbox__active"} 
                                                    onClick={() => this.handleQuerySettingsChange("onlyNew", query.settings.onlyNew)}
                                                >
                                                    <Icon name="eye" />
                                                    <span>Send Only New Results</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="nav__section">
                                            <Button
                                                type="button"
                                                fluid
                                                className="next__button"
                                                onClick={() => this.handleSlide(index + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>  
                                    </section>
                                    <section className="form__validation">
                                        <span className={query.queryName.length < 1 ? "not__valid" : "is__valid"}>
                                            Query name is filled{" "}
                                            <Icon name={query.queryName.length < 1 ? "warning sign" : "check"} size="small" />
                                        </span>
                                        <span className={query.queryName.length > 20 ? "not__valid" : "is__valid"}>
                                            Query name is less than 21 characters{" "} 
                                            <Icon name={query.queryName.length > 20 ? "warning sign" : "check"} size="small" />
                                        </span>
                                    </section>
                                </div>
                                <div className={this.determineDirection(index, lastIndex, 1)}>
                                    <section>
                                        <div className="form__section">
                                            <Form.Field
                                                control={Select}
                                                name='model'
                                                label="Model"
                                                placeholder="Model"
                                                options={modelOptions}
                                                value={vehicle.model}
                                                onChange={this.handleModelChange}
                                                required
                                            />
                                            <Form.Field
                                                control={Input}
                                                label='Price'
                                                name='price'
                                                placeholder="Price"
                                                value={vehicle.price}
                                                type='number'
                                                step={100}
                                                max={50000}
                                                min={5000}
                                                onChange={this.handleVehicleChange}
                                                required
                                            />
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
                                                className="next__button"
                                                onClick={() => this.handleSlide(index - 1)}
                                            >
                                                <Icon name="arrow left" />
                                            </Button>
                                            <Button
                                                type="button"
                                                fluid
                                                className="next__button"
                                                onClick={() => this.handleSlide(index + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </section>
                                    <section className="form__validation">
                                        <span className={!vehicle.model ? "not__valid" : "is__valid"}>
                                            Model is selected{" "}
                                            <Icon name={!vehicle.model ? "warning sign" : "check"} size="small" />
                                        </span>
                                        <span className={!vehicle.price ? "not__valid" : "is__valid"}>
                                            Price is filled{" "} 
                                            <Icon name={!vehicle.price ? "warning sign" : "check"} size="small" />
                                        </span>
                                        <span className={vehicle.price < 5000 || vehicle.price > 50000 ? "not__valid" : "is__valid"}>
                                            Price is between $5,000 and $50,000 - inclusive{" "} 
                                            <Icon name={vehicle.price < 5000 || vehicle.price > 50000 ? "warning sign" : "check"} size="small" />
                                        </span>
                                    </section>
                                </div>
                                <div className={this.determineDirection(index, lastIndex, 2)}>
                                    <section>
                                        <div className="form__section">
                                            <Form.Field
                                                control={Input}
                                                name="customerName"
                                                label="Name (max 15 char)"
                                                placeholder="e.g. John Smith"
                                                onChange={this.handleCustomerChange}
                                                type="text"
                                                value={customer.customerName}
                                                // disabled={!enabled}
                                            />
                                            <Form.Field
                                                control={Input}
                                                name="customerPhone"
                                                label="Phone (max 14 char)"
                                                placeholder="e.g. 518 555-5555"
                                                onChange={this.handleCustomerChange}
                                                type="tel"
                                                value={customer.customerPhone}
                                                // disabled={!enabled}
                                            />
                                            <Form.Field
                                                control={Input}
                                                name="customerNotes"
                                                label="Notes (max 30 char)"
                                                placeholder="e.g. Needs by end of month"
                                                onChange={this.handleCustomerChange}
                                                type="text"
                                                value={customer.customerNotes}
                                                // disabled={!enabled}
                                                id="notes__field"
                                            />
                                        </div>
                                        <div className="nav__section">
                                            <Button
                                                type="button"
                                                icon
                                                className="next__button"
                                                onClick={() => this.handleSlide(index - 1)}
                                            >
                                                <Icon name="arrow left" />
                                            </Button>
                                            <Button
                                                type="submit"
                                                fluid
                                                className="next__button"
                                                onClick={this.handleSubmit}
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    </section>
                                    <section className="form__validation">
                                        <span className={customer.customerName.length > 15 ? "not__valid" : "is__valid"}>
                                            Customer name is less than 16 characters{" "}
                                            <Icon name={customer.customerName.length > 15 ? "warning sign" : "check"} size="small" />
                                        </span>
                                        <span className={customer.customerPhone.length > 14 ? "not__valid" : "is__valid"}>
                                            Customer Phone # is less than 15 characters{" "} 
                                            <Icon name={customer.customerPhone.length > 14 ? "warning sign" : "check"} size="small" />
                                        </span>
                                        <span className={customer.customerNotes.length > 30 ? "not__valid" : "is__valid"}>
                                            Customer notes is less than 31 characters{" "} 
                                            <Icon name={customer.customerNotes.length > 30 ? "warning sign" : "check"} size="small" />
                                        </span>
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
                />
            </div>
        )
    }
}


export default Create;