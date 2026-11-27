import './index.css';

function MovementDigest({stockMovement, onClear, onClick, style}) {
    return (
        <div className="linked-movement align-center" style={style} onClick={onClick}>
            <div className={'movement-icon icon-movement-type-' + stockMovement.type} />
            <div className="movement-info">
                {stockMovement.date.toLocaleDateString() + ', ' + 
                (stockMovement.toWarehouse ? stockMovement.toWarehouse.name : stockMovement.fromWarehouse.name) + ', ' +
                stockMovement.quantity}
            </div>
            {onClear &&
                <div className="clear-movement small-icon icon-close" onClick={onClear} />}
        </div>
    );
}

export default MovementDigest;