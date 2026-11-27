import React from 'react';
import './index.css'
import Dropdown from '../Dropdown';

function Field({ref, label, width, value, property, sendValue, options, 
    onKeyDown, validationResult, placeholder, onBeforeSelect, edit = true,
    isTextArea = false, height = 80, maxHeight}) {
    
    const inputRef = React.useRef(null);
    const fieldRef = React.useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [textValue, setTextValue] = React.useState(value ?? '');
    const [dropdownValue, setDropdownValue] = React.useState(value);

    React.useEffect(() => {
        if (options)
            setTextValue(options.find(opt => opt.value === value)?.name ?? '');
    }, []);

    React.useEffect(() => {
        if (options) {
            setTextValue(options.find(opt => opt.value === value)?.name ?? '');
            setDropdownValue(value);
        } else {
            setTextValue(value);
        }
    }, [value]);

    React.useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus()
    }));

    const onChange = (event) => {
        setTextValue(event.target.value);
        if (!options)
            sendValue(property, event.target.value);
    };

    const openDropdown = () => {
        setIsDropdownOpen(true);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    const onSelect = (dValue) => {
        if (onBeforeSelect) {
            closeDropdown();
            onBeforeSelect(property, dValue);
            return;
        }
        
        setTextValue(options.find(opt => opt.value === dValue)?.name ?? '');
        setDropdownValue(dValue);
        sendValue(property, dValue);
        closeDropdown();
    };

    const onButtonClick = () => {
        if (!isDropdownOpen)
            openDropdown();
        else
            closeDropdown();
    };

    const onBlur = () => {
        if (options)
            setTextValue(dropdownValue !== null ? options.find(opt => opt.value === dropdownValue)?.name ?? '' : '');
    };

    return (
        <div className="field" ref={fieldRef} style={{width: width}}>
            {label &&
                <div className="field-label">{label}:</div>}
            <div className={'field-input' + (validationResult && !validationResult.isValid ? ' invalid' : '')}>
                {edit ?
                    isTextArea ? 
                        <textarea ref={inputRef} className="input" value={textValue} onChange={onChange} placeholder={placeholder}
                            onKeyDown={onKeyDown} style={{height: height}} /> : 
                        <input ref={inputRef} className="input" type="text" value={textValue} onChange={onChange} onFocus={options ? openDropdown : null}
                            onBlur={onBlur} onKeyDown={onKeyDown} placeholder={placeholder} /> :
                    <div className="value-text" style={{maxHeight: maxHeight}}>{textValue}</div>}
                {options &&
                    <div className={'dropdown-button icon ' + (isDropdownOpen ? 'icon-dropdown-up' : 'icon-dropdown-down')}
                        onClick={onButtonClick} onMouseDown={(e) => e.preventDefault()} />}
                {validationResult && !validationResult.isValid && 
                    <span className="validation-error">{validationResult.error}</span>}
            </div>
            {isDropdownOpen &&
                <Dropdown refElement={inputRef.current} ignoreRef={fieldRef} options={options} closeDropdown={closeDropdown} 
                    onSelect={onSelect} />}
        </div>
    );
}

export default Field