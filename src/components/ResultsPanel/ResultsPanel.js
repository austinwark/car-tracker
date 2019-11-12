import React from 'react';

import ResultsList from './ResultsList';
import Create from './Create';

class ResultsPanel extends React.Component {

    render() {

        const { currentUser } = this.props;

        return (
            <div className='h-100'>
                <div className="results__header">
                    <h1 className='text-primary text-center mt-3'>Query Results</h1>
                </div>
                <ResultsList />
                <Create currentUser={currentUser} />
            </div>
        )
    }
}

export default ResultsPanel;