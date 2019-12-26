import React from 'react';
import { Loader, Dimmer } from 'semantic-ui-react';


const Spinner = ({message}) => (
    <Dimmer active>
        <Loader size="huge" content={message} className="loading__spinner" />
    </Dimmer>
);

export default Spinner;