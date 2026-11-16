import './index.css'

function Popup({onClose, name, buttons, children, width}) {
    return (
        <div className="overlay popup-overlay">
            <div className="popup" style={{width: width}}>
                <div className="popup-header">
                    <span className="popup-title">{name}</span>
                    <span className="regular-icon close-icon" onClick={onClose}></span>
                </div>

                <div className="popup-body">
                    {children}
                </div>

                {buttons?.length && (
                    <div className="popup-buttons">
                        {buttons.map(button =>
                            <button className={button.type === 'secondary' ? 'secondary' : null} onClick={button.onClick}>{button.name}</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Popup