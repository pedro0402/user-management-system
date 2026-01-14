import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { login } from "../services/api";

export function LoginPage() {
    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false)

    async function handleLogin(email: string, password: string) {
        setError(undefined);
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.user.email)
                localStorage.setItem('role', data.user.role)
                window.location.href = '/'
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError('erro ao se conectar com o servidor')
        }
        setLoading(false);
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm p-6">
                <h2 className="text-center text-2xl font-bold mb-6 ">Login</h2>
                <LoginForm error={error} onSubmit={handleLogin} />
                {loading && <span>Carregando...</span>}
            </div>
        </div>
    );

}