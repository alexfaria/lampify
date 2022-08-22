import React, {useState} from 'react';

import AngleDown from './icons/AngleDown';

export default function DropdownMenu({label, items, onChange, activeItem}) {

    const [open, setOpen] = useState(false);

    const capitalize = (item) => item.split('_').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');

    const toggleDropdown = () => setOpen(prevOpen => !prevOpen);

    const onClickItem = (index) => {
        onChange(index);
        toggleDropdown();
    };

    return <>
        <div className="relative inline-block">
            <div>
                <button type="button"
                        onClick={toggleDropdown}
                        className="inline-flex justify-center w-full rounded-md shadow-sm
                                   border border-gray-300 px-4 py-2
                                   bg-white text-sm font-medium text-gray-700
                                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                                   focus:ring-offset-gray-100 focus:ring-indigo-500">
                    {label}
                    <AngleDown className="-mr-1 ml-2 h-5 w-5"/>
                </button>
            </div>

            <div className={`${open ? '' : 'hidden'}
                           origin-top-left absolute right
                           mt-2 rounded-md shadow-lg
                           bg-white ring-1 ring-black ring-opacity-5
                           focus:outline-none`}>
                <ul className="py-1 max-h-[13rem] flex-col overflow-y-scroll">
                    {items.map((item, index) =>
                        <li className={`${item === activeItem ? 'bg-blue-100' : null} text-gray-700 px-4 py-2 text-sm hover:bg-gray-300 hover:cursor-pointer`}
                            key={'dropdown-item-' + item}
                            onClick={() => onClickItem(index)}>
                            <button className="text-left">
                                {capitalize(item)}
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    </>;
}