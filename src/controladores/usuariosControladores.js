const pool = require('../conexao')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const chaveSecreta = require('../senhaJwt');
const verificarLogin = require("../intermediarios/intermediarios");

const cadastrarUsuarios = async (req, res) => {

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "O campo nome, email e senha são obrigatorios" })
    }

    try {
        const validarEmail = await pool.query("SELECT * FROM usuarios WHERE email= $1 ", [email]);

        if (validarEmail.rowCount > 0) {
            return res.status(400).json({ message: "Esse e-mail já está em uso" })
        }

        const senhaHashed = await bcrypt.hash(senha, 10);

        const query = "INSERT INTO usuarios (nome,email,senha) VALUES ($1, $2,$3) RETURNING id, nome, email";

        const values = [nome, email, senhaHashed];

        const queryResultado = await pool.query(query, values);


        const novoUsuario = {
            id: queryResultado.rows[0].id,
            nome: queryResultado.rows[0].nome,
            email: queryResultado.rows[0].email
        }
        return res.status(201).json({ "mensagem": "Usuário cadastrado com sucesso!", usuario: novoUsuario });


    } catch (error) {
        return res.status(500).json({ error: error.message })
    }

};

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const { rows, rowCount } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (rowCount === 0) {
            return res.status(401).send({ message: "Autenticação falhou" })
        }

        const { senha: senhaUsuario, ...usuario } = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, senhaUsuario);

        if (!senhaCorreta) {
            return res.status(401).send({ message: "Autenticação falhou" })
        }

        const token = jwt.sign(
            { id: usuario.id },
            chaveSecreta,
            { expiresIn: "8h" }
        );
        return res.status(200).send({ usuario, token });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const detalharUsuario = async (req, res) => {
    try {
        const { senha, ...dadosDoUsuario } = req.usuario;
        return res.status(200).json(dadosDoUsuario);
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id: idUsuario } = req.usuario;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "O campo nome, email e senha são obrigatorios" })
    }

    try {

        const validarEmail = await pool.query("SELECT * FROM usuarios WHERE email= $1 AND id = $2 ", [email, idUsuario]);

        if (validarEmail.rowCount > 0) {
            return res.status(400).json({ message: "Esse e-mail já está em uso" })
        }

        const senhaHashed = await bcrypt.hash(senha, 10);

        const query = "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4 ";

        const values = [nome, email, senhaHashed, idUsuario];

        await pool.query(query, values);

        return res.status(204).send();


    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};



module.exports = {
    cadastrarUsuarios,
    loginUsuario,
    detalharUsuario,
    atualizarUsuario
};