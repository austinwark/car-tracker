import axios from 'axios';
import React from 'react';
import moment from 'moment';

// import firebase from '../../firebase';

import { Form, Icon, Checkbox, Input, Select, Button, Modal, Header, Message } from 'semantic-ui-react';

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

const INITIAL_CUSTOMER = {
    customerName: '',
    customerPhone: '',
    customerNotes: ''
}

class Create extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref(`queries`),
        queryName: '',
        model: '',
        operator: '',
        price: 0,
        customerName: '',
        customerPhone: '',
        customerNotes: '',
        enabled: false,
        disabled: true,
        loading: false,
        error: null,
        success: true,
        modal: false
    }
    
    resetFields = () => {
        this.setState({
            queryName: "",
            model: "",
            operator: "",
            price: 0,
            enabled: false,
            customerName: '',
            customerPhone: '',
            customerNotes: '',
            modal: false
        });
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.resetFields();

    handleNameChange = event => {
        this.setState({ queryName: event.target.value });
    }

    handleModelChange = (event, { value }) => {
        this.setState({ model: value });
    }

    handlePriceChange = event => {
        this.setState({ price: event.target.value });
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

    handleCustomerChange = event => {
        // const { customer } = this.state;
        // customer[event.target.name] = event.target.value;
        this.setState({ [event.target.name]: event.target.value });
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



    /* Previous handling of new query */
    handleSubmit = async event => {
        event.preventDefault();
        this.setState({ loading: true });
        const { customerName, customerPhone, customerNotes, queryName, model, price, operator, currentUser, queriesRef } = this.state;
        const customer = { customerName, customerPhone, customerNotes };
        const isNotValid = this.queryNotValid(queryName, model, price, operator );

        if (isNotValid) {
            this.setState({ error: isNotValid.error, loading: false });
        } else {
            const creationDate = moment().format("L");
            const key = queriesRef.child(currentUser.uid).push().key;
            let newQuery = {
                id: key,
                name: queryName,
                model: model,
                price: price,
                operator: operator,
                customer: customer,
                creationDate: creationDate,
                isOwnerAnonymous: currentUser.isAnonymous
            };
            newQuery = await this.getQueryResults(newQuery);
            queriesRef
                .child(currentUser.uid)
                .child(key)
                .update(newQuery)
                .then(() => {
                    console.log('query added')
                    this.closeModal();
                    this.resetFields();
                    this.setState({ loading: false, error: null });
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

    


    render() {

        const { modal, queryName, model, operator, price, enabled, customerName, customerPhone, customerNotes, loading, error, currentUser } = this.state;

        return (
            <div>
                <Modal dimmer="blurring" open={modal} onClose={this.closeModal} className='mx-auto'>
                    <Modal.Header>
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
                                    type="text"
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
                    </Modal.Content>
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