const pool = require('../conexao');

const verificarCamposObrigatorios = (req) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return { erro: "Todos os campos obrigatórios devem ser informados." };
    }

    return null;
}

const verificarPermissaoTransacao = async (transacaoId, usuarioId) => {
    const transacaoQuery = 'SELECT * FROM transacoes WHERE id = $1';
    const { rows: transacao } = await pool.query(transacaoQuery, [transacaoId]);

    if (transacao.length === 0) {
        return { erro: "Transação não encontrada." };
    }

    return null;
};

const verificarEncontrarTransacao = async (transacaoId, usuarioId) => {
    const transacaoQuery = 'SELECT * FROM transacoes WHERE id = $1';
    const { rows: transacao } = await pool.query(transacaoQuery, [transacaoId]);

    if (transacao[0].usuario_id !== usuarioId) {
        return { erro: "Você não tem permissão para acessar esta transação." };
    }

    return null;
};

const verificarTipoTransacao = (tipo) => {
    if (tipo !== "entrada" && tipo !== "saida") {
        return { erro: "O campo TIPO deve corresponder a uma das duas opções: ENTRADA/SAIDA" };
    }

    return null;
};

const verificarCategoria = async (categoriaId, pool) => {
    const categoriaQuery = 'SELECT * FROM categorias WHERE id = $1';
    const categoria = await pool.query(categoriaQuery, [categoriaId]);

    if (categoria.rowCount === 0) {
        return { erro: "Categoria não encontrada" };
    }

    return null;
};

const listarTransacoes = async (req, res) => {
    const { id: usuarioId } = req.usuario;
    const categoriaFiltradas = req.query.filtro || [];

    try {
        if (categoriaFiltradas.length === 0) {

            const query =
                `SELECT
        t.id AS Transacao_ID,
        t.tipo AS Tipo_Transacao,
        t.descricao AS Descricao_Transacao,
        t.valor AS Valor_Transacao,
        t.data AS Data_Transacao,
        t.usuario_id AS UsuarioID_Transacao,
        t.categoria_id AS Categoria_ID_Transacao,
        c.descricao AS Categoria_Nome
        FROM transacoes t
        JOIN categorias c ON t.categoria_id = c.id
        WHERE t.usuario_id = $1;
        `;
            const { rows } = await pool.query(query, [usuarioId]);

            if (rows.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(rows);

        } else {
            const query = `
            SELECT
                t.id,
                t.tipo,
                t.descricao,
                t.valor,
                t.data,
                t.usuario_id,
                t.categoria_id,
                c.descricao AS categoria_nome
            FROM
                transacoes t
            JOIN
                categorias c ON t.categoria_id = c.id
            WHERE
                t.usuario_id = $1
            AND c.descricao IN ($2,$3)
        `;

            const parametros = [usuarioId, ...categoriaFiltradas]
            const { rows: resultado } = await pool.query(query, parametros);
            return res.status(200).json(resultado);

        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const detalharTransacoesDoUsuario = async (req, res) => {
    const { id: transacaoId } = req.params;
    const { id: usuarioId } = req.usuario;

    try {
        const erroVerificarPermissaoTransacao = await verificarPermissaoTransacao(transacaoId, usuarioId);
        if (erroVerificarPermissaoTransacao) {
            return res.status(403).json({ mensagem: erroVerificarPermissaoTransacao.erro });
        }

        const erroVerificarEncontrarTransacao = await verificarEncontrarTransacao(transacaoId, usuarioId);
        if (erroVerificarEncontrarTransacao) {
            return res.status(404).json({ mensagem: erroVerificarEncontrarTransacao.erro });
        }

        const query =
            `SELECT
        t.id AS Transacao_ID,
        t.tipo AS Tipo_Transacao,
        t.descricao AS Descricao_Transacao,
        t.valor AS Valor_Transacao,
        t.data AS Data_Transacao,
        t.usuario_id AS UsuarioID_Transacao,
        t.categoria_id AS Categoria_ID_Transacao,
        c.descricao AS Categoria_Nome
        FROM transacoes t
        JOIN categorias c ON t.categoria_id = c.id
        WHERE t.id = $1 
        AND t.usuario_id = $2;`

        const { rows } = await pool.query(query, [transacaoId, usuarioId]);
        return res.status(200).json(rows[0]);

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const cadastrarTransacaoDoUsuario = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { id: usuarioId } = req.usuario;

    const erroCamposObrigatorios = verificarCamposObrigatorios(req);
    if (erroCamposObrigatorios) {
        return res.status(400).json({ mensagem: erroCamposObrigatorios.erro });
    }

    const erroCategoriaNaoEncontrada = await verificarCategoria(categoria_id, pool);
    if (erroCategoriaNaoEncontrada) {
        return res.status(404).json({ mensagem: erroCategoriaNaoEncontrada.erro });
    }

    const erroTipoInvalido = verificarTipoTransacao(tipo);
    if (erroTipoInvalido) {
        return res.status(400).json({ mensagem: erroTipoInvalido.erro });
    }

    try {
        const transacaoQuery = `
        INSERT INTO transacoes 
        (tipo, descricao, valor, data, categoria_id, usuario_id)
        VALUES 
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;

        const transacao = [tipo, descricao, valor, data, categoria_id, usuarioId];
        const { rows } = await pool.query(transacaoQuery, transacao);
        return res.status(201).json(rows[0]);

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const atualizarTransacaoDoUsuario = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { id: usuarioId } = req.usuario;
    const { id: transacaoId } = req.params;

    const erroCamposObrigatorios = verificarCamposObrigatorios(req);
    if (erroCamposObrigatorios) {
        return res.status(400).json({ mensagem: erroCamposObrigatorios.erro });
    }

    const erroCategoriaNaoEncontrada = await verificarCategoria(categoria_id, pool);
    if (erroCategoriaNaoEncontrada) {
        return res.status(404).json({ mensagem: erroCategoriaNaoEncontrada.erro });
    }

    const erroTipoInvalido = verificarTipoTransacao(tipo);
    if (erroTipoInvalido) {
        return res.status(400).json({ mensagem: erroTipoInvalido.erro });
    }

    try {
        const erroVerificarPermissaoTransacao = await verificarPermissaoTransacao(transacaoId, usuarioId);
        if (erroVerificarPermissaoTransacao) {
            return res.status(403).json({ mensagem: erroVerificarPermissaoTransacao.erro });
        }

        const erroVerificarEncontrarTransacao = await verificarEncontrarTransacao(transacaoId, usuarioId);
        if (erroVerificarEncontrarTransacao) {
            return res.status(404).json({ mensagem: erroVerificarEncontrarTransacao.erro });
        }

        const transacaoQuery = `
        UPDATE transacoes 
        SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5
        WHERE id = $6 AND usuario_id = $7
        RETURNING *
        `;

        const transacaoAtualizada = [descricao, valor, data, categoria_id, tipo, transacaoId, usuarioId];
        await pool.query(transacaoQuery, transacaoAtualizada);
        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

const excluirTransacaoDoUsuario = async (req, res) => {
    const { id: usuarioId } = req.usuario;
    const { id: transacaoId } = req.params;

    try {
        const erroVerificarPermissaoTransacao = await verificarPermissaoTransacao(transacaoId, usuarioId);
        if (erroVerificarPermissaoTransacao) {
            return res.status(403).json({ mensagem: erroVerificarPermissaoTransacao.erro });
        }

        const erroVerificarEncontrarTransacao = await verificarEncontrarTransacao(transacaoId, usuarioId);
        if (erroVerificarEncontrarTransacao) {
            return res.status(404).json({ mensagem: erroVerificarEncontrarTransacao.erro });
        }

        const transacaoQuery = `
        DELETE FROM transacoes   
        WHERE id = $1 AND usuario_id = $2
        `;

        const transacaoDeletada = [transacaoId, usuarioId];
        await pool.query(transacaoQuery, transacaoDeletada);
        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const obterExtratoTransacao = async (req, res) => {
    try {
        const { id } = req.usuario;
        const somaEntradas =
            "SELECT SUM(valor::numeric) AS soma_entrada FROM transacoes WHERE usuario_id=$1 AND tipo='entrada' ";

        const { rows: resultadoEntrada } = await pool.query(somaEntradas, [id]);

        const somaSaidas =
            "SELECT SUM(valor::numeric) AS soma_saida FROM transacoes WHERE usuario_id=$1 AND tipo= 'saida' ";

        const { rows: resultadoSaida } = await pool.query(somaSaidas, [id]);

        const somaEntrada = resultadoEntrada[0].soma_entrada || 0;
        const somaSaida = resultadoSaida[0].soma_saida || 0;

        const extratoFinal = {
            Entradas: somaEntrada,
            Saidas: somaSaida

        }
        return res.status(200).json(extratoFinal);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    listarTransacoes,
    detalharTransacoesDoUsuario,
    cadastrarTransacaoDoUsuario,
    atualizarTransacaoDoUsuario,
    excluirTransacaoDoUsuario,
    obterExtratoTransacao,
};