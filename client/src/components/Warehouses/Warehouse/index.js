import Field from '../../Common/Field';
import Toolbar from '../../Common/Toolbar';
import React from 'react';
import { warehouseTypes } from '../../../lists.js';

function Warehouse({warehouse, setWarehouse, reload, toggleLoading}) {
    const defaultValidationResults = {
        name: {isValid: true, error: ''},
        type: {isValid: true, error: ''}
    };
    const [validationResults, setValidationResults] = React.useState(defaultValidationResults);
    const [warehouseDraft, setWarehouseDraft] = React.useState({...warehouse});

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

    const sendValue = (property, val) => {
        setWarehouseDraft(prev => ({
            ...prev, 
            [property]: val
        }));
    };

    const save = async () => {
        setValidationResults(defaultValidationResults);
        if (!validate())
            return;

        toggleLoading(true);
        const data = new FormData();

        data.append('id', warehouseDraft.id);
        data.append('name', warehouseDraft.name.trim());
        data.append('address', warehouseDraft.address.trim());
        data.append('type', parseInt(warehouseDraft.type));

        const response = await fetch('/api/warehouses', {
            method: 'PUT',
            body: data
        });

        if (!response.ok)
        {
            toggleLoading(false);
            throw new Error(await response.text());
        }

        await reload();
        setWarehouse(warehouseDraft);
        toggleLoading(false);
    };

    const toolbarButtons = [
        {
            name: 'Save',
            onClick: save,
            icon: 'save'
        }
    ];
    
    return <>
        <div className="title">{warehouse.name}</div>
        <Toolbar buttons={toolbarButtons} />
        <div className="details" style={{width: 500}}>
            <Field label="Name" property="name" value={warehouseDraft.name} sendValue={sendValue}
                validationResult={validationResults.name} />
            <Field label="Address" property="address" value={warehouseDraft.address} sendValue={sendValue} />
            <Field label="Type" property="type" value={warehouseDraft.type} sendValue={sendValue} options={warehouseTypes} width={200}
                validationResult={validationResults.type} />
        </div>
    </>;
}

export default Warehouse;