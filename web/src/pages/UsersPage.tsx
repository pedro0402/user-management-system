import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  items: User[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

const API_URL = "http://localhost:3000";

export function UsersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const isAdmin = role === "admin";

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<UsersResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form de criação
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  // Edição rápida
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingId) ?? null,
    [users, editingId]
  );

  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  function forceLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  }

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    if (!token) {
      forceLogout();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`Falha ao listar usuários (HTTP ${res.status})`);
      }

      const data: UsersResponse = await res.json();
      setUsers(Array.isArray(data.items) ? data.items : []);
      setMeta(data.meta ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!editingUser) return;
    setEditName(editingUser.name ?? "");
    setEditRole(editingUser.role);
    setEditAvatarUrl(editingUser.avatarUrl ?? "");
  }, [editingUser]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      forceLogout();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          avatarUrl: newAvatarUrl.trim() === "" ? null : newAvatarUrl.trim(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao criar usuário (HTTP ${res.status})`);
      }

      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setNewAvatarUrl("");

      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar usuário");
    }
  }

  async function handleSaveEdit() {
    setError(null);

    if (!token || !editingId) return;

    try {
      const res = await fetch(`${API_URL}/users/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          avatarUrl: editAvatarUrl.trim() === "" ? null : editAvatarUrl.trim(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        forceLogout();
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Falha ao atualizar (HTTP ${res.status})`);
      }

      setEditingId(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar usuário");
    }
  }

  async function handleDeleteUser(id: string) {
    setError(null);

    if (!token) {
      forceLogout();
      return;
    }

    const ok = window.confirm("Excluir este usuário?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
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
        throw new Error(`Falha ao excluir (HTTP ${res.status})`);
      }

      if (editingId === id) setEditingId(null);

      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir usuário");
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Gerenciar Usuários</h1>
            <p className="text-sm text-gray-600">
              Total: {meta?.total ?? users.length} • Página: {meta?.page ?? 1}
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

      <main className="mx-auto max-w-5xl px-4 py-8 grid gap-6">
        <form onSubmit={handleCreateUser} className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Criar usuário</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Nome</span>
              <input
                className="rounded border px-3 py-2 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                className="rounded border px-3 py-2 text-sm"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Senha</span>
              <input
                className="rounded border px-3 py-2 text-sm"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <select
                className="rounded border px-3 py-2 text-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">
                Avatar URL (opcional)
              </span>
              <input
                className="rounded border px-3 py-2 text-sm"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="mt-5 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Criar
          </button>
        </form>

        <section className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Usuários</h2>
            <button
              onClick={fetchUsers}
              className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Recarregar
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Carregando...</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                      <td className="py-2 pr-4 flex gap-2">
                        <button
                          onClick={() => setEditingId(u.id)}
                          className="rounded border px-2 py-1 hover:bg-gray-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">Nenhum usuário encontrado.</p>
              ) : null}
            </div>
          )}
        </section>

        {editingUser && (
          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Editar usuário</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-700">Nome</span>
                <input
                  className="rounded border px-3 py-2 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-700">Role</span>
                <select
                  className="rounded border px-3 py-2 text-sm"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "user")}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              <label className="grid gap-1 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Avatar URL</span>
                <input
                  className="rounded border px-3 py-2 text-sm"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}