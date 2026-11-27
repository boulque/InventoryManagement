import React from 'react';
import Field from '../../Common/Field';
import './index.css';
import Requests from '../../../requests';
import SelectMovementPopup from '../SelectMovementPopup';
import MovementDigest from '../MovementDigest';
import MovementPopup from '../MovementPopup';

function Chat({messages, setMessages, formatDate, toggleLoading}) {
    const [message, setMessage] = React.useState('');
    const [stockMovementID, setStockMovementID] = React.useState(null);
    const [isSelectMovementPopupOpen, setIsSelectMovementPopupOpen] = React.useState(false);
    const [isMovementPopupActive, setIsMovementPopupActive] = React.useState(false);
    const [viewStockMovementID, setViewStockMovementID] = React.useState(null);
    const [stockMovement, setStockMovement] = React.useState(null);
    const messagesRef = React.useRef(null);

    const loadMessages = async () => {
        const response = await Requests.request('/api/messages');
                    
        if (!response.ok)
            return;

        const data = await response.json();

        for (let i = 0; i < data.length; i++) {
            data[i].date = new Date(data[i].createdAt);
            if (data[i].stockMovement)
                data[i].stockMovement.date = new Date(data[i].stockMovement.createdAt);
        }

        setMessages(data.sort((m1, m2) => m1.id - m2.id));
    };

    React.useLayoutEffect(() => {
        if (messages !== null && messagesRef.current)
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages]);

    React.useEffect(() => {
        if (!messages)
            loadMessages();

        const loadInterval = setInterval(loadMessages, 20000);

        return () => clearInterval(loadInterval);
    }, []);

    React.useEffect(() => {
        const loadMovement = async () => {
            const response = await Requests.withLoading(
                async () => await Requests.request(`/api/stockmovements/${stockMovementID}`),
                toggleLoading
            );

            if (!response.ok)
                return;
            
            const data = await response.json();
            data.date = new Date(data.createdAt);

            setStockMovement(data);
        };

        if (stockMovementID !== null)
            loadMovement();
        else
            setStockMovement(null);
    }, [stockMovementID]);

    const send = async () => {
        const response = await Requests.withLoading(
            async () => await Requests.request('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    text: message.trim(),
                    stockMovementID: stockMovementID
                })
            }),
            toggleLoading
        );

        if (!response.ok)
            return;

        setMessage('');
        setStockMovementID(null);
        await Requests.withLoading(loadMessages, toggleLoading);
    }

    const onKeyDown = (e) => {
        if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault();

            if (!message.trim()) {
                setMessage('');
                return;
            }

            send();
        }
    };

    const viewMovement = (id) => {
        setViewStockMovementID(id);
        setIsMovementPopupActive(true);
    };

    return (
        <>
            <div className="chat">
                <div ref={messagesRef} className="messages">
                    {messages ? 
                        messages.map(m =>
                            <div key={m.id} className="message">
                                <span className="message-date">{formatDate(m.date)}</span>
                                <span className="message-author">{m.userName}</span>
                                {m.stockMovement &&
                                    <MovementDigest stockMovement={m.stockMovement} style={{marginRight: 10, cursor: 'pointer'}}
                                        onClick={() => viewMovement(m.stockMovement.id)} />}
                                <span className="message-text">{m.text}</span>
                            </div>
                        ) : Array(5).keys().map(_ =>
                            <div className="item-placeholder" />
                        )}
                </div>
                <div className="field-area">
                    <Field value={message} sendValue={(_, value) => setMessage(value)} placeholder="Press Enter to send"
                        isTextArea={true} onKeyDown={onKeyDown} />
                    <div className="columns">
                        <button className="button-link has-icon icon-add" onClick={() => setIsSelectMovementPopupOpen(true)}>Link movement</button>
                        {stockMovement &&
                            <MovementDigest stockMovement={stockMovement} onClear={() => setStockMovementID(null)}
                                style={{marginLeft: 15, marginTop: 2}} />}
                    </div>
                </div>
            </div>
            {isSelectMovementPopupOpen &&
                <SelectMovementPopup onClose={() => setIsSelectMovementPopupOpen(false)} onSelect={id => setStockMovementID(id)} 
                    formatDate={formatDate} toggleLoading={toggleLoading} />}
            {isMovementPopupActive &&
                <MovementPopup stockMovementID={viewStockMovementID} onClose={() => setIsMovementPopupActive(false)}
                    formatDate={formatDate} toggleLoading={toggleLoading} />}
        </>
    );
}

export default Chat;