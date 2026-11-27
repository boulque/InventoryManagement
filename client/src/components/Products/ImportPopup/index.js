import Popup from '../../Common/Popup';
import Field from '../../Common/Field';
import React from 'react';
import Requests from '../../../requests';

function ImportPopup({onClose, callback, toggleLoading}) {
    const [xml, setXml] = React.useState('');

    const importProducts = async () => {
        const response = await Requests.withLoading(
            async () => await Requests.request('/api/products/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ xml: xml })
            }),
            toggleLoading
        );

        if (!response.ok)
            return;

        onClose();
        await Requests.withLoading(callback, toggleLoading);
    };

    const buttons = [
        {
            name: 'Cancel',
            onClick: onClose,
            type: 'secondary'
        },
        {
            name: 'Import',
            onClick: importProducts
        }
    ];

    return (
        <Popup onClose={onClose} name="Import Products" buttons={buttons} width={750}>
            <Field placeholder="Paste XML here..." sendValue={(_, value) => setXml(value)} isTextArea={true} height={300} />
        </Popup>
    );
}

export default ImportPopup;