import React from 'react';
import Requests from '../requests.js';

export function useEntityList({ setTitle, title, url, entityName, checkDelete }) {
    const [isCreatePopupOpen, setIsCreatePopupOpen] = React.useState(false);
    const [isLoadingActive, setIsLoadingActive] = React.useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [items, setItems] = React.useState(null);
    const [item, setItem] = React.useState(null);
    const [selectedID, setSelectedID] = React.useState(0);
    const [deleteID, setDeleteID] = React.useState(0);
    const [confirmText, setConfirmText] = React.useState('');
    const [isMessageOpen, setIsMessageOpen] = React.useState(false);
    const [messageText, setMessageText] = React.useState('');

    const load = async (query) => {
        const response = await Requests.withLoading(
            async () => await Requests.request(url + (query ?? '')),
            setIsLoadingActive
        );
        if (!response.ok)
            return;
        
        setItems(await response.json());
    };

    React.useEffect(() => {
        setTitle(title);
        load();
    }, []);

    const onSelect = async (id) => {
        if (!id) {
            setItem(null);
            return;
        }

        await Requests.withLoading(async () => {
            const response = await Requests.request(`${url}/${id}`);
            
            if (!response.ok)
                return;
            
            setItem(await response.json());
        }, setIsLoadingActive);
    };

    const confirmDelete = async (id) => {
        if (checkDelete) {
            const reason = await Requests.withLoading(() => checkDelete(id), setIsLoadingActive);

            if (reason) {
                openMessage(reason);
                return;
            }
        }

        const name = items.find(i => i.id === id).name;
        setDeleteID(id);
        setConfirmText(`Are you sure you want to delete ${entityName} '${name}'?`);
        setIsConfirmOpen(true);
    };

    const deleteItem = () => Requests.withLoading(async () => {
        await Requests.request(`${url}/${deleteID}`, { method: 'DELETE' });

        if (deleteID === selectedID) {
            setSelectedID(0);
            setItem(null);
        }

        await load();
    }, setIsLoadingActive);

    const createCallback = async (id) => {
        await load();
        setSelectedID(id);
    };

    const openMessage = (text) => {
        setMessageText(text);
        setIsMessageOpen(true);
    };

    return {
        items, item, setItem,
        selectedID, setSelectedID,
        isLoadingActive, toggleLoading: setIsLoadingActive,
        isCreatePopupOpen,
        openCreatePopup: () => setIsCreatePopupOpen(true),
        closeCreatePopup: () => setIsCreatePopupOpen(false),
        isConfirmOpen,
        closeConfirm: () => setIsConfirmOpen(false),
        confirmText,
        isMessageOpen,
        closeMessage: () => setIsMessageOpen(false),
        messageText,
        load, onSelect, confirmDelete, deleteItem, createCallback
    };
}