import Popup from '../../Common/Popup';
import Field from '../../Common/Field';
import { movementTypes } from '../../../lists';
import './index.css';
import React from 'react';
import Requests from '../../../requests';
import MovementItems from '../MovementItems';

function MovementPopup({stockMovementID, onClose, formatDate, toggleLoading}) {
    const [stockMovement, setStockMovement] = React.useState(null);

    React.useEffect(() => {
        const loadMovement = async () => {
            const response = await Requests.withLoading(
                async () => await Requests.request(`/api/stockmovements/${stockMovementID}`),
                toggleLoading
            );

            if (!response.ok)
                return;
            
            const data = await response.json();
            data.date = new Date(data.createdAt);
            data.typeText = movementTypes.find(t => t.value === data.type)?.name ?? '';

            setStockMovement(data);
        };

        loadMovement();
    }, []);    

    const buttons = [
        {
            name: 'Close',
            onClick: onClose,
            type: 'secondary'
        }
    ];

    return (
        <Popup onClose={onClose} name="Movement Details" buttons={buttons} width={750}>
            <div className="columns">
                <div className="extra-column">
                    {stockMovement ?
                        <Field label="Date" value={formatDate(stockMovement.date)} edit={false} /> :
                        <div className="item-placeholder" />}
                    {stockMovement ?
                        <Field label="From Warehouse" value={stockMovement.fromWarehouse?.name ?? ''} edit={false} /> :
                        <div className="item-placeholder" />}
                </div>
                <div className="extra-column">
                    {stockMovement ?
                        <Field label="Type" value={stockMovement.typeText} edit={false} /> :
                        <div className="item-placeholder" />}
                    {stockMovement ?
                        <Field label="To Warehouse" value={stockMovement.toWarehouse?.name ?? ''} edit={false} /> :
                        <div className="item-placeholder" />}
                </div>
                <div className="extra-column">
                    {stockMovement ?
                        <Field label="Quantity" value={stockMovement.quantity} edit={false} /> :
                        <div className="item-placeholder" />}
                    {stockMovement ?
                        <Field label="User" value={stockMovement.userName} edit={false} /> :
                        <div className="item-placeholder" />}
                </div>
            </div>
            {stockMovement ?
                <Field label="Comment" value={stockMovement.comment ? stockMovement.comment : '-'} edit={false} maxHeight={80} /> :
                <div className="item-placeholder" />}
            <MovementItems movementItems={stockMovement ? stockMovement.lines : null} style={{maxHeight: 300}} />
        </Popup>
    );
}

export default MovementPopup;