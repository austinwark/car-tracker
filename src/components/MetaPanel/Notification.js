import React, { createRef } from 'react';
import { Popup, Icon } from 'semantic-ui-react';
import { setCurrentNotification } from '../../actions';
import { connect } from 'react-redux';


class Notification extends React.Component {
    state = {
        open: true,
        timeoutId: ""
    }
    contextRef = createRef();

    componentDidMount() {
        console.log('notification mounted!')
        const timeoutId = setTimeout(() => {
            this.clearNotification();
        }, 20000)
        this.setState({ timeoutId });
    }

    clearNotification = () => {
        clearTimeout(this.state.timeoutId);
        this.setState({ open: false, timeoutId: "" });
        this.props.setCurrentNotification(null);
    }

    render() {
        const { currentNotification } = this.props;
        console.log("FROM NOTIFICATION: ", currentNotification);
        return (
            <React.Fragment>
                <div ref={this.contextRef} className='notification__message'></div>
                <Popup
                   context={this.contextRef}
                   position='top center'
                   basic
                   open={this.state.open} 
                   closeOnEscape
                   
                >{currentNotification} <Icon name="close" id="notification__close" onClick={() => this.clearNotification()} /></Popup>
            </React.Fragment>
        )
    }
}


export default connect(null, { setCurrentNotification })(Notification);