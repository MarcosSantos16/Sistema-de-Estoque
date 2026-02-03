const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'estoque_db'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Rotas da API

// Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    const query = 'SELECT * FROM PRODUTOS ORDER BY nome';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// Buscar produto por ID
app.get('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM PRODUTOS WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        res.json(results[0]);
    });
});

// Cadastrar novo produto
app.post('/api/produtos', (req, res) => {
    const { nome, descricao, preco_custo, preco_venda, quantidade_estoque, categoria } = req.body;
    
    if (!nome || !descricao || !preco_custo || !preco_venda || quantidade_estoque === undefined || !categoria) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }

    const query = 'INSERT INTO PRODUTOS (nome, descricao, preco_custo, preco_venda, quantidade_estoque, categoria) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nome, descricao, preco_custo, preco_venda, quantidade_estoque, categoria], (err, results) => {
        if (err) {
            console.error('Erro ao cadastrar produto:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.status(201).json({ 
            message: 'Produto cadastrado com sucesso',
            id: results.insertId 
        });
    });
});

// Atualizar produto
app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco_custo, preco_venda, quantidade_estoque, categoria } = req.body;
    
    if (!nome || !descricao || !preco_custo || !preco_venda || quantidade_estoque === undefined || !categoria) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }

    const query = 'UPDATE PRODUTOS SET nome = ?, descricao = ?, preco_custo = ?, preco_venda = ?, quantidade_estoque = ?, categoria = ? WHERE id = ?';
    db.query(query, [nome, descricao, preco_custo, preco_venda, quantidade_estoque, categoria, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        res.json({ message: 'Produto atualizado com sucesso' });
    });
});

// Excluir produto
app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    
    // Primeiro, verificar se existem movimentações para este produto
    const checkQuery = 'SELECT COUNT(*) as count FROM MOVIMENTACOES WHERE id_produto = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Erro ao verificar movimentações:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        
        if (results[0].count > 0) {
            res.status(400).json({ error: 'Não é possível excluir produto com movimentações registradas' });
            return;
        }
        
        // Se não há movimentações, pode excluir o produto
        const deleteQuery = 'DELETE FROM PRODUTOS WHERE id = ?';
        db.query(deleteQuery, [id], (err, results) => {
            if (err) {
                console.error('Erro ao excluir produto:', err);
                res.status(500).json({ error: 'Erro interno do servidor' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Produto não encontrado' });
                return;
            }
            res.json({ message: 'Produto excluído com sucesso' });
        });
    });
});

// Registrar movimentação de estoque
app.post('/api/movimentacoes', (req, res) => {
    const { id_produto, tipo_movimentacao, quantidade } = req.body;
    
    if (!id_produto || !tipo_movimentacao || !quantidade) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }
    
    if (tipo_movimentacao !== 'entrada' && tipo_movimentacao !== 'saida') {
        res.status(400).json({ error: 'Tipo de movimentação deve ser "entrada" ou "saida"' });
        return;
    }

    // Primeiro, buscar o produto atual
    const selectQuery = 'SELECT quantidade_estoque FROM PRODUTOS WHERE id = ?';
    db.query(selectQuery, [id_produto], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        
        const estoqueAtual = results[0].quantidade_estoque;
        let novoEstoque;
        
        if (tipo_movimentacao === 'entrada') {
            novoEstoque = estoqueAtual + parseInt(quantidade);
        } else {
            novoEstoque = estoqueAtual - parseInt(quantidade);
            if (novoEstoque < 0) {
                res.status(400).json({ error: 'Estoque insuficiente para esta saída' });
                return;
            }
        }
        
        // Iniciar transação
        db.beginTransaction((err) => {
            if (err) {
                console.error('Erro ao iniciar transação:', err);
                res.status(500).json({ error: 'Erro interno do servidor' });
                return;
            }
            
            // Inserir movimentação
            const insertQuery = 'INSERT INTO MOVIMENTACOES (id_produto, tipo_movimentacao, quantidade) VALUES (?, ?, ?)';
            db.query(insertQuery, [id_produto, tipo_movimentacao, quantidade], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Erro ao registrar movimentação:', err);
                        res.status(500).json({ error: 'Erro interno do servidor' });
                    });
                }
                
                // Atualizar estoque do produto
                const updateQuery = 'UPDATE PRODUTOS SET quantidade_estoque = ? WHERE id = ?';
                db.query(updateQuery, [novoEstoque, id_produto], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Erro ao atualizar estoque:', err);
                            res.status(500).json({ error: 'Erro interno do servidor' });
                        });
                    }
                    
                    // Confirmar transação
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Erro ao confirmar transação:', err);
                                res.status(500).json({ error: 'Erro interno do servidor' });
                            });
                        }
                        
                        res.status(201).json({ 
                            message: 'Movimentação registrada com sucesso',
                            novo_estoque: novoEstoque
                        });
                    });
                });
            });
        });
    });
});

// Listar movimentações
app.get('/api/movimentacoes', (req, res) => {
    const query = `
        SELECT m.*, p.nome as produto_nome 
        FROM MOVIMENTACOES m 
        JOIN PRODUTOS p ON m.id_produto = p.id 
        ORDER BY m.data_movimentacao DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar movimentações:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// Filtrar produtos por categoria
app.get('/api/produtos/categoria/:categoria', (req, res) => {
    const { categoria } = req.params;
    const query = 'SELECT * FROM PRODUTOS WHERE categoria = ? ORDER BY nome';
    db.query(query, [categoria], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos por categoria:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// Listar categorias únicas
app.get('/api/categorias', (req, res) => {
    const query = 'SELECT DISTINCT categoria FROM PRODUTOS ORDER BY categoria';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar categorias:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results.map(row => row.categoria));
    });
});

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

