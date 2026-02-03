// Variáveis globais
let produtos = [];
let produtoParaExcluir = null;

// Configuração da API
const API_BASE = 'http://localhost:3000/api';

// Inicialização da aplicação
document.addEventListener('DOMContentLoad', function() {
    carregarProdutos();
    carregarCategorias();
    carregarProdutosSelect();
    carregarMovimentacoes();
    
    // Event listeners para formulários
    document.getElementById('formProduto').addEventListener('submit', salvarProduto);
    document.getElementById('formMovimentacao').addEventListener('submit', registrarMovimentacao);
});

// Navegação entre páginas
function showPage(pageId, event) {
    // Esconder todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Mostrar página selecionada
    document.getElementById(pageId).classList.add('active');
    
    // Atualizar botões de navegação
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    // Limpar formulário se for página de cadastro
    if (pageId === 'cadastro-produto') {
        limparFormulario();
    }
    
    // Recarregar dados se necessário
    if (pageId === 'gerenciamento') {
        carregarProdutos();
    } else if (pageId === 'movimentacao') {
        carregarProdutosSelect();
        carregarMovimentacoes();
    }
}

// Funções da API
async function fazerRequisicao(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Carregar produtos
async function carregarProdutos() {
    try {
        const data = await fazerRequisicao(`${API_BASE}/produtos`);
        produtos = data;
        renderizarTabelaProdutos(produtos);
    } catch (error) {
        mostrarMensagem('Erro', 'Erro ao carregar produtos: ' + error.message);
    }
}

// Renderizar tabela de produtos
function renderizarTabelaProdutos(produtosList) {
    const tbody = document.getElementById('corpoTabela');
    tbody.innerHTML = '';
    
    if (produtosList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    produtosList.forEach(produto => {
        const row = document.createElement('tr');

        const quantidadeClass = produto.quantidade_estoque < 5 ? 'estoque-baixo' : '';
        
        row.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td>R$ ${parseFloat(produto.preco_custo).toFixed(2)}</td>
            <td>R$ ${parseFloat(produto.preco_venda).toFixed(2)}</td>
            <td class="${quantidadeClass}">${produto.quantidade_estoque}</td>
            <td>${produto.categoria}</td>
            <td>
                <button onclick="editarProduto(${produto.id})" class="btn-edit">Editar</button>
                <button onclick="confirmarExclusaoProduto(${produto.id})" class="btn-delete">Excluir</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Carregar categorias para o filtro
async function carregarCategorias() {
    try {
        const categorias = await fazerRequisicao(`${API_BASE}/categorias`);
        const select = document.getElementById('filtroCategoria');
        
        // Limpar opções existentes (exceto "Todas as categorias")
        select.innerHTML = '<option value="">Todas as categorias</option>';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Filtrar produtos por categoria
function filtrarPorCategoria() {
    const categoria = document.getElementById('filtroCategoria').value;
    
    if (categoria === '') {
        renderizarTabelaProdutos(produtos);
    } else {
        const produtosFiltrados = produtos.filter(produto => produto.categoria === categoria);
        renderizarTabelaProdutos(produtosFiltrados);
    }
}

// Salvar produto (criar ou atualizar)
async function salvarProduto(event) {
    event.preventDefault();
    
    const produtoId = document.getElementById('produtoId').value;
    const produto = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco_custo: parseFloat(document.getElementById('precoCusto').value),
        preco_venda: parseFloat(document.getElementById('precoVenda').value),
        quantidade_estoque: parseInt(document.getElementById('quantidadeEstoque').value),
        categoria: document.getElementById('categoria').value
    };
    
    try {
        if (produtoId) {
            // Atualizar produto existente
            await fazerRequisicao(`${API_BASE}/produtos/${produtoId}`, {
                method: 'PUT',
                body: JSON.stringify(produto)
            });
            mostrarMensagem('Sucesso', 'Produto atualizado com sucesso');
        } else {
            // Criar novo produto
            await fazerRequisicao(`${API_BASE}/produtos`, {
                method: 'POST',
                body: JSON.stringify(produto)
            });
            mostrarMensagem('Sucesso', 'Produto cadastrado com sucesso');
        }
        
        limparFormulario();
        carregarProdutos();
        carregarCategorias();
        carregarProdutosSelect();
        
    } catch (error) {
        mostrarMensagem('Erro', 'Erro ao salvar produto: ' + error.message);
    }
}

// Editar produto
async function editarProduto(id) {
    
    try {
        const produto = await fazerRequisicao(`${API_BASE}/produtos/${id}`);
        
        // Preencher formulário
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('descricao').value = produto.descricao;
        document.getElementById('precoCusto').value = produto.preco_custo;
        document.getElementById('precoVenda').value = produto.preco_venda;
        document.getElementById('quantidadeEstoque').value = produto.quantidade_estoque;
        document.getElementById('categoria').value = produto.categoria;
        
        // Alterar título
        document.getElementById('tituloCadastro').textContent = 'Editar Produto';
        
        // Navegar para página de cadastro
        showPage('cadastro-produto');
        
        // Atualizar botão de navegação
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[onclick="showPage(\'cadastro-produto\')"]').classList.add('active');
        
    } catch (error) {
        mostrarMensagem('Erro', 'Erro ao carregar produto: ' + error.message);
    }
}

// Confirmar exclusão de produto
function confirmarExclusaoProduto(id) {
    produtoParaExcluir = id;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

// Confirmar exclusão
async function confirmarExclusao() {
    if (produtoParaExcluir) {
        try {
            await fazerRequisicao(`${API_BASE}/produtos/${produtoParaExcluir}`, {
                method: 'DELETE'
            });
            
            mostrarMensagem('Sucesso', 'O produto foi excluído');
            carregarProdutos();
            carregarCategorias();
            carregarProdutosSelect();
            
        } catch (error) {
            mostrarMensagem('Erro', 'Erro ao excluir produto: ' + error.message);
        }
        
        fecharModal();
    }
}

// Fechar modal de confirmação
function fecharModal() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    produtoParaExcluir = null;
}

// Limpar formulário de produto
function limparFormulario() {
    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('tituloCadastro').textContent = 'Cadastrar Produto';
}

// Carregar produtos para o select de movimentação
async function carregarProdutosSelect() {
    try {
        const produtos = await fazerRequisicao(`${API_BASE}/produtos`);
        const select = document.getElementById('produtoMovimentacao');
        
        select.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} (Estoque: ${produto.quantidade_estoque})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Registrar movimentação
async function registrarMovimentacao(event) {
    event.preventDefault();
    
    const movimentacao = {
        id_produto: parseInt(document.getElementById('produtoMovimentacao').value),
        tipo_movimentacao: document.getElementById('tipoMovimentacao').value,
        quantidade: parseInt(document.getElementById('quantidadeMovimentacao').value)
    };
    
    try {
        await fazerRequisicao(`${API_BASE}/movimentacoes`, {
            method: 'POST',
            body: JSON.stringify(movimentacao)
        });
        
        mostrarMensagem('Sucesso', 'Movimentação registrada com sucesso');
        
        // Limpar formulário
        document.getElementById('formMovimentacao').reset();
        
        // Recarregar dados
        carregarProdutos();
        carregarProdutosSelect();
        carregarMovimentacoes();
        
    } catch (error) {
        mostrarMensagem('Erro', 'Erro ao registrar movimentação: ' + error.message);
    }
}

// Carregar movimentações
async function carregarMovimentacoes() {
    try {
        const movimentacoes = await fazerRequisicao(`${API_BASE}/movimentacoes`);
        renderizarMovimentacoes(movimentacoes.slice(0, 10)); // Mostrar apenas as 10 últimas
    } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
    }
}

// Renderizar movimentações
function renderizarMovimentacoes(movimentacoes) {
    const container = document.getElementById('listaMovimentacoes');
    container.innerHTML = '';
    
    if (movimentacoes.length === 0) {
        container.innerHTML = '<p>Nenhuma movimentação encontrada</p>';
        return;
    }
    
    movimentacoes.forEach(mov => {
        const div = document.createElement('div');
        div.className = `movimentacao-item movimentacao-${mov.tipo_movimentacao}`;
        
        const data = new Date(mov.data_movimentacao).toLocaleString('pt-BR');
        
        div.innerHTML = `
            <strong>${mov.produto_nome}</strong><br>
            <span>Tipo: ${mov.tipo_movimentacao.toUpperCase()}</span> | 
            <span>Quantidade: ${mov.quantidade}</span> | 
            <span>Data: ${data}</span>
        `;
        
        container.appendChild(div);
    });
}

// Mostrar mensagem em modal
function mostrarMensagem(titulo, texto) {
    document.getElementById('tituloMensagem').textContent = titulo;
    document.getElementById('textoMensagem').textContent = texto;
    document.getElementById('modalMensagem').style.display = 'block';
}

// Fechar modal de mensagem
function fecharModalMensagem() {
    document.getElementById('modalMensagem').style.display = 'none';
}

// Fechar modais ao clicar fora deles
window.onclick = function(event) {
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    const modalMensagem = document.getElementById('modalMensagem');
    
    if (event.target === modalConfirmacao) {
        fecharModal();
    }
    
    if (event.target === modalMensagem) {
        fecharModalMensagem();
    }
}

