import Product from '../Product';
import Toolbar from '../../Common/Toolbar'
import CreateProductPopup from '../CreateProductPopup';
import { useEntityList } from '../../../hooks/useEntityList.js';
import Loading from '../../Common/Loading';
import Grid from '../../Common/Grid';
import { colType, cellAlign } from '../../../enums.js';
import Confirm from '../../Common/Confirm';
import { productBrands, productCategories } from '../../../lists.js';
import Message from '../../Common/Message';

function ProductList({setTitle}) {
    const checkDelete = async (id) => {
        const response = await fetch('/api/stockmovements/haslines?productID=' + id);

        if (!response.ok)
            return;

        const hasLines = await response.json();
        return hasLines ? 'Cannot delete product because it has stock movements.' : null;
    };

    const list = useEntityList({
        setTitle,
        title: 'Products',
        url: '/api/products',
        entityName: 'product',
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
            name: 'Barcode',
            property: 'barcode',
            width: 100
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
                    <Product key={list.item.id} product={list.item} setProduct={list.setItem} reload={list.load} 
                        toggleLoading={list.toggleLoading} />}
            </div>
            {list.isCreatePopupOpen &&
                <CreateProductPopup onClose={list.closeCreatePopup}
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

export default ProductList;