import React from 'react';

import UserPanel from './UserPanel';

class SidePanel extends React.Component {

    render() {

        const { currentUser } = this.props;

        return (
            <div className='bg-dark h-100'>
                <UserPanel currentUser={currentUser} />
            </div>
        )
    }
}

export default SidePanel;