import React from 'react';
import Popup from '../../Common/Popup';
import Field from '../../Common/Field';
import { warehouseTypes } from '../../../lists.js';
import Requests from '../../../requests.js';

function CreateWarehousePopup({onClose, callback, toggleLoading}) {
    const defaultValidationResults = {
        name: {isValid: true, error: ''},
        type: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);

    const [warehouse, setWarehouse] = React.useState({
        name: '',
        address: '',
        type: null
    });

    const sendValue = (property, val) => {
        setWarehouse(prev => ({...prev, [property]: val}));
    };

    const validate = () => {
        let isValid = true;

        if (!warehouse.name.trim()) {
            setValidationResults(prev => ({...prev, name: {isValid: false, error: 'Warehouse name must not be empty'}}));
            isValid = false;
        }
        if (warehouse.type === null) {
            setValidationResults(prev => ({...prev, type: {isValid: false, error: 'Warehouse type must not be empty'}}));
            isValid = false;
        }

        return isValid;
    };

    const create = async () => {
        setValidationResults(defaultValidationResults);

        if (!validate())
            return;

        const data = new FormData();

        data.append('name', warehouse.name.trim());
        data.append('address', warehouse.address.trim());
        data.append('type', parseInt(warehouse.type));

        const response = await Requests.withLoading(
            async () => await Requests.request('/api/warehouses', {
                method: 'POST',
                body: data
            }),
            toggleLoading
        );

        if (!response.ok)
            return;

        onClose();

        if (callback) {
            await Requests.withLoading(
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
        <Popup onClose={onClose} name="Create Warehouse"
            buttons={buttons} width={600}>
            <Field label="Name" property="name" value={warehouse.name} sendValue={sendValue}
                validationResult={validationResults.name} />
            <Field label="Address" property="address" value={warehouse.address} sendValue={sendValue} />
            <Field label="Type" property="type" value={warehouse.type} sendValue={sendValue} options={warehouseTypes} width={200}
                validationResult={validationResults.type} />
        </Popup>
    );
}

export default CreateWarehousePopup;