import React from 'react';
import './index.css'

function Dropdown({refElement, ignoreRef, options, closeDropdown, onSelect}) {
    const width = refElement.getBoundingClientRect().width;
    const top = refElement.getBoundingClientRect().bottom + window.scrollY;

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!ignoreRef?.current?.contains(e.target))
                closeDropdown();
        };
        
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <ul className="dropdown-list" style={{top: top, width: width}}>
            {options.map(opt => <li key={opt.value} className="dropdown-item" onClick={() => onSelect(opt.value)}>
                {opt.name}
            </li>)}
        </ul>
    );
}

export default Dropdown;