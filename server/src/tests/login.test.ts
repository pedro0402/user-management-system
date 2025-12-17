import request from 'supertest'
import { app } from '../app'
import { email } from 'zod';

describe("autenticacao em rotas protegidas", () => {
    let token: string = "";

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/auth/login')
            .send({ email: 'adminteste@teste.com', password: '12345678' });
        token = loginRes.body.token;
    });

    it('deve negar acesso à rota protegida sem jwt', async () => {
        const res = await request(app).get('/users');
        expect(res.status).toBe(401);
    })

    it('deve permitir acesso com jwt válido', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', 'Bearer ' + token)
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true)
    })
})

describe('POST /auth/login', () => {
    it('deve retornar 401 quando as credencias forem inválidas', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'emailinvalido@teste.com',
                password: '12345678'
            })
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error')
    })

    it('deve retornar token ao logar com sucesso ', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'adminteste@teste.com',
                password: '12345678'
            })
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    })
})

describe('Permissão de acesso ao GET /users', () => {
    let adminToken: string = "";
    let userToken: string = "";
    beforeAll(async () => {
        const adminRes = await request(app)
            .post('/auth/login')
            .send({
                email: 'adminteste@teste.com',
                password: '12345678'
            })
        adminToken = adminRes.body.token;

        const userRes = await request(app)
            .post('/auth/login')
            .send({
                email: 'pedro@teste.com',
                password: 'ph040204'
            })
        userToken = userRes.body.token;
        expect(adminToken).toBeTruthy();
        expect(userToken).toBeTruthy();
    });

    it('deve PERMITIR ao ADMIN listar todos os usuários', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', 'Bearer ' + adminToken);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true)
    })

    it('deve NEGAR ao USER comum listar todos os usuários', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', 'Bearer ' + userToken);
        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
    })

    it('deve NEGAR acesso sem token', async () => {
        const res = await request(app)
            .get('/users');
        expect(res.status).toBe(401);
    })
})