import Popup from '../../Common/Popup';
import Field from '../../Common/Field';
import { productCategories, productBrands } from '../../../lists';

function MovementPopup({stockMovement, onClose}) {
    const buttons = [
        {
            name: 'Close',
            onClick: onClose,
            type: 'secondary'
        }
    ];

    const imgSize = 50;

    return (
        <Popup onClose={onClose} name="Movement Details"
            buttons={buttons} width={750}>
            <Field label="Comment" value={stockMovement.comment ? stockMovement.comment : '-'} edit={false} />
            <div className="movement-headers">
                <div className="movement-header" style={{width: imgSize}} />
                <div className="movement-header" style={{width: 400, paddingLeft: 10}}>Product</div>
                <div className="movement-header" style={{width: 60, textAlign: 'center'}}>Quantity</div>
            </div>
            <div className="movement-items" style={{maxHeight: 400}}>
                {stockMovement.lines.map(item => (
                    <div key={item.id} className="movement-item columns">
                        {item.product.image ?
                            <div className="movement-item-image" style={{width: imgSize}}>
                                <img src={item.product.image} style={{maxWidth: imgSize, maxHeight: imgSize}} />
                            </div> :
                            <div className="no-image" style={{width: imgSize, height: imgSize}} />}
                        <div className="movement-item-info" style={{width: 400, paddingLeft: 10}}>
                            <div className="movement-item-name">{item.product.name}</div>
                            <div className="columns" style={{marginTop: 10}}>
                                <div>{productCategories.find(cat => cat.value == item.product.category)?.name ?? ''}</div>
                                <div style={{marginLeft: 20}}>{productBrands.find(br => br.value == item.product.brand)?.name ?? ''}</div>
                            </div>
                        </div>
                        <div className="movement-item-qty" style={{width: 60}}>
                            <div className="qty-value" title="Quantity">{item.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Popup>
    );
}

export default MovementPopup;