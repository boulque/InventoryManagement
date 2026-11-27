import React from 'react';
import './index.css';

function Dropdown({refElement, ignoreRef, options, closeDropdown, onSelect}) {
    const width = refElement.getBoundingClientRect().width;
    
    const itemHeight = 37;
    const height = Math.max(options.length, 1) * itemHeight + 2;

    const onTopY = refElement.getBoundingClientRect().top + window.scrollY - height;

    const onTop = window.innerHeight - refElement.getBoundingClientRect().bottom < height;

    const top = onTop ?
        onTopY > 0 ? onTopY : 0 :
        refElement.getBoundingClientRect().bottom + window.scrollY;

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
        <ul className="dropdown-list" style={{top: top, width: width, maxHeight: onTop ? refElement.getBoundingClientRect().top : null}}>
            {options.length > 0 ?
                options.map(opt => <li key={opt.value} className="dropdown-item" onClick={() => onSelect(opt.value)}>
                    {opt.name}
                </li>) :
                <li className="dropdown-item" onClick={() => onSelect(null)} />}
        </ul>
    );
}

export default Dropdown;