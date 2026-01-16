import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { sleep, validateName } from "../services/utils";

type JwtPayload = {
    id: string;
    email: string;
    role: string;
    exp?: number;
};

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
};

const API_URL = "http://localhost:3333";

export function ProfilePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const userId = useMemo(() => {
        if (!token) return null;
        try {
            const payload = jwtDecode<JwtPayload>(token);
            return payload.id;
        } catch {
            return null;
        }
    }, [token]);

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    // Campos editáveis
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function forceLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
    }

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setError(null);

            if (!token || !userId) {
                forceLogout();
                return;
            }

            try {
                const res = await fetch(`${API_URL}/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    forceLogout();
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Falha ao carregar perfil (HTTP ${res.status})`);
                }

                const data: User = await res.json();
                setUser(data);
                setName(data.name ?? "");
                setAvatarUrl(data.avatarUrl ?? "");
            } catch (e) {
                setError(e instanceof Error ? e.message : "Erro desconhecido");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, userId]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const error = validateName(name);
        if (error) {
            setNameError(error);
            return;
        }

        if (isSaving) return;

        setIsSaving(true);

        if (!token || !userId) {
            forceLogout();
            return;
        }

        try {
            await sleep(1000);
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
                }),
            });

            if (res.status === 401 || res.status === 403) {
                forceLogout();
                return;
            }

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `Falha ao salvar (HTTP ${res.status})`);
            }

            const updated: User = await res.json();
            setUser(updated);
            setSuccess("Perfil atualizado com sucesso.");
            setTimeout(() => {
                setSuccess("");
            }, 1000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao salvar");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAccount() {
        setError(null);
        setSuccess(null);

        if (!token || !userId) {
            forceLogout();
            return;
        }

        const ok = window.confirm(
            "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
        );
        if (!ok) return;

        try {
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401 || res.status === 403) {
                forceLogout();
                return;
            }

            if (!res.ok) {
                throw new Error(`Falha ao excluir conta (HTTP ${res.status})`);
            }

            // Excluiu com sucesso: encerra sessão
            forceLogout();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao excluir conta");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-600">Carregando perfil...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="rounded border bg-white p-6">
                    <p className="mb-3 text-sm text-gray-700">
                        Não foi possível carregar seu perfil.
                    </p>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <button
                        onClick={() => navigate("/", { replace: true })}
                        className="mt-4 rounded bg-gray-900 px-3 py-2 text-sm text-white"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Meu Perfil</h1>
                        <p className="text-sm text-gray-600">
                            {user.email}{" "}
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                                {user.role}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/", { replace: true })}
                        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Voltar
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8">
                <form onSubmit={handleSave} className="rounded-lg border bg-white p-6">
                    <h2 className="text-lg font-semibold mb-4">Dados do perfil</h2>

                    <div className="grid gap-4">
                        <label className="grid gap-1">
                            <span className="text-sm font-medium text-gray-700">Nome</span>
                            <input
                                className={`rounded border px-3 py-2 text-sm ${nameError ? "border-red-500" : ""}`}
                                value={name}
                                onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
                                onBlur={(e) => setNameError(validateName(e.target.value))}
                            />
                            {nameError && (
                                <p className="text-sm text-red-600 mt-1">{nameError}</p>
                            )}
                        </label>

                        <label className="grid gap-1">
                            <span className="text-sm font-medium text-gray-700">Avatar URL</span>
                            <input
                                className="rounded border px-3 py-2 text-sm"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </label>

                        <label className="grid gap-1">
                            <span className="text-sm font-medium text-gray-700">Email</span>
                            <input
                                className="rounded border px-3 py-2 text-sm bg-gray-50"
                                value={user.email}
                                disabled
                            />
                        </label>
                    </div>

                    {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
                    {success ? <p className="mt-4 text-sm text-green-700">{success}</p> : null}

                    <div className="mt-6 flex items-center gap-3">
                        <button
                            type="submit"
                            className={`rounded px-4 py-2 text-sm text-white
                                ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 hover:bg-gray-800'
                                }`}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Salvar'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                            Excluir conta
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        <div>ID: {user.id}</div>
                        <div>Criado em: {new Date(user.createdAt).toLocaleString()}</div>
                        <div>Atualizado em: {new Date(user.updatedAt).toLocaleString()}</div>
                    </div>
                </form>
            </main>
        </div>
    );
}