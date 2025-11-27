import express from 'express'

const app = express();
const PORT = 3333;

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({message: 'hello world. servidor rodando'})
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))