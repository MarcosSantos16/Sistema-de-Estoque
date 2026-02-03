CREATE TABLE PRODUTOS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    preco_custo DECIMAL(10, 2) NOT NULL,
    preco_venda DECIMAL(10, 2) NOT NULL,
    quantidade_estoque INT NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE MOVIMENTACOES (
    id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
    id_produto INT NOT NULL,
    tipo_movimentacao VARCHAR(50) NOT NULL, -- 'entrada' ou 'saida'
    quantidade INT NOT NULL,
    data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES PRODUTOS(id)
);

