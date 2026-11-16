import './index.css'

function Toolbar({buttons}) {
    return <div className="toolbar">
        {buttons.map(button =>
            <button className={'toolbar-button' + (button.icon ? ` has-icon icon-${button.icon}` : '') + (button.disabled ? ' disabled' : '')}
                onClick={!button.disabled ? button.onClick : null}>{button.name}</button>
        )}
    </div>;
}

export default Toolbar