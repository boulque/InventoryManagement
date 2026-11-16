import React from 'react';
import Field from '../../Common/Field';
import { productCategories, productBrands } from '../../../lists.js';
import './index.css'
import Confirm from '../../Common/Confirm';
import Toolbar from '../../Common/Toolbar';
import Message from '../../Common/Message';
import Requests from '../../../requests.js';

function Movement({ref, warehouseID, type, fromWarehouseID, toggleLoading, reload, reloadHistory}) {
    const defaultValidationResults = {
        barcode: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);
    const [barcode, setBarcode] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [movementItems, setMovementItems] = React.useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState('');
    const [deletingProductID, setDeletingProductID] = React.useState('');
    const [isMessageOpen, setIsMessageOpen] = React.useState(false);
    const [messageText, setMessageText] = React.useState('');

    React.useImperativeHandle(ref, () => ({
        clear: () => setMovementItems(null),
        hasItems: () => movementItems && movementItems.length !== 0
    }));

    const openMessage = (text) => {
        setMessageText(text);
        setIsMessageOpen(true);
    };

    const finish = async () => {
        const apiMethod = type == 0 ? 'receipt' :
            type == 1 ? 'transfer' :
            type == 2 ? 'dispatch' : null;

        if (!apiMethod)
            throw new Error('Invalid data');

        const response = await Requests.withLoading(async () => await Requests.request(`/api/inventoryitems/${apiMethod}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                fromWarehouseID: type === 2 ? warehouseID : fromWarehouseID,
                toWarehouseID: type === 2 ? null : warehouseID,
                comment: comment,
                inventoryItems: movementItems.map(item => ({
                    productID: item.productID,
                    quantity: item.quantity
                }))
            })
        }), toggleLoading);

        if (!response.ok)
            return;

        const data = await response.json();
        if (data.isError)
        {
            openMessage(data.message);
            return;
        }

        setMovementItems(null);
        setComment('');
        if (reloadHistory)
            reloadHistory();
        await Requests.withLoading(reload, toggleLoading);
    };

    const buttons = [
        {
            name: 'Finish',
            onClick: finish,
            icon: 'finish',
            disabled: !movementItems || movementItems.length === 0
        }
    ];

    const fieldRef = React.useRef(null);

    const imgSize = 50;

    const onKeyDown = (e) => {
        if (e.key === 'Enter')
            submit();
    };

    const validate = () => {
        if (!/^\d+$/.test(barcode)) {
            setValidationResults({ barcode: {isValid: false, error: 'Invalid value'}});
            return false;
        }

        return true;
    };

    const submit = async () => {
        setValidationResults(defaultValidationResults);

        if (!validate()) {
            fieldRef.current?.focus();
            return;
        }

        const warehouseParam = type == 1 ? '&warehouseID=' + fromWarehouseID :
            type == 2 ? '&warehouseID=' + warehouseID : '';

        const response = await Requests.withLoading(
            async () => await Requests.request(`/api/products?barcode=${encodeURIComponent(barcode.trim())}${warehouseParam}`), 
            toggleLoading
        );

        if (!response.ok)
            return;

        const data = await response.json();

        if (data.length === 0) {
            setValidationResults({ barcode: {isValid: false, error: 'No products were found'} });
            toggleLoading(false);
            return;
        }

        if (movementItems && [1, 2].includes(type)) {
            const scannedItem = movementItems.find(item => item.productID === data[0].id);
            if (scannedItem && scannedItem.quantity >= scannedItem.remainder) {
                setValidationResults({ barcode: {isValid: false, error: 'The quantity reached max value'} });
                toggleLoading(false);
                return;
            }
        }

        if (movementItems?.some(item => item.productID === data[0].id)) {
            setMovementItems(prev => prev.map(i => i.productID === data[0].id ? 
                {...i, quantity: i.quantity + 1, blink: true} : i));

            setTimeout(() => {
                setMovementItems(prev => prev.map(i => i.productID === data[0].id ? 
                {...i, blink: false} : i));
            }, 500);
        } else {   
            const movementItem = {
                productID: data[0].id,
                image: data[0].image,
                name: data[0].name,
                category: data[0].category,
                brand: data[0].brand,
                remainder: data[0].remainder,
                quantity: 1,
                blink: false,
                edit: false
            };
            setMovementItems(prev => {
                return prev ? [movementItem, ...prev] : [movementItem]
            });
        }
        
        setBarcode('');
        fieldRef.current?.focus();
    };

    React.useEffect(() => {
        fieldRef.current?.focus();
    }, []);

    const decrease = (item) => {
        setMovementItems(prev => prev.map(i => i === item && i.quantity > 1 ?
            {...i, quantity: i.quantity - 1} : i));
    };

    const increase = (item) => {
        setMovementItems(prev => prev.map(i => i === item && (type === 0 || i.quantity < i.remainder) ?
            {...i, quantity: i.quantity + 1} : i));
    };

    const confirmRemove = (item) => {
        setDeletingProductID(item.productID);
        setConfirmText(`Are you sure you want to delete row with product '${item.name}'?`);
        setIsConfirmOpen(true);
    };

    const remove = () => {
        setMovementItems(prev => prev.filter(i => i.productID !== deletingProductID));
    };

    const editStart = (item) => {
        setMovementItems(prev => prev.map(i => i === item ?
            {...i, edit: true} : i
        ));
    };

    const editEnd = (item) => {
        setMovementItems(prev => prev.map(i => i === item ?
            {...i, edit: false, quantity: [1, 2].includes(type) && i.quantity > i.remainder ? i.remainder : i.quantity} : i
        ));
    };

    const onEdit = (e, item) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1)
            return;
        setMovementItems(prev => prev.map(i => i === item ?
            {...i, quantity: val} : i
        ));
    };

    const onEditKeyDown = (e, item) => {
        if (e.key === 'Enter')
            editEnd(item);
    };

    return (
        <>
            <Toolbar buttons={buttons} />
            <div className="details">
                <div className="movement">
                    <div className="columns">
                        <Field ref={fieldRef} value={barcode} sendValue={(_, val) => setBarcode(val)} onKeyDown={onKeyDown} width={400}
                            placeholder="Scan a barcode" validationResult={validationResults.barcode} />
                        <button className="button" onClick={submit}>Submit</button>
                    </div>
                    <Field value={comment} sendValue={(_, val) => setComment(val)} width={400} placeholder="Comment..." />
                    {movementItems &&
                        <>
                            <div className="movement-headers">
                                <div className="movement-header" style={{width: imgSize}} />
                                <div className="movement-header" style={{width: 400, paddingLeft: 10}}>Product</div>
                                <div className="movement-header" style={{width: 80, textAlign: 'center'}}>Quantity</div>
                                {(type === 1 || type === 2) &&
                                    <div className="movement-header" style={{width: 80, textAlign: 'center', paddingLeft: 20}}>Remainder</div>}
                            </div>
                            <div className="movement-items">
                                {movementItems.map(item => (
                                    <div key={item.productID} className="movement-item columns">
                                        {item.image ? 
                                            <div className="movement-item-image" style={{width: imgSize}}>
                                                <img src={item.image} style={{maxWidth: imgSize, maxHeight: imgSize}} />
                                            </div> :
                                            <div className="no-image" style={{width: imgSize, height: imgSize}} />}
                                        <div className="movement-item-info" style={{width: 400, paddingLeft: 10}}>
                                            <div className="movement-item-name">{item.name}</div>
                                            <div className="columns" style={{marginTop: 10}}>
                                                <div>{productCategories.find(cat => cat.value == item.category)?.name ?? ''}</div>
                                                <div style={{marginLeft: 20}}>{productBrands.find(br => br.value == item.brand)?.name ?? ''}</div>
                                            </div>
                                        </div>
                                        <div className="movement-item-qty" style={{width: 80}}>
                                            <div className="icon icon-minus" title="Decrease" onClick={() => decrease(item)} />
                                            {item.edit ? <input type="text" value={item.quantity} autoFocus onFocus={(e) => e.target.select()} onBlur={() => editEnd(item)} 
                                                onChange={(e) => onEdit(e, item)} onKeyDown={(e) => onEditKeyDown(e, item)} /> :
                                                <div className={'qty-value editable' + (item.blink ? ' blinking' : '')} 
                                                    title="Quantity" onClick={() => editStart(item)}>{item.quantity}</div>}
                                            <div className="icon icon-plus" title="Increase" onClick={() => increase(item)} />
                                        </div>
                                        {(type === 1 || type === 2) &&
                                            <div className="movement-item-remainder" style={{width: 80, paddingLeft: 20}}>
                                                <div>{item.remainder}</div>
                                            </div>}
                                        <div className="movement-item-action">
                                            <div className="icon icon-close" title="Delete" onClick={() => confirmRemove(item)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>}
                </div>
            </div>
            {isConfirmOpen &&
                <Confirm onClose={() => setIsConfirmOpen(false)}
                    text={confirmText} onConfirm={remove} />}
            {isMessageOpen &&
                <Message message={messageText} onClose={() => setIsMessageOpen(false)} />}
        </>
    );
}

export default Movement;