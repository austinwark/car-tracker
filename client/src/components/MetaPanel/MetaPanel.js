import React from "react";
import { Accordion, Icon, Step, Card } from "semantic-ui-react";
import Settings from "./Settings";

/* Side column containing query info and settings */
class MetaPanel extends React.Component {
  state = {
    activeIndex: 0,
    currentQuery: this.props.currentQuery
  };

  /* Shallow comparison of query info in updated props versus previous query info - only updates state with new info */
  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.currentQuery) !== JSON.stringify(this.props.currentQuery)) {
      this.setState({ currentQuery: this.props.currentQuery })
    }
  }

  /* Controls accordian state */
  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  /* Uses passed in query details to display formatted list - uses flag indicating screen size to show certain results */
  displayQueryDetails = (query, isMobile = false) => {
    const { name, model, operator, price, minYear, maxYear, results, creationDate, customer } = query;
    return (
      <div className="large__query__details">
        <div>
          <div className="large__details__row">
            <span>Query Name</span>
            <span>{name}</span>
          </div>
          <div className="large__details__row">
            <span>Model</span>
            <span>{model}</span>
          </div>
          <div className="large__details__row">
            <span>Operator</span>
            <span>{operator} than</span>
          </div>
          {!(minYear === 0 && maxYear === 2020) && ( // only shows year field if user chose non-default values
            <div className="large__details__row">
              <span>Year</span>
              <span>{minYear} - {maxYear}</span>
            </div>
          )}
        </div>
        <div>
          <div className="large__details__row">
            <span>Price</span>
            <span>${price}</span>
          </div>
          <div className="large__details__row">
            <span>Results</span>
            <span>{results ? results.length : 0}</span>
          </div>
          <div className="large__details__row">
            <span>Created</span>
            <span>{creationDate}</span>
          </div>
        </div>
        {isMobile && ( // if screen size is under 768px
          <React.Fragment>
            <div>
              {customer.customerName && 
                <div className="large__details__row">
                  <span>Customer Name</span><span>{customer.customerName}</span>
                </div>
              }
            </div>
            <div>
              {customer.customerPhone && 
                <div className="large__details__row">
                  <span>Customer Phone</span><span>{customer.customerPhone}</span>
                </div>
              }
            </div>
            <div>
              {customer.customerNotes && 
                <div className="large__details__row">
                  <span>Customer Notes</span><span>{customer.customerNotes}</span>
                </div>
              }
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }

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
        <React.Fragment>
          <div className="mobile__metapanel">
            <div className="mobile__query__details">
              {currentQuery && this.displayQueryDetails(currentQuery, true)}
            </div>
            <div className="mobile__customer__details">
            </div>
            <div className="mobile__settings">
              <Settings
                  currentQuery={currentQuery}
                  currentUser={currentUser}
                  isLoading={isLoading}
                />
            </div>
          </div>
          <Accordion styled attached="true" id="metapanel__accordian" className="large__metapanel">
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
        </React.Fragment>
      );
  }
}

export default MetaPanel;