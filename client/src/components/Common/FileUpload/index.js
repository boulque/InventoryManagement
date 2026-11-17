import React from 'react';
import './index.css';
import Requests from '../../../requests.js';

function FileUpload({label, folderGUID, isMultiple = true, isImage = false, property, sendValue, toggleLoading}) {
    const inputRef = React.useRef(null);
    const objectUrlRef = React.useRef(null);
    const filesRef = React.useRef(null);
    const [imageUrl, setImageUrl] = React.useState(null);
    const [canDownload, setCanDownload] = React.useState(!!folderGUID);

    const onUpload = (e) => {
        if (isImage) {
            const file = e.target.files[0];
            
            if (file) {
                objectUrlRef.current = URL.createObjectURL(file);
                setImageUrl(objectUrlRef.current);
            }
        }

        sendValue(property, e.target.files);
        setCanDownload(false);
    };

    const getFiles = async () => {
        if (!folderGUID) {
            setImageUrl(null);
            return;
        }

        const response = await Requests.withLoading(
            async () => await Requests.request(`/api/files/${folderGUID}`), 
            toggleLoading
        );
        
        if (!response.ok)
            return;
        
        filesRef.current = await response.json();
        
        if (isImage)
            setImageUrl(filesRef.current[0].url);
    };

    React.useEffect(() => {
        getFiles();
    }, []);

    const clear = (e) => {
        inputRef.current.value = '';
        setImageUrl(null);
        sendValue('imageFile', null);
        e.stopPropagation();
    };

    const download = (e) => {
        window.open(filesRef.current[0].url).focus();
        e.stopPropagation();
    };

    return (
        <div className="field upload-field">
            <div className="field-label">{label}:</div>
            <input type="file" ref={inputRef} accept={isImage ? 'image/*' : null} style={{display: 'none'}}
                multiple={isMultiple === true ? '' : null} onChange={onUpload} />
            <div className="upload-field-zone" onClick={() => inputRef.current.click()}>
                <div className="upload-placeholder" style={{display: imageUrl ? 'none' : 'block'}}>
                    <div className="upload-icon" />
                    <span>Upload file(s)</span>
                </div>
                <img src={imageUrl} style={{display: imageUrl ? 'block' : 'none'}} alt="Image"
                    onLoad={() => URL.revokeObjectURL(objectUrlRef.current)} />
                {isImage &&
                    <div className="file-tools" style={{display: imageUrl ? 'flex' : 'none'}}>
                        {canDownload &&
                            <div className="icon icon-download" title="Download" onClick={download} />}
                        <div className="icon icon-close" title="Clear image" onClick={clear} />
                    </div>}
            </div>
        </div>
    );
}

export default FileUpload