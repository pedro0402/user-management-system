import { Navigate } from 'react-router-dom';
import type React from "react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");

    if (token === null) {
        return <Navigate to='/login' replace />
    }

    return token ? children : <Navigate to="/login" />
}

export default PrivateRoute;