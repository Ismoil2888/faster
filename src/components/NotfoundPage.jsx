import React from 'react';
import { Link } from "react-router-dom";
import SignUp from './auth/SignUp';


export function NotfoundPage() {
    return (
       <div>
        <h1>Страница не найдена</h1>
        <p>
            <Link to="/signup">вернуться домой</Link>
        </p>
       </div>
    )
}

export default NotfoundPage;