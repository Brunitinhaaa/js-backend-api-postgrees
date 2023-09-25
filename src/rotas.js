const express = require("express");
const router = express.Router();


const { cadastrarUsuarios,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
} = require("./controladores/usuariosControladores");

const { listarCategorias } = require("./controladores/categoriasControladores");

const {
    listarTransacoes,
    detalharTransacoesDoUsuario,
    cadastrarTransacaoDoUsuario,
    atualizarTransacaoDoUsuario,
    excluirTransacaoDoUsuario,
    obterExtratoTransacao,
} = require("./controladores/transacoesControladores");



const verificarLogin = require("./intermediarios/intermediarios");

router.post("/usuario", cadastrarUsuarios);
router.post("/login", loginUsuario);

router.use(verificarLogin);

router.get("/login", detalharUsuario);
router.put("/usuario", atualizarUsuario);
router.get("/categoria", listarCategorias);
router.get("/transacao", listarTransacoes);
router.get("/transacao/extrato", obterExtratoTransacao);
router.get("/transacao/:id", detalharTransacoesDoUsuario);
router.post("/transacao", cadastrarTransacaoDoUsuario);
router.put("/transacao/:id", atualizarTransacaoDoUsuario);
router.delete("/transacao/:id", excluirTransacaoDoUsuario);




module.exports = router;
