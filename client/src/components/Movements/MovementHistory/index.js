import React from 'react';
import './index.css';
import { movementTypes } from '../../../lists';
import MovementPopup from '../MovementPopup';

function MovementHistory({ref, toggleLoading}) {
    const [stockMovements, setStockMovements] = React.useState(null);
    const [isMovementPopupActive, setIsMovementPopupActive] = React.useState(false);
    const [stockMovement, setStockMovement] = React.useState(null);

    const loadStockMovements = async () => {
        const response = await fetch('/api/stockmovements');
            
        if (!response.ok)
            throw new Error(await response.text());
        
        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            data[i].date = new Date(data[i].createdAt);
            data[i].typeText = movementTypes.find(t => t.value === data[i].type)?.name ?? '';
        }

        setStockMovements(data);
    };

    React.useImperativeHandle(ref, () => ({
        reload: () => {
            setStockMovements(null);
            loadStockMovements();
        }
    }));

    React.useEffect(() => {
        loadStockMovements();
    }, []);

    const showMovement = async (id) => {
        toggleLoading(true);
        try {
            const response = await fetch(`/api/stockmovements/${id}`);
            
            if (!response.ok)
                throw new Error(await response.text());
            
            const data = await response.json();
            data.date = new Date(data.createdAt);

            setStockMovement(data);
            setIsMovementPopupActive(true);
        } finally {
            toggleLoading(false);
        }
    };

    const formatDate = (date) => date.toLocaleDateString() + ' ' + date.getHours() + ':' + date.getMinutes();
    
    return (
        <>
            <div className="movement-history">
                <div className="history-title">Movement History</div>
                <div className="history-items">
                    {stockMovements ? 
                        stockMovements.map(m =>
                            <div className="history-item" onClick={() => showMovement(m.id)}>
                                <div className={'history-item-icon icon-movement-type-' + m.type} />
                                <span className="history-item-date">{formatDate(m.date)}</span>
                                <span className="history-item-warehouses">
                                    {[1, 2].includes(m.type) ? m.fromWarehouse.name : ''}{m.type === 1 ? ' → ' : ''}{[0, 1].includes(m.type) ? m.toWarehouse.name : ''}
                                </span>
                                <span className="history-item-type">{m.typeText}</span>
                                <span className="history-item-quantity">{m.quantity} item(s)</span>
                            </div>
                        ) : Array(5).keys().map(_ =>
                            <div className="history-item-placeholder" />
                        )}
                </div>
            </div>
            {isMovementPopupActive &&
                <MovementPopup stockMovement={stockMovement} onClose={() => setIsMovementPopupActive(false)} />}
        </>
    );
}

export default MovementHistory;