import { Navigate } from 'react-router-dom';
import type React from "react";

function PublicRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to='/' replace />
    }

    return <>{children}</>
}

export default PublicRoute;