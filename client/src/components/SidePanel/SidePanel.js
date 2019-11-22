import React from 'react';

import UserPanel from './UserPanel';
import CurrentQueries from './CurrentQueries';
import Create from './Create';

import { Segment, Divider } from 'semantic-ui-react';

class SidePanel extends React.Component {

    render() {

        const { currentUser, currentQuery } = this.props;
        return (
            <Segment style={{height: "100vh"}} id="main__sidepanel__colors">
                <UserPanel currentUser={currentUser} />
                <Divider />
                <CurrentQueries currentQuery={currentQuery} currentUser={currentUser} />
                <Create currentUser={currentUser} />
            </Segment>
        )
    }
}

export default SidePanel;