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
                window.location.href = '/'
            } else {
                setError(data.error || 'email ou senha inválidos');
            }
        } catch (e) {
            setError('erro ao se conectar com o servidor')
        }
        setLoading(false);
    }
    return (
        <div>
            <h2>Login</h2>
            <LoginForm error={error} onSubmit={handleLogin} />
            {loading && <span>Carregando...</span>}
        </div>
    );

}