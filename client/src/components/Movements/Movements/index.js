import React from 'react';
import Field from '../../Common/Field';
import Loading from '../../Common/Loading';
import {colType, cellAlign} from '../../../enums.js';
import { productBrands, productCategories, movementTypes } from '../../../lists.js';
import Cookies from '../../../cookies.js';
import Grid from '../../Common/Grid';
import Movement from '../Movement';
import Confirm from '../../Common/Confirm';
import MovementHistory from '../MovementHistory';
import Requests from '../../../requests.js';

function Movements({setTitle}) {
    const [isLoadingActive, setIsLoadingActive] = React.useState(false);
    const [warehouses, setWarehouses] = React.useState(null);
    const [inventoryItems, setInventoryItems] = React.useState([]);
    const [selectedID, setSelectedID] = React.useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState('');
    const [movementParams, setMovementParams] = React.useState({
        warehouseID: Cookies.getNumber('WarehouseID'),
        movementType: Cookies.getNumber('MovementType'),
        fromWarehouseID: Cookies.getNumber('FromWarehouseID')
    });
    const [pendingParams, setPendingParams] = React.useState(null);
    const movementRef = React.useRef(null);
    const historyRef = React.useRef(null);

    const sendValue = (property, value) => {
        setMovementParams(prev => {
            const next = {...prev, [property]: value};
            if (property === 'warehouseID' || property === 'movementType')
                next.fromWarehouseID = null;
            return next;
        });

        if (isItemPanelActive)
            movementRef.current.clear();
    };

    const fromWarehouses =
        warehouses &&
        movementParams.movementType === 1 &&
        movementParams.warehouseID !== null ? warehouses.filter(wh => wh.id != movementParams.warehouseID) : null;

    const isParamPanelActive = warehouses && movementParams.warehouseID !== null;

    const isItemPanelActive = warehouses && 
        movementParams.movementType !== null &&
        (movementParams.movementType !== 1 || movementParams.fromWarehouseID !== null);

    const loadWarehouses = async () => {
        const response = await Requests.withLoading(async () => await Requests.request('/api/warehouses'),
            setIsLoadingActive);
        
        if (!response.ok)
            return;

        const data = await response.json();
        setWarehouses(data);
        
        setMovementParams(prev => {
            const exists = (id) => id !== null && data.some(wh => wh.id === id);
            if (!exists(prev.warehouseID))
                return {...prev, warehouseID: null, fromWarehouseID: null};
            if (prev.fromWarehouseID !== null &&
                (!exists(prev.fromWarehouseID) || prev.fromWarehouseID === prev.warehouseID))
                return {...prev, fromWarehouseID: null};
            return prev;
        });
    };

    const loadInventoryItems = async () => {
        const response = await Requests.withLoading(
            async () => await Requests.request(`/api/inventoryitems?warehouseID=${movementParams.warehouseID}`),
            setIsLoadingActive
        );

        if (!response.ok)
            return;
        
        setInventoryItems(await response.json());
    };

    React.useEffect(() => {
        setTitle('Movements');
        loadWarehouses();
    }, []);

    React.useEffect(() => {
        Cookies.set('WarehouseID', movementParams.warehouseID);
        Cookies.set('MovementType', movementParams.movementType);
        Cookies.set('FromWarehouseID', movementParams.fromWarehouseID);
    }, [movementParams]);

    React.useEffect(() => {
        if (!warehouses || movementParams.warehouseID === null) {
            setInventoryItems([]);
            setIsLoadingActive(false);
            return;
        }

        loadInventoryItems();
    }, [warehouses, movementParams.warehouseID]);

    const gridCols = [
        {
            property: 'image',
            type: colType.Image,
            align: cellAlign.Center,
            width: 70
        },
        {
            name: 'Name',
            property: 'name',
            width: 220
        },
        {
            name: 'Category',
            property: 'category',
            width: 140,
            list: productCategories
        },
        {
            name: 'Brand',
            property: 'brand',
            width: 140,
            list: productBrands
        },
        {
            name: 'Quantity',
            property: 'quantity',
            width: 100
        }
    ];

    const onBeforeSelect = (property, value) => {
        if (movementRef.current?.hasItems()) {
            setPendingParams({property, value});
            setConfirmText('You have an unsaved data. Do you wish to reset scanned items?');
            setIsConfirmOpen(true);
        } else {
            sendValue(property, value);
        }
    };

    const onClose = () => {
        setPendingParams(null);
        setIsConfirmOpen(false);
    };

    const onConfirm = () => {
        sendValue(pendingParams.property, pendingParams.value);
        setPendingParams(null);
    };

    return (
        <div className="workspace">
            <div className="left-pane">
                {warehouses &&
                    <div style={{marginLeft: 20, marginTop: 20}}>
                        <Field label="Warehouse" property="warehouseID" value={movementParams.warehouseID} sendValue={sendValue}
                            onBeforeSelect={onBeforeSelect}
                            options={warehouses.map(wh => ({
                                value: wh.id,
                                name: wh.name
                            }))} width={200} />
                    </div>}
                <Grid cols={gridCols} data={inventoryItems} selectedID={selectedID} setSelectedID={setSelectedID} 
                    toggleLoading={setIsLoadingActive} />
            </div>
            <div className="details-pane">
                {isParamPanelActive &&
                    <div className="columns" style={{marginLeft: 20, marginTop: 20}}>
                        <Field label="Movement Type" property="movementType" value={movementParams.movementType} sendValue={sendValue}
                            onBeforeSelect={onBeforeSelect} options={movementTypes} width={200} />
                        {fromWarehouses &&
                            <Field label="From Warehouse" property="fromWarehouseID" value={movementParams.fromWarehouseID} 
                                sendValue={sendValue} onBeforeSelect={onBeforeSelect}
                                options={fromWarehouses.map(wh => ({
                                    value: wh.id,
                                    name: wh.name
                                }))} width={200} />}
                    </div>}
                {isItemPanelActive &&
                    <>
                        <div className="title">
                            {movementTypes.find(t => t.value === movementParams.movementType).name + (
                                movementParams.fromWarehouseID !== null ? ' from Warehouse: ' + warehouses.find(wh => wh.id === movementParams.fromWarehouseID).name : ''
                            )}
                        </div>
                        <Movement ref={movementRef} warehouseID={movementParams.warehouseID} type={movementParams.movementType} 
                            fromWarehouseID={movementParams.fromWarehouseID} toggleLoading={setIsLoadingActive}
                            reload={loadInventoryItems} reloadHistory={historyRef.current?.reload} />
                    </>}
            </div>
            <div className="right-pane" style={{width: 500}}>
                <MovementHistory ref={historyRef} toggleLoading={setIsLoadingActive} />
            </div>
            {isConfirmOpen &&
                <Confirm onClose={onClose} text={confirmText} onConfirm={onConfirm} />}
            {isLoadingActive &&
                <Loading />}
        </div>
    );
}

export default Movements;