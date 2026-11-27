import Popup from '../../Common/Popup';
import Field from '../../Common/Field';
import React from 'react';
import FileUpload from '../../Common/FileUpload';
import { productCategories, productBrands } from '../../../lists.js';
import Requests from '../../../requests.js';

function CreateProductPopup({onClose, callback, toggleLoading}) {
    const defaultValidationResults = {
        name: {isValid: true, error: ''},
        category: {isValid: true, error: ''},
        brand: {isValid: true, error: ''},
        barcode: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);

    const [product, setProduct] = React.useState({
        name: '',
        imageFile: null,
        category: null,
        brand: null,
        barcode: ''
    });

    const sendValue = (property, val) => {
        setProduct(prev => ({...prev, [property]: val}));
    };

    const validate = () => {
        let isValid = true;

        if (!product.name.trim()) {
            setValidationResults(prev => ({...prev, name: {isValid: false, error: 'Product name must not be empty'}}));
            isValid = false;
        }
        if (product.category === null) {
            setValidationResults(prev => ({...prev, category: {isValid: false, error: 'Product category must not be empty'}}));
            isValid = false;
        }
        if (product.brand === null) {
            setValidationResults(prev => ({...prev, brand: {isValid: false, error: 'Product brand must not be empty'}}));
            isValid = false;
        }
        if (!/^\d+$/.test(product.barcode)) {
            setValidationResults(prev => ({...prev, barcode: {isValid: false, error: 'Invalid value'}}));
            isValid = false;
        }

        return isValid;
    };

    const checkDuplicates = async () => {
        let hasDulicates = false;

        const response = await Requests.withLoading(
            async () => await Requests.request(`/api/products?barcode=${encodeURIComponent(product.barcode)}`),
            toggleLoading
        );

        if (!response.ok)
            return;

        const data = await response.json();

        if (data.length !== 0) {
            setValidationResults(prev => ({...prev, barcode: {isValid: false, error: 'Product with this barcode already exists'}}));
            hasDulicates = true;
        }
        
        return !hasDulicates;
    };

    const create = async () => {
        setValidationResults(defaultValidationResults);

        if (!validate())
            return;

        if (!await checkDuplicates())
            return;

        const data = new FormData();

        data.append('name', product.name.trim());
        data.append('imageFile', product.imageFile && product.imageFile.length > 0 ? product.imageFile[0] : null);
        data.append('category', parseInt(product.category));
        data.append('brand', parseInt(product.brand));
        data.append('barcode', product.barcode);

        const response = await Requests.withLoading(
            async () => await Requests.request('/api/products', {
                method: 'POST',
                body: data
            }),
            toggleLoading
        );

        if (!response.ok)
            return;

        onClose();

        if (callback) {
            Requests.withLoading(
                async () => await callback((await response.json()).id), 
                toggleLoading
            );
        }
    };

    const buttons = [
        {
            name: 'Cancel',
            onClick: onClose,
            type: 'secondary'
        },
        {
            name: 'Create',
            onClick: create
        }
    ];

    return (
        <Popup onClose={onClose} name="Create Product"
                  buttons={buttons} width={750}>
            <div className="columns">
                <div>
                    <FileUpload label="Image" isMultiple={false} isImage={true} property="imageFile" sendValue={sendValue}
                        toggleLoading={toggleLoading} />
                </div>
                <div className="extra-column">
                    <Field label="Name" property="name" value={product.name} sendValue={sendValue} validationResult={validationResults.name} />
                    <div className="columns">
                        <Field label="Category" property="category" value={product.category} sendValue={sendValue} options={productCategories} width={200}
                            validationResult={validationResults.category} />
                        <Field label="Brand" property="brand" value={product.brand} sendValue={sendValue} options={productBrands} width={200}
                            validationResult={validationResults.brand} />
                    </div>
                    <Field label="Barcode" property="barcode" value={product.barcode} sendValue={sendValue} width={200}
                        validationResult={validationResults.barcode} />
                </div>
            </div>
        </Popup>
    );
}

export default CreateProductPopup;