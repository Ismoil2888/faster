import React from 'react';
import { Link } from "react-router-dom";
import SignUp from './auth/SignUp';


export function NotfoundPage() {
    return (
    <div className='notfoundpagebody'>
       <div className='notfoundpage'>
        <h1>Страница не найдена</h1>
        <p>
            <Link className='homeback' to="/signup">вернуться домой</Link>
        </p>
       </div>
    </div>
    )
}

export default NotfoundPage;