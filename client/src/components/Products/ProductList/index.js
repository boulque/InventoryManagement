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
import Requests from '../../../requests.js';
import React from 'react';
import ImportPopup from '../ImportPopup';
import Field from '../../Common/Field/index.js';

function ProductList({setTitle}) {
    const [isImportPopupActive, setIsImportPopupActive] = React.useState(false);
    const [listParams, setListParams] = React.useState({brand: null, category: null});

    const checkDelete = async (id) => {
        const response = await Requests.request('/api/stockmovements/haslines?productID=' + id);

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

    const sendSearchValue = (property, value) => {
        setListParams(prev => ({...prev, [property]: value}));
    };

    React.useEffect(() => {
        const brandParam = listParams.brand !== null ? 'brand=' + listParams.brand : '';
        const categoryParam = listParams.category !== null ? 'category=' + listParams.category : '';
        const query = brandParam || categoryParam ? 
            '?' + (brandParam ? brandParam : '') + (categoryParam ? (brandParam ? '&' : '') + categoryParam : '') : 
            null;
        
        list.load(query);
    }, [listParams]);
    
    const gridButtons = [
        {
            name: 'Create',
            onClick: list.openCreatePopup,
            icon: 'add'
        },
        ...(new URLSearchParams(document.location.search).get('_dev') === '1' ? [{
            name: 'Import',
            onClick: () => setIsImportPopupActive(true)
        }] : [])
    ];

    const gridCols = [
        {
            display: i => i.image,
            type: colType.Image,
            align: cellAlign.Center,
            width: 70
        },
        {
            name: 'Name',
            display: i => i.name,
            width: 220
        },
        {
            name: 'Category',
            display: i => i.category,
            width: 140,
            list: productCategories
        },
        {
            name: 'Brand',
            display: i => i.brand,
            width: 140,
            list: productBrands
        },
        {
            name: 'Barcode',
            display: i => i.barcode,
            width: 100,
            align: cellAlign.Center
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
                <div className="columns" style={{marginLeft: 20, marginTop: 20}}>
                    <Field label="Category" property="category" sendValue={sendSearchValue}
                        options={[{value: null, name: ''}, ...productCategories]} width={200} />
                    <Field label="Brand" property="brand" sendValue={sendSearchValue}
                        options={[{value: null, name: ''}, ...productBrands]} width={200} />
                </div>
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
            {isImportPopupActive &&
                <ImportPopup onClose={() => setIsImportPopupActive(false)} callback={list.load}
                    toggleLoading={list.toggleLoading} />}
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