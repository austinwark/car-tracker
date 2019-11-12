import axios from 'axios';
import React from 'react';

import firebase from '../../firebase';

import { Form, Grid, Icon, Message, Checkbox, Input, Select, TextArea, Button, Modal, Header } from 'semantic-ui-react';


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

const INITIAL_CUSTOMER = {
    customerName: '',
    customerPhone: '',
    customerNotes: ''
}

class Create extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        queriesRef: firebase.database().ref('queries'),
        queryName: '',
        model: '',
        operator: '',
        price: 0,
        customer: INITIAL_CUSTOMER,
        enabled: false,
        disabled: true,
        error: [],
        success: true,
        modal: false
    }

    async handleClick() {
        //const result = await axios.get('/api/scrape');
        //console.log(result)
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

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
        this.setState({ enabled: !enabled })
    }

    handleCustomerChange = event => {
        const { customer } = this.state;
        customer[event.target.name] = event.target.value;
        this.setState({ customer });
    }

    handleSubmit = event => {
        event.preventDefault();
        const { customer, enabled, queryName, model, price, operator, currentUser, queriesRef } = this.state;
        const key = queriesRef.child(currentUser.uid).push().key;
        const newQuery = {
            id: key,
            name: queryName,
            model: model,
            price: price,
            operator: operator,
            customer: customer
        };
        queriesRef
            .child(currentUser.uid)
            .child(key)
            .update(newQuery)
            .then(() => {
                console.log('query added')
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })

        // queriesRef
        //     .child(currentUser.uid)
        //     .push()
        //     .update({
        //         queryName,
        //         model,
        //         price,
        //         operator,
        //         customer
        //     }).then(() => {
        //         console.log('query added')
        //         this.closeModal();
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     })

    }

    render() {

        const { modal, queryName, model, operator, price, enabled, customer } = this.state;

        return (
            <div>
                <Modal open={modal} onClose={this.closeModal} className='mx-auto'>
                    <Modal.Header>Create a New Query</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
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
                                    value={customer.customerName}
                                    disabled={!enabled}
                                />
                                <Form.Field
                                    control={Input}
                                    name="customerPhone"
                                    label="Phone (max 14 char)"
                                    placeholder="Phone"
                                    onChange={this.handleCustomerChange}
                                    type="text"
                                    value={customer.customerPhone}
                                    disabled={!enabled}
                                />
                                <Form.Field
                                    control={Input}
                                    name="customerNotes"
                                    label="Notes (max 30 char)"
                                    placeholder="Notes"
                                    onChange={this.handleCustomerChange}
                                    type="text"
                                    value={customer.customerNotes}
                                    disabled={!enabled}
                                />
                                <Button fluid color="violet" type="submit">Submit</Button>
                        </Form>
                    </Modal.Content>
                </Modal>
                <Button
                    color="orange"
                    content="Create Query"
                    onClick={this.openModal}
                />
            </div>
        )
    }
}


export default Create;