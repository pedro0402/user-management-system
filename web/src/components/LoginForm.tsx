import { useState } from "react";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm" onSubmit={e => {
            e.preventDefault() // não recarrega a página
            onSubmit(email, password)
        }}>
            <input
                type="email"
                value={email}
                className="border w-full p-2 rounded mb-3"
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                value={password}
                className="border w-full p-2 rounded mb-3"
                
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                required
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button className="w-full bg-blue-600 text-white p-2 rounded" type="submit">Entrar</button>
        </form>
    )
}