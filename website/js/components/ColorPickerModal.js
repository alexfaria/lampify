'use strict';
import htm from '../libs/htm.module.js'

const html = htm.bind(React.createElement);

class ColorPickerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            color: this.props.color,
        };
        this.pickerElement = React.createRef();
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState(prev => ({opened: !prev.opened}));
    }

    componentDidMount() {
        const colorPicker = new iro.ColorPicker(this.pickerElement.current, {color: this.state.color});

        colorPicker.on('input:change', (color, changes) => {
            this.setState({color: color.hexString});
        });

        colorPicker.on('input:end', (color, changes) => {
            this.toggleModal();
            this.setState({color: color.hexString});
            this.props.onChange(color);
        });
    }

    render() {
        return html`
          <div key="icon-container-key" className="container has-text-centered" style="${{fontSize: this.props.iconSize}}">
            <span className="icon is-large" style="${{color: this.state.color}}" onClick="${this.toggleModal}">
              <i className="fas fa-lightbulb lamp"></i>
            </span>
          </div>

          <div key="modal-key" className="modal ${this.state.opened ? 'is-active' : ''}">
            <div key="modal-background-key" className="modal-background" onClick="${this.toggleModal}"></div>
            <div className="modal-content">
              <div className="level">
                <div className="level-item">
                  <div ref="${this.pickerElement}" id="picker"></div>
                </div>
              </div>
            </div>
            <button className="modal-close is-large" onClick="${this.toggleModal}" aria-label="close"></button>
          </div>
        `;
    }
}

export default ColorPickerModal;
