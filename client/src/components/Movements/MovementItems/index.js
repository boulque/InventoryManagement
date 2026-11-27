import { productCategories, productBrands } from '../../../lists.js';
import React from 'react';
import Confirm from '../../Common/Confirm';
import './index.css';

function MovementItems({scanMode = false, type, movementItems, setMovementItems, style}) {
    const [deletingProductID, setDeletingProductID] = React.useState('');
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState('');
    const imgSize = 50;

    const decrease = (item) => {
        setMovementItems(prev => prev.map(i => i === item && i.quantity > 1 ?
            {...i, quantity: i.quantity - 1} : i));
    };

    const increase = (item) => {
        setMovementItems(prev => prev.map(i => i === item && (type === 0 || i.quantity < i.remainder) ?
            {...i, quantity: i.quantity + 1} : i));
    };

    const confirmRemove = (item) => {
        setDeletingProductID(item.product.id);
        setConfirmText(`Are you sure you want to delete row with product '${item.product.name}'?`);
        setIsConfirmOpen(true);
    };

    const remove = () => {
        setMovementItems(prev => prev.filter(i => i.product.id !== deletingProductID));
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
            <div className="movement-headers">
                <div className="movement-header" style={{width: imgSize}} />
                <div className="movement-header" style={{width: 400, paddingLeft: 10}}>Product</div>
                <div className="movement-header" style={{width: 80, textAlign: 'center'}}>Quantity</div>
                {scanMode && [1, 2].includes(type) &&
                    <div className="movement-header" style={{width: 80, textAlign: 'center', paddingLeft: 20}}>Remainder</div>}
            </div>
            <div className="movement-items" style={style}>
                {movementItems ? movementItems.map(item => (
                    <div key={item.product.id} className="movement-item columns">
                        <div className="movement-item-image" style={{width: imgSize}}>
                            {item.product.image ? 
                                <img src={item.product.image} style={{maxWidth: imgSize, maxHeight: imgSize}} /> :
                                <div className="no-image" style={{width: imgSize, height: imgSize}} />}
                        </div>
                        <div className="movement-item-info" style={{width: 400, paddingLeft: 10}}>
                            <div className="movement-item-name">{item.product.name}</div>
                            <div className="columns" style={{marginTop: 5}}>
                                <div>{productCategories.find(cat => cat.value == item.product.category)?.name ?? ''}</div>
                                <div style={{marginLeft: 20}}>{productBrands.find(br => br.value == item.product.brand)?.name ?? ''}</div>
                            </div>
                        </div>
                        <div className="movement-item-qty" style={{width: 80}}>
                            {scanMode ?
                                <>
                                    <div className="icon icon-minus" title="Decrease" onClick={() => decrease(item)} />
                                    {item.edit ? 
                                        <input type="text" value={item.quantity} autoFocus onFocus={(e) => e.target.select()} onBlur={() => editEnd(item)} 
                                            onChange={(e) => onEdit(e, item)} onKeyDown={(e) => onEditKeyDown(e, item)} /> :
                                        <div className={'qty-value editable' + (item.blink ? ' blinking' : '')} 
                                            onClick={() => editStart(item)}>{item.quantity}</div>}
                                    <div className="icon icon-plus" title="Increase" onClick={() => increase(item)} />
                                </> :
                                <div className="qty-value">{item.quantity}</div>}
                        </div>
                        {scanMode && [1, 2].includes(type) &&
                            <div className="movement-item-remainder" style={{width: 80, paddingLeft: 20}}>
                                <div>{item.remainder}</div>
                            </div>}
                        {scanMode &&
                            <div className="movement-item-action">
                                <div className="icon icon-close" title="Delete" onClick={() => confirmRemove(item)} />
                            </div>}
                    </div>
                )) : Array(5).keys().map(_ => <div className="item-placeholder" />)}
            </div>
            {isConfirmOpen &&
                <Confirm onClose={() => setIsConfirmOpen(false)} text={confirmText} onConfirm={remove} />}
        </>
    );
}

export default MovementItems;