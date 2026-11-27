import React from 'react';
import Field from '../../Common/Field';
import Toolbar from '../../Common/Toolbar';
import Message from '../../Common/Message';
import Requests from '../../../requests.js';
import MovementItems from '../MovementItems/index.js';

function Movement({ref, warehouseID, type, fromWarehouseID, toggleLoading, reload, reloadHistory}) {
    const defaultValidationResults = {
        barcode: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);
    const [barcode, setBarcode] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [movementItems, setMovementItems] = React.useState(null);
    const [isMessageOpen, setIsMessageOpen] = React.useState(false);
    const [messageText, setMessageText] = React.useState('');

    React.useImperativeHandle(ref, () => ({
        clear: () => setMovementItems(null),
        hasItems: () => movementItems && movementItems.length > 0
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
                    productID: item.product.id,
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
            const scannedItem = movementItems.find(item => item.product.id === data[0].id);
            if (scannedItem && scannedItem.quantity >= scannedItem.remainder) {
                setValidationResults({ barcode: {isValid: false, error: 'The quantity reached max value'} });
                toggleLoading(false);
                return;
            }
        }

        if (movementItems?.some(item => item.product.id === data[0].id)) {
            setMovementItems(prev => prev.map(i => i.product.id === data[0].id ? 
                {...i, quantity: i.quantity + 1, blink: true} : i));

            setTimeout(() => {
                setMovementItems(prev => prev.map(i => i.product.id === data[0].id ? 
                {...i, blink: false} : i));
            }, 500);
        } else {   
            const movementItem = {
                product: {
                    id: data[0].id,
                    image: data[0].image,
                    name: data[0].name,
                    category: data[0].category,
                    brand: data[0].brand
                },
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

    return (
        <>
            <Toolbar buttons={buttons} />
            <div className="details">
                <div className="movement" style={{width: 'fit-content'}}>
                    <Field value={comment} sendValue={(_, val) => setComment(val)} width={500} placeholder="Write a comment"
                        isTextArea={true} />
                    <Field ref={fieldRef} value={barcode} sendValue={(_, val) => setBarcode(val)} onKeyDown={onKeyDown} width={500}
                        placeholder="Scan a barcode, press Enter to submit" validationResult={validationResults.barcode} />
                    {movementItems &&
                        <MovementItems scanMode={true} type={type} movementItems={movementItems} setMovementItems={setMovementItems} />}
                </div>
            </div>
            {isMessageOpen &&
                <Message message={messageText} onClose={() => setIsMessageOpen(false)} />}
        </>
    );
}

export default Movement;