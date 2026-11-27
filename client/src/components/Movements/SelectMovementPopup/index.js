import Grid from '../../Common/Grid';
import Popup from '../../Common/Popup';
import { movementTypes } from '../../../lists';
import { cellAlign } from '../../../enums';
import React from 'react';
import Requests from '../../../requests.js';

function SelectMovementPopup({onClose, onSelect, formatDate, toggleLoading}) {
    const [selectedID, setSelectedID] = React.useState(0);
    const [stockMovements, setStockMovements] = React.useState(null);

    React.useEffect(() => {
        const loadStockMovements = async () => {
            const response = await Requests.withLoading(
                async () => await Requests.request('/api/stockmovements'),
                toggleLoading
            );
            
            if (!response.ok)
                return;
            
            const data = await response.json();
            for (let i = 0; i < data.length; i++) {
                data[i].date = new Date(data[i].createdAt);
            }

            setStockMovements(data);
        };

        loadStockMovements();
    }, []);

    const buttons = [
        {
            name: 'Close',
            onClick: onClose,
            type: 'secondary'
        },
        {
            name: 'Select',
            onClick: () => {
                onClose();
                onSelect(selectedID);
            }
        }
    ];

    const gridCols = [
        {
            name: 'Date',
            display: i => formatDate(i.date),
            width: 160
        },
        {
            name: 'From Warehouse',
            display: i => i.fromWarehouse?.name ?? '',
            width: 180
        },
        {
            name: 'To Warehouse',
            display: i => i.toWarehouse?.name ?? '',
            width: 180
        },
        {
            name: 'Type',
            display: i => i.type,
            width: 100,
            list: movementTypes
        },
        {
            name: 'Quantity',
            display: i => i.quantity,
            width: 80,
            align: cellAlign.Center
        }
    ];

    return (
        <Popup onClose={onClose} name="Select Movement" buttons={buttons} width={750}>
            <Grid cols={gridCols} data={stockMovements} selectedID={selectedID} setSelectedID={setSelectedID}
                height={400} toggleLoading={toggleLoading} />
        </Popup>
    );
}

export default SelectMovementPopup;