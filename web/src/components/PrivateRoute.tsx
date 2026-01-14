import { Navigate } from 'react-router-dom';
import type React from "react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to='/login' replace />
    }

    return <>{children}</>
}

export default PrivateRoute;