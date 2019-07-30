import React, { useState , Component} from 'react';
import ReactDOM from 'react-dom';

console.log('POPUP SCRIPT LOADED??')


export default class Button extends Component {
  state = { buttonText: 'Click me, please' };
  handleClick = () => {
    this.setState(() => {
      return { buttonText: 'Thanks, been clicked!' };
    });
  };
  render() {
    const { buttonText } = this.state;
    return <button onClick={this.handleClick}>{buttonText}</button>;
  }
}

ReactDOM.render(<Button/>, document.querySelector('#root'))
