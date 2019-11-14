import React from 'react';

import Settings from './Settings';

import { Segment, Accordion, Icon, Step, Card } from 'semantic-ui-react';


class MetaPanel extends React.Component {

    state = {
        activeIndex: 2
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
            creationDate,
        } = query;
        return (
            <React.Fragment>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Query Name" className="left__step" /><Step content={name} className="right__step"/>
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Model" className="left__step" /><Step content={model} className="right__step" />
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Operator" className="left__step" /><Step content={operator + " than"} className="right__step" />
                </Step.Group>
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Price" className="left__step" /><Step content={"$" + price} className="right__step" />
                </Step.Group>
                {results &&
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Results" className="left__step" /><Step content={results.arr.length} className="right__step" />
                </Step.Group>}
                <Step.Group widths={2} fluid unstackable size='mini'>
                    <Step size="mini" content="Created" className="left__step" /><Step content={creationDate} className="right__step" />
                </Step.Group>
            </React.Fragment>
        )
    }

    displayCustomerDetails = query => {
        const { customer } = query;
        const { customerName, customerPhone, customerNotes } = customer;
        return (
            <Card raised>
                <Card.Content>
                    <Card.Header style={{display: "inline-block"}}>{customerName}</Card.Header>
                    <Icon name='user circle' size='large' style={{float: "right"}} />
                    <Card.Meta>{customerPhone}</Card.Meta>
                    <Card.Description>{customerNotes}</Card.Description>
                </Card.Content>
            </Card>
        )
    }
    
    render() {

        const { activeIndex } = this.state;
        const { currentQuery, currentUser, isLoading } = this.props;
        if (!isLoading && !currentQuery) {
            return (
                <Segment raised className='top__segment'>
                    <p>Please create a query</p>
                </Segment>
            )
        } else {
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
                            {currentQuery && this.displayCustomerDetails(currentQuery)}
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
                            <Settings currentQuery={currentQuery} currentUser={currentUser} isLoading={isLoading} />
                        </Accordion.Content>
                    </Accordion>
                </Segment>
            )
        }
    }
}

// const mapStateToProps = state => ({
//     currentUser: state.user.currentUser,
//     currentQuery: state.query.currentQuery
// })

export default MetaPanel;