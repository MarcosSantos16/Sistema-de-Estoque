# Sistema de Gerenciamento de Estoque

Este é um sistema completo para gerenciamento de estoque desenvolvido com Node.js, Express e MySQL.

## Funcionalidades

- **Cadastro de Produtos**: Permite cadastrar novos produtos com informações completas
- **Gerenciamento de Estoque**: Visualização de todos os produtos com filtros por categoria
- **Movimentação de Estoque**: Registro de entradas e saídas de produtos
- **Alertas de Estoque Baixo**: Produtos com menos de 5 unidades são destacados visualmente
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilo**: Segoe UI (conforme especificação)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL Server
- npm (gerenciador de pacotes do Node.js)

## Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd estoque-system
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   - Crie um banco de dados MySQL chamado `estoque_db`
   - Execute o script SQL fornecido (`schema.sql`) para criar as tabelas

4. **Configure a conexão com o banco**
   - Edite o arquivo `server.js` se necessário para ajustar as credenciais do MySQL:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',        // Seu usuário MySQL
       password: '',        // Sua senha MySQL
       database: 'estoque_db'
   });
   ```

5. **Inicie o servidor**
   ```bash
   node server.js
   ```

6. **Acesse a aplicação**
   - Abra o navegador e vá para: `http://localhost:3000`

## Estrutura do Projeto

```
estoque-system/
├── server.js           # Servidor backend (API)
├── schema.sql          # Script de criação do banco de dados
├── package.json        # Dependências do projeto
├── README.md          # Este arquivo
└── public/            # Arquivos do frontend
    ├── index.html     # Página principal
    ├── styles.css     # Estilos da aplicação
    └── script.js      # Lógica JavaScript
```

## API Endpoints

### Produtos
- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos/:id` - Buscar produto por ID
- `POST /api/produtos` - Cadastrar novo produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Excluir produto

### Movimentações
- `GET /api/movimentacoes` - Listar movimentações
- `POST /api/movimentacoes` - Registrar nova movimentação

### Categorias
- `GET /api/categorias` - Listar categorias únicas
- `GET /api/produtos/categoria/:categoria` - Filtrar produtos por categoria

## Como Usar

### 1. Cadastrar Produtos
- Clique em "Cadastrar Produto" no menu
- Preencha todos os campos obrigatórios
- Clique em "Salvar Produto"

### 2. Gerenciar Estoque
- A tela inicial mostra todos os produtos cadastrados
- Use o filtro de categoria para visualizar produtos específicos
- Produtos com estoque baixo (< 5 unidades) aparecem em vermelho
- Use os botões "Editar" e "Excluir" para gerenciar produtos

### 3. Movimentar Estoque
- Clique em "Movimentação" no menu
- Selecione o produto
- Escolha o tipo (Entrada ou Saída)
- Informe a quantidade
- Clique em "Registrar Movimentação"

## Recursos Implementados

✅ Diagrama Entidade-Relacionamento (DER)
✅ Script SQL para criação do banco de dados
✅ Tela de cadastro de produtos
✅ Tela de movimentação de estoque
✅ Tela de gerenciamento de estoque
✅ Validação de campos obrigatórios
✅ Alertas de estoque baixo
✅ Filtros por categoria
✅ Interface responsiva
✅ Mensagens de confirmação
✅ Atualização automática do estoque

## Observações

- Todos os campos de cadastro são obrigatórios
- O sistema impede a exclusão de produtos que possuem movimentações
- As movimentações são registradas com data/hora automática
- O estoque é atualizado automaticamente após cada movimentação
- A interface segue as especificações de cores e fonte (Segoe UI)

## Suporte

Para dúvidas ou problemas, verifique:
1. Se o MySQL está rodando
2. Se as credenciais do banco estão corretas
3. Se todas as dependências foram instaladas
4. Se a porta 3000 está disponível

