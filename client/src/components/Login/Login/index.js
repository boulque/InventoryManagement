import Field from '../../Common/Field';
import './index.css';
import React from 'react';
import { useNavigate } from 'react-router';
import Requests from '../../../requests.js';
import Message from '../../Common/Message';
import Loading from '../../Common/Loading';
import { users } from '../../../lists.js';

function Login({setTitle, setUser}) {
    const [isLoadingActive, setIsLoadingActive] = React.useState(false);
    const [userID, setUserID] = React.useState(1);
    const [isMessageOpen, setIsMessageOpen] = React.useState(false);
    const [messageText, setMessageText] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        setTitle('Login');
    }, []);

    const login = async () => {
        const response = await Requests.withLoading(
            async () => await Requests.request('/api/user/login?id=' + userID), 
            setIsLoadingActive
        );

        if (response.status === 400)
        {
            setMessageText('Invalid user id.');
            setIsMessageOpen(true);
            return;
        }

        if (!response.ok)
            return;

        const data = await response.json();
        
        setUser({
            id: data.id,
            name: data.name
        });
        navigate('/');
    };

    return (
        <>
            <div className="login">
                <Field label="Log in as" value={userID} sendValue={(_, value) => setUserID(value)} options={users} />
                <center>
                    <button className="button" onClick={login}>Log in</button>
                </center>
            </div>
            {isMessageOpen &&
                <Message message={messageText} onClose={() => setIsMessageOpen(false)} />}
            {isLoadingActive &&
                <Loading />}
        </>
    );
}

export default Login;