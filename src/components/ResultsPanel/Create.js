import axios from 'axios';
import React from 'react';

const cheerio = require('cheerio');

class Create extends React.Component {

    async handleClick() {
        const result = await axios.get('/api/scrape');
        console.log(result)
    }

    render() {

        return (
            <div>
                <button onClick={this.handleClick}>Click</button>
            </div>
        )
    }
}


export default Create;