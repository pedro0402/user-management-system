export function DashboardPage() {

    const userEmail = localStorage.getItem("email");
    const userRole = localStorage.getItem("role");

    return (
        <div>
            <h1>Bem vindo ao Dashboard!</h1>
            <p>voce esta logado como: {`${userEmail}`}</p>
            <p>role do usuário: {`${userRole}`}</p>
        </div>
    )

}