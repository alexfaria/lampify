'use strict';
import htm from '../libs/htm.module.js'

const html = htm.bind(React.createElement);

class InputSlider extends React.Component {
    render() {
        return html`
          <div className="field"
               style="${this.props.direction ? {direction: this.props.direction} : {}}">
            <label className="label">${this.props.label}</label>
            <div className="control">
              <input className="slider"
                     onChange="${(e) => this.props.onChange(e.target.value)}"
                     value="${this.props.value}"
                     step="${this.props.step}"
                     min="${this.props.min}"
                     max="${this.props.max}"
                     type="range"/>
            </div>
          </div>`;
    }
}

export default InputSlider;
