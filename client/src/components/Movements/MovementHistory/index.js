import React from 'react';
import './index.css';
import { movementTypes } from '../../../lists';
import MovementPopup from '../MovementPopup';
import Requests from '../../../requests.js';

function MovementHistory({ref, stockMovements, setStockMovements, formatDate, toggleLoading}) {
    const [isMovementPopupActive, setIsMovementPopupActive] = React.useState(false);
    const [stockMovementID, setStockMovementID] = React.useState(null);
    const itemsRef = React.useRef(null);

    const loadStockMovements = async () => {
        const response = await Requests.request('/api/stockmovements');
            
        if (!response.ok)
            return;
        
        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            data[i].date = new Date(data[i].createdAt);
            data[i].typeText = movementTypes.find(t => t.value === data[i].type)?.name ?? '';
        }

        setStockMovements(data.sort((m1, m2) => m1.id - m2.id));
    };

    React.useLayoutEffect(() => {
        if (stockMovements !== null && itemsRef.current)
            itemsRef.current.scrollTop = itemsRef.current.scrollHeight;
    }, [stockMovements]);

    React.useImperativeHandle(ref, () => ({
        reload: () => {
            setStockMovements(null);
            loadStockMovements();
        }
    }));

    React.useEffect(() => {
        if (!stockMovements)
            loadStockMovements();
    }, []);

    const showMovement = (id) => {
        setStockMovementID(id);
        setIsMovementPopupActive(true);
    };
    
    return (
        <>
            <div className="movement-history">
                <div ref={itemsRef} className="history-items">
                    {stockMovements ?
                        stockMovements.map(m =>
                            <div key={m.id} className="history-item" onClick={() => showMovement(m.id)}>
                                <div className={'movement-icon icon-movement-type-' + m.type} />
                                <span className="history-item-date">{formatDate(m.date)}</span>
                                <span className="history-item-warehouses">
                                    {[1, 2].includes(m.type) ? m.fromWarehouse.name : ''}{m.type === 1 ? ' → ' : ''}{[0, 1].includes(m.type) ? m.toWarehouse.name : ''}
                                </span>
                                <span className="history-item-type">{m.typeText}</span>
                                <span className="history-item-quantity">{m.quantity} item(s)</span>
                            </div>
                        ) : Array(5).keys().map(_ =>
                            <div className="item-placeholder" />
                        )}
                </div>
            </div>
            {isMovementPopupActive &&
                <MovementPopup stockMovementID={stockMovementID} onClose={() => setIsMovementPopupActive(false)}
                    formatDate={formatDate} toggleLoading={toggleLoading} />}
        </>
    );
}

export default MovementHistory;