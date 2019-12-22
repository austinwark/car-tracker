import React from "react";
import { Accordion, Icon, Step, Card } from "semantic-ui-react";
import Settings from "./Settings";

/* Side column containing query info and settings */
class MetaPanel extends React.Component {
  state = {
    activeIndex: 0
  };

  /* Controls accordian state */
  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  /* Uses passed in query data and displays formatted info */
  displayQueryDetails = query => {
    const { name, model, operator, price, results, creationDate } = query;
    return (
      <React.Fragment>
        {/* <h3 className="query__name__header">#{query.name}</h3> */}
        <Step.Group widths={2} fluid unstackable>
          <Step size="mini" content="Query Name" className="left__step" />
          <Step content={name} className="right__step" />
        </Step.Group>
        <Step.Group widths={2} fluid unstackable>
          <Step size="mini" content="Model" className="left__step" />
          <Step
            content={model.charAt(0).toUpperCase() + model.substring(1)}
            className="right__step"
          />
        </Step.Group>
        <Step.Group widths={2} fluid unstackable>
          <Step size="mini" content="Operator" className="left__step" />
          <Step content={operator + " than"} className="right__step" />
        </Step.Group>
        <Step.Group widths={2} fluid unstackable>
          <Step size="mini" content="Price" className="left__step" />
          <Step content={"$" + price} className="right__step" />
        </Step.Group>
        {results && (
          <Step.Group widths={2} fluid unstackable>
            <Step size="mini" content="Results" className="left__step" />
            <Step content={results.length} className="right__step" />
          </Step.Group>
        )}
        <Step.Group widths={2} fluid unstackable>
          <Step size="mini" content="Created" className="left__step" />
          <Step content={creationDate} className="right__step" />
        </Step.Group>
      </React.Fragment>
    );
  };

  /* Uses passed in customer data and displays formatted info */
  displayCustomerDetails = query => {
    const { customer } = query;
    const { customerName, customerPhone, customerNotes } = customer;
    return (
      <Card raised>
        <Card.Content>
          <Card.Header style={{ display: "inline-block" }}>
            {customerName}
          </Card.Header>
          <Icon name="user circle" size="large" style={{ float: "right" }} />
          <Card.Meta>{customerPhone}</Card.Meta>
          <Card.Description>{customerNotes}</Card.Description>
        </Card.Content>
      </Card>
    );
  };

  render() {
    const { activeIndex } = this.state;
    const { currentQuery, currentUser, isLoading } = this.props;

    return (
      <Accordion styled attached="true" id="metapanel__accordian">
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.setActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="dna" />
          Query Details
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          {currentQuery && this.displayQueryDetails(currentQuery)}
        </Accordion.Content>
        <Accordion.Title
          active={activeIndex === 1}
          index={1}
          onClick={this.setActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="user" />
          Customer Details
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 1}>
          {currentQuery && this.displayCustomerDetails(currentQuery)}
        </Accordion.Content>
        <Accordion.Title
          active={activeIndex === 2}
          index={2}
          onClick={this.setActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="cogs" />
          Query Settings
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 2}>
          <Settings
            currentQuery={currentQuery}
            currentUser={currentUser}
            isLoading={isLoading}
          />
        </Accordion.Content>
      </Accordion>
    );
    // }
  }
}

export default MetaPanel;