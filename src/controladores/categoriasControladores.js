const pool = require('../conexao');

const listarCategorias = async (req, res) => {
    try {
        const query = 'SELECT * FROM categorias';
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Nenhuma categoria encontrada' });
        }

        res.status(200).json(rows);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarCategorias,
};