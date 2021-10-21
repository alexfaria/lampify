'use strict';
import htm from '../libs/htm.module.js'

const html = htm.bind(React.createElement);

class LampIcon extends React.Component {
    render() {
        return html`
          <div className="column is-2">
            <span className="icon ${this.props.on ? "has-text-warning" : ""}">
              <i className="fas fa-lightbulb"></i>
            </span>
          </div>
        `;
    }
}

export default LampIcon;