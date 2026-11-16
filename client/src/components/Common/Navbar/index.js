import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import './index.css'
import Dropdown from '../Dropdown';
import Requests from '../../../requests.js';

function Navbar({title, user, setUser, pages}) {
    const navRef = React.useRef(null);
    const pageRef = React.useRef(null);
    const [isNavOpen, setIsNavOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const onSelect = (url) => {
        navigate(url);
    };

    React.useEffect(() => {
        const initUser = async () => {
            if (location.pathname !== '/login' && !user) {
                const response = await Requests.request('/api/user/current');

                if (!response.ok)
                    return;

                const data = await response.json();
                
                if (data !== null) {
                    setUser({
                        id: data.id,
                        name: data.name
                    });
                }
            }
        };

        initUser();
    }, [user]);

    const signOut = async () => {
        const response = await Requests.request('/api/user/logout');

        if (!response.ok)
            return;

        setUser(null);
        navigate('/login');
    };

    return (
        <div className="navbar">
            <div className="navbar-title">Inventory Management</div>
            {title !== 'Login' &&
                <div ref={navRef} className="navbar-nav" onMouseEnter={() => setIsNavOpen(true)} onMouseLeave={() => setIsNavOpen(false)}>
                    <div ref={pageRef} className="navbar-page" style={{width: 200}}>{title}</div>
                    {isNavOpen &&
                        <Dropdown refElement={pageRef.current} ignoreRef={navRef} options={pages} 
                            closeDropdown={() => setIsNavOpen(false)} onSelect={onSelect} />}
                </div>}
            {title !== 'Login' && user &&
                <div className="navbar-user">
                    <span>{user.name}</span>
                    <div className="navbar-sign-out icon icon-sign-out" title="Sign Out" onClick={signOut} />
                </div>}
        </div>
    );
}

export default Navbar;