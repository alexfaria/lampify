import {useState} from 'react';
import AngleDown from './icons/AngleDown';

export default function DropdownMenu({label, items, onChange, activeItem}) {

    const [open, setOpen] = useState(false);

    const toggleDropdown = () => setOpen(!open);

    const capitalize = (item) => item.split('_').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');

    return <>
        <div className={`dropdown has-text-left ${open ? 'is-active' : ''}`}
             onClick={toggleDropdown}>
            <div className="dropdown-trigger">
                <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span>{label}</span>
                    <span className="icon is-small"><AngleDown/></span>
                </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content dropdown-menu-content">
                    {items.map((item, index) =>
                        <a className={`dropdown-item ${item === activeItem ? 'is-active' : ''}`}
                           onClick={() => onChange(index)}
                           href="#" key={index}>{capitalize(item)}</a>)}
                </div>
            </div>
        </div>
    </>;
}