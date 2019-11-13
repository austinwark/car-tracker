import React from 'react';

import { Segment, Accordion, Grid, Icon, List, Menu, Divider, Step } from 'semantic-ui-react';

import firebase from '../../firebase';
import { connect } from 'react-redux';

class MetaPanel extends React.Component {

    state = {
        currentUser: this.props.currentUser,
        activeIndex: 0
    }
    
    // function to control accordian
    setActiveIndex = (event, titleProps) => {       // titleProps gives us access to the components props
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex })
    }

    displayQueryDetails = query => {
        const {
            name,
            model,
            operator,
            price,
            results,
            customer,
            creationDate,
            enabled
        } = query;
        return (
            <Segment size='small' >
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Query Name" /><Step content={name} />
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Model" /><Step content={model} />
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Operator" /><Step content={operator + " than"} />
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Price" /><Step content={"$" + price} />
                </Step.Group>
                {results.arr.length > 0 &&
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Results" /><Step content={results.arr.length} />
                </Step.Group>}
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Created" /><Step content={creationDate} />
                </Step.Group>
            </Segment>
        )
    }
    
    render() {

        const { currentUser, activeIndex } = this.state;
        const { currentQuery } = this.props;
        console.log(currentQuery)
        return (
            <Segment raised className="top__segment">
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown' />
                        <Icon name='dna' />
                        Query Details
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 0}
                    >
                        {currentQuery && this.displayQueryDetails(currentQuery)}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown' />
                        <Icon name='user' />
                        Customer Details
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 1}
                    >
                        details
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown' />
                        <Icon name='cogs' />
                        Settings
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 2}
                    >
                        details
                    </Accordion.Content>
                </Accordion>
            </Segment>
        )
    }
}

// const mapStateToProps = state => ({
//     currentUser: state.user.currentUser,
//     currentQuery: state.query.currentQuery
// })

export default MetaPanel;