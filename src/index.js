const express = require("express");
const app = express()

const rotas = require("./rotas")


app.use(express.json());
app.use(rotas);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}!`);
});
