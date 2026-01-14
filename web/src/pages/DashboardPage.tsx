import { replace, useNavigate } from "react-router-dom";


export function DashboardPage() {

    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate('/login', { replace: true })
    }

    const userEmail = localStorage.getItem("email");
    const userRole = localStorage.getItem("role");

    const isAdmin = userRole === "admin";

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">User Management System</h1>
                        <p className="text-sm text-grat-600">
                            Logado como: <span className="font-medium">{userEmail ?? "-"}</span>
                            {userRole ? (
                                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-900">{userRole}</span>
                            ) : null}
                        </p>
                    </div>
                    <button onClick={handleLogout}
                        className="rounded-md bg-gray-900 px-3 py-2 text.sm text-white hover:bg-gray-800"
                    >Sair</button>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
                <h2 className="text-lg font-semibold mb-4">Ações rápidas</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <button
                        onClick={() => navigate('/profile')}
                        className="rounded-lg border bg-white p-4 text-left hover:bg-gray-200"
                    >
                        <div className="font-semibold">Meu perfil</div>
                        <div className="text-sm text-gray-600">Ver e editar informações</div>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/users')}
                            className="rounded-lg border bg-white p-4 text-left hover:bg-gray-200"
                        >
                            <div className="font-semibold">Usuários</div>
                            <div className="text-sm text-gray-600">Gerenciar usuários do sistema (admin)</div>
                        </button>
                    )}
                </div>
            </main>
        </div>
    )

}