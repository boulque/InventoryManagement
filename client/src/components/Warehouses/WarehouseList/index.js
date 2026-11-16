import { useEntityList } from '../../../hooks/useEntityList.js';
import { warehouseTypes } from '../../../lists.js';
import {colType, cellAlign} from '../../../enums.js';
import Confirm from '../../Common/Confirm';
import Loading from '../../Common/Loading';
import CreateWarehousePopup from '../CreateWarehousePopup';
import Warehouse from '../Warehouse';
import Toolbar from '../../Common/Toolbar';
import Grid from '../../Common/Grid';
import Message from '../../Common/Message';

function WarehouseList({setTitle}) {
    const checkDelete = async (id) => {
        const response = await fetch('/api/stockmovements/haslines?warehouseID=' + id);

        if (!response.ok)
            return;

        const hasLines = await response.json();
        return hasLines ? 'Cannot delete warehouse because it has stock movements.' : null;
    };

    const list = useEntityList({
        setTitle,
        title: 'Warehouses',
        url: '/api/warehouses',
        entityName: 'warehouse',
        checkDelete: checkDelete
    });

    const gridButtons = [
        {
            name: 'Create',
            onClick: list.openCreatePopup,
            icon: 'add'
        }
    ];

    const gridCols = [
        {
            name: 'Name',
            property: 'name',
            width: 220
        },
        {
            name: 'Type',
            property: 'type',
            width: 100,
            list: warehouseTypes
        },
        {
            name: 'Address',
            property: 'address',
            width: 220
        },
        {
            type: colType.Icon,
            onClick: list.confirmDelete,
            icon: 'trash-bin',
            width: 30,
            align: cellAlign.Center
        }
    ];

    return (
        <div className="workspace">
            <div className="left-pane">
                <Toolbar buttons={gridButtons} />
                <Grid cols={gridCols} data={list.items} selectedID={list.selectedID} setSelectedID={list.setSelectedID} 
                    onSelect={list.onSelect} toggleLoading={list.toggleLoading} />
            </div>
            <div className="details-pane">
                {list.item && 
                    <Warehouse key={list.item.id} warehouse={list.item} setWarehouse={list.setItem} reload={list.load}
                        toggleLoading={list.toggleLoading} />}
            </div>
            {list.isCreatePopupOpen &&
                <CreateWarehousePopup onClose={list.closeCreatePopup}
                    callback={list.createCallback} toggleLoading={list.toggleLoading} />}
            {list.isConfirmOpen &&
                <Confirm onClose={list.closeConfirm}
                    text={list.confirmText} onConfirm={list.deleteItem} />}
            {list.isMessageOpen &&
                <Message message={list.messageText} onClose={list.closeMessage} />}
            {list.isLoadingActive &&
                <Loading />}
        </div>
    );
}

export default WarehouseList;