import { useState } from "react";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <form onSubmit={e => {
            e.preventDefault() // não recarrega a página
            onSubmit(email, password)
        }}>
            <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                required
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Entrar</button>
        </form>
    )
}