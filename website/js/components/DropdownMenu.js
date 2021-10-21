'use strict';
import htm from '../libs/htm.module.js'

const html = htm.bind(React.createElement);

class DropdownMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {opened: false};
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown() {
        this.setState(prev => ({opened: !prev.opened}));
    }

    capitalize(item) {
        return item.split('_').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');
    }

    render() {
        return html`
          <div className="dropdown has-text-left ${this.state.opened ? 'is-active' : ''}"
               onClick="${this.toggleDropdown}">
            <div className="dropdown-trigger">
              <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>${this.props.label}</span>
                <span className="icon is-small">
                  <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content" style="${{maxHeight: '13em', overflow: 'auto'}}">
                ${this.props.items.map((item, index) =>
                        html`<a className="dropdown-item ${item === this.props.activeItem ? 'is-active' : ''}"
                                onClick="${() => this.props.onChange(index)}"
                                href="#" key="${index}">${this.capitalize(item)}</a>`)}
              </div>
            </div>
          </div>
        `;
    }
}

export default DropdownMenu;