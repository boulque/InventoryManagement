import Popup from '../../Common/Popup';

function Confirm({onClose, text, onConfirm}) {
    const buttons = [
        {
            name: 'Cancel',
            onClick: onClose,
            type: 'secondary'
        },
        {
            name: 'OK',
            onClick: () => {
                onClose();
                onConfirm();
            }
        }
    ];

    return (
        <Popup onClose={onClose} name="Confirm Action"
                  buttons={buttons} width={500}>
            <div className="confirm-text">{text}</div>
        </Popup>
    );
}

export default Confirm;