import Popup from '../../Common/Popup';

function MovementPopup({message, onClose}) {
    const buttons = [
        {
            name: 'Close',
            onClick: onClose,
            type: 'secondary'
        }
    ];

    return (
        <Popup onClose={onClose} name="Message"
            buttons={buttons} width={500}>
            <div className="message-text">{message}</div>
        </Popup>
    );
}

export default MovementPopup;