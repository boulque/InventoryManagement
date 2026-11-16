import Field from '../../Common/Field';
import FileUpload from '../../Common/FileUpload';
import Toolbar from '../../Common/Toolbar';
import React from 'react';
import { productCategories, productBrands } from '../../../lists.js';

function Product({product, setProduct, reload, toggleLoading}) {
    const defaultValidationResults = {
        name: {isValid: true, error: ''},
        category: {isValid: true, error: ''},
        brand: {isValid: true, error: ''},
        barcode: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);
    const [productDraft, setProductDraft] = React.useState({...product, imageFile: null, imageChanged: false});

    const validate = () => {
        let isValid = true;

        if (!productDraft.name.trim()) {
            setValidationResults(prev => ({...prev, name: {isValid: false, error: 'Product name must not be empty'}}));
            isValid = false;
        }
        if (productDraft.category === null) {
            setValidationResults(prev => ({...prev, category: {isValid: false, error: 'Product category must not be empty'}}));
            isValid = false;
        }
        if (productDraft.brand === null) {
            setValidationResults(prev => ({...prev, brand: {isValid: false, error: 'Product brand must not be empty'}}));
            isValid = false;
        }
        if (!/^\d+$/.test(productDraft.barcode)) {
            setValidationResults(prev => ({...prev, barcode: {isValid: false, error: 'Invalid value'}}));
            isValid = false;
        }

        return isValid;
    };

    const sendValue = (property, val) => {
        setProductDraft(prev => ({
            ...prev, 
            [property]: val,
            ...(property === 'imageFile' && {imageChanged: true})
        }));
    };

    const checkDuplicates = async () => {
        toggleLoading(true);
        let hasDulicates = false;

        try {
            const response = await fetch(`/api/products?barcode=${productDraft.barcode}`);
            
            if (!response.ok)
                throw new Error(await response.text());

            const data = await response.json();

            if (data.length !== 0 && data[0].id != product.id) {
                setValidationResults(prev => ({...prev, barcode: {isValid: false, error: 'Product with this barcode already exists'}}));
                hasDulicates = true;
            }
        } finally {
            toggleLoading(false);
        }
        
        return !hasDulicates;
    };

    const save = async () => {
        setValidationResults(defaultValidationResults);
        if (!validate())
            return;

        if (!await checkDuplicates())
            return;

        toggleLoading(true);
        try {
            const data = new FormData();
            
            data.append('id', productDraft.id);
            data.append('name', productDraft.name.trim());
            data.append('imageFile', productDraft.imageFile && productDraft.imageFile.length > 0 ? productDraft.imageFile[0] : null);
            data.append('imageChanged', productDraft.imageChanged);
            data.append('category', parseInt(productDraft.category));
            data.append('brand', parseInt(productDraft.brand));
            data.append('barcode', productDraft.barcode);
            
            const response = await fetch('/api/products', {
                method: 'PUT',
                body: data
            });
            
            if (!response.ok)
                throw new Error(await response.text());
            
            await reload();
            const saved = {...productDraft, imageFile: null, imageChanged: false};
            setProductDraft(saved);
            setProduct(saved);
        } finally {
            toggleLoading(false);
        }
    };

    const toolbarButtons = [
        {
            name: 'Save',
            onClick: save,
            icon: 'save'
        }
    ];
    
    return <>
        <div className="title">{product.name}</div>
        <Toolbar buttons={toolbarButtons} />
        <div className="details" style={{width: 500}}>
            <FileUpload label="Image" folderGUID={product.imageFolderGUID} isImage={true} isMultiple={false}
                property="imageFile" sendValue={sendValue} toggleLoading={toggleLoading} />
            <Field label="Name" property="name" value={productDraft.name} sendValue={sendValue} validationResult={validationResults.name} />
            <div className="columns">
                <Field label="Category" property="category" value={productDraft.category} sendValue={sendValue} options={productCategories} width={200}
                    validationResult={validationResults.category} />
                <Field label="Brand" property="brand" value={productDraft.brand} sendValue={sendValue} options={productBrands} width={200}
                    validationResult={validationResults.brand} />
            </div>
            <Field label="Barcode" property="barcode" value={productDraft.barcode} sendValue={sendValue} width={200}
                validationResult={validationResults.barcode} />
        </div>
    </>;
}

export default Product