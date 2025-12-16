import request from 'supertest'
import { app } from '../app'

describe("Healthcheck endpoint", () => {
    it("responde status 200 e corpo correto", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});
