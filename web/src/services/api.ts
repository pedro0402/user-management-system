export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3333/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}