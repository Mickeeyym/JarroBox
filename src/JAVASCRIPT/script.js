function proporcao(valorAtual, valorMaximo) {
    const porcent = (valorMaximo - valorAtual) / valorMaximo;
    return porcent;
}
function aplicarCSSItem(itemDiv, porcent) {

      const novaAltura = 100 * porcent;
      let novaAlturaSup;

      const root = document.documentElement;
      const output = (porcent) * 30 - 15;
      root.style.setProperty('--distance', `${output}px`);
      if (porcent<=0.1){
      root.style.setProperty('--altura', `${2}px`);
      } else{
      root.style.setProperty('--altura', `${0}px`);
      }

      if(porcent > 0.5){
        novaAlturaSup =  novaAltura-6;
      } else if (porcent <= 0.5){
        novaAlturaSup =  novaAltura-4;
      } 
      const altura = 50 - novaAltura;
      const novalargura = 2 * Math.sqrt(50 ** 2 - altura ** 2);
      if (novaAltura >= 50) {
        itemDiv.style.setProperty('--sombra-largura', `${novalargura - 3}%`);
      }
      itemDiv.style.setProperty('--liquido-nivel', `${novaAltura}%`);
      itemDiv.style.setProperty('--liquido-nivel-superficie', `${novaAlturaSup}%`);
      itemDiv.style.setProperty('--largura-perspect', `${novalargura - 3}%`);
      itemDiv.style.setProperty('--altura-brilho', `${100 - novaAltura}%`);
      itemDiv.style.setProperty('--topo-brilho', `${2 + novaAltura}%`);
    }

//transforma os botões
function transformarButton(button){
    button.classList.add('hidden');
    const targetId = button.getAttribute('data-target');
    document.getElementById(targetId).classList.remove('hidden');
}
//definição inicial do item
function definir(vezes){
    for (let i = 0; i < vezes; i++) {
        diminuir(alterador);
    }
}
//abrir aba de criação
function abrir_aba(){
    document.getElementById('abaMenor').style.display = 'flex';
}
//fechar aba de criação
function fechar_aba(){
    document.getElementById('abaMenor').style.display = 'none';
}
//abrir aba de categoria
function abrir_category(){
    document.getElementById('createCategory').style.display = 'flex';
}
//fechar aba de categoria
function fechar_category(){
    document.getElementById('createCategory').style.display = 'none';
}
//abrir aba de item
function abrir_item(id) {
    const abaItem = document.querySelector('.abaItem');
    let div = document.getElementById("dados");
    div.id=id;
    div.innerHTML = '';
    
    const postsContainer = document.getElementById('idItem');
    postsContainer.innerHTML = '';

    loadItemsEdicao(id);
    buscarItem(id);
    abaItem.style.display = 'flex';
}
function fechar_item() {
    const abaItem = document.querySelector('.abaItem');
    let div = document.querySelector('.dados_item');
    div.id = 'dados';
    abaItem.style.display = 'none';
}

//FETCH
const url = 'http://localhost:5000/api/armazem';
// Função para cadastrar item
document.getElementById('criar_item').addEventListener('submit', function(event) {
    event.preventDefault();

    const  nome = document.querySelector("#nome");
    const  valor_atual = document.querySelector("#valor_atual");
    const  valor_max = document.querySelector("#valor_max");
    const  valor_min = document.querySelector("#valor_min");
    const  valor_compra = document.querySelector("#valor_compra");
    const  fornecedor = document.querySelector("#fornecedor");
    const  categoria_select = document.querySelector("#categoria_select");
    const  obs = document.querySelector("#obs");

    const data = {
        nome: nome.value,
        valor_atual: valor_atual.value,
        valor_max: valor_max.value,
        valor_min: valor_min.value,
        valor_compra: valor_compra.value,
        fornecedor: fornecedor.value,
        categoria: categoria_select.value,
        obs: obs.value,
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Produto cadastrado com sucesso!');
        carregarFiltros();
        loadItems();
    })
    .catch(error => {
        console.error('Erro ao cadastrar produto:', error);
        alert('Erro ao cadastrar produto!');
    });
});

// Atualizar item
function atualizarItem(id, dados) {
    return fetch(`http://localhost:5000/api/armazem/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}
// Buscar informações do item e criar menu editável
async function buscarItem(id) {
    const response = await fetch(`http://localhost:5000/api/armazem/${id}`);
    const data = await response.json();
    const postsContainer = document.getElementById(`${id}`);

    //criar div pai
    const div = document.createElement("div");
    //nome
    const nomeD = document.createElement("label");
    nomeD.type = "string";
    nomeD.textContent = "Nome do Item:";
    div.appendChild(nomeD);

    const nome = document.createElement("input");
    nome.type = "string";
    nome.value = data.nome;
    nome.required = true;
    div.appendChild(nome);

    //valor atual
    const valorAtualD = document.createElement("label");
    valorAtualD.type = "string";
    valorAtualD.textContent = "Quantidade:";
    div.appendChild(valorAtualD);

    const valorAtual = document.createElement("input");
    valorAtual.type = "number";
    valorAtual.value = data.valor_atual;
    valorAtual.min = 0;
    valorAtual.step = 1;
    valorAtual.required = true;
    // Impedir a digitação de números negativos
    valorAtual.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === 'ArrowDown' || e.key === 'NumpadSubtract') {
            e.preventDefault();
        }
    });
    div.appendChild(valorAtual);

    //valor máximo
    const valorMaxD = document.createElement("label");
    valorMaxD.type = "string";
    valorMaxD.textContent = "Valor Máximo:";
    div.appendChild(valorMaxD);

    const valorMax = document.createElement("input");
    valorMax.type = "number";
    valorMax.value = data.valor_max;
    valorMax.min = 0;
    valorMax.step = 1;
    valorMax.required = true;
    // Impedir a digitação de números negativos
    valorMax.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === 'ArrowDown' || e.key === 'NumpadSubtract') {
            e.preventDefault();
        }
    });
    div.appendChild(valorMax);

    //valor mínimo
    const valorMinD = document.createElement("label");
    valorMinD.type = "string";
    valorMinD.textContent = "Valor Mínimo:";
    div.appendChild(valorMinD);

    const valorMin = document.createElement("input");
    valorMin.type = "number";
    valorMin.value = data.valor_min;
    valorMin.min = 0;
    valorMin.step = 1;
    // Impedir a digitação de números negativos
    valorMin.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === 'ArrowDown' || e.key === 'NumpadSubtract') {
            e.preventDefault();
        }
    });
    div.appendChild(valorMin);

    //valo de compra
    const valorCompraD = document.createElement("label");
    valorCompraD.type = "string";
    valorCompraD.textContent = "Valor de Compra:";
    div.appendChild(valorCompraD);

    const valorCompra = document.createElement("input");
    valorCompra.type = "number";
    valorCompra.value = data.valor_compra;
    valorCompra.min = 0;
    // Impedir a digitação de números negativos
    valorCompra.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === 'ArrowDown' || e.key === 'NumpadSubtract') {
            e.preventDefault();
        }
    });
    div.appendChild(valorCompra);

    //fornecedor
    const fornecedorD = document.createElement("label");
    fornecedorD.type = "string";
    fornecedorD.textContent = "Fornecedor:";
    div.appendChild(fornecedorD);

    const fornecedor = document.createElement("input");
    fornecedor.type = "string";
    fornecedor.value = data.fornecedor;
    div.appendChild(fornecedor);

    //categoria
    const categD = document.createElement("label");
    categD.type = "string";
    categD.textContent = "Categoria:";
    div.appendChild(categD);

    const categ = document.createElement("select");
    categ.id = "categoriaSelect";
    div.appendChild(categ);
    carregarCategoriasMenu(categ, data.categoria);
    console.log(categ.value);

    //observações
    const obserD = document.createElement("label");
    obserD.type = "string";
    obserD.style.display = "block";
    obserD.textContent = "Observações:";
    div.appendChild(obserD);

    const obser = document.createElement("textarea");
    obser.type = "string";
    obser.value = data.obs;
    div.appendChild(obser);

    const btnSalvar = document.createElement("button");
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.addEventListener('click', () => {
        const dados = {
            nome: nome.value,
            valor_atual: parseInt(valorAtual.value),
            valor_max: parseInt(valorMax.value),
            valor_min: parseInt(valorMin.value),
            valor_compra: parseFloat(valorCompra.value),
            fornecedor: fornecedor.value,
            categoria: categ.value,
            obs: obser.value
        };
        atualizarItem(id, dados);
        carregarFiltros();
        loadItems();
        fechar_item();
    });    
    div.appendChild(btnSalvar);

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener('click', () => excluirItem(id));
    div.appendChild(btnExcluir);

    postsContainer.appendChild(div);
}

//Carregar itens com filtro opcional
function loadItems(filtro = '') {
    Promise.all([
        fetch(url).then(response => response.json()),
        fetch('http://localhost:5000/api/categorias').then(response => response.json())
    ])
    .then(([items, categorias]) => {
        const container = document.getElementById('armazenador');
        container.innerHTML = '';

        const categoriasMap = categorias.reduce((map, categoria) => {
            map[categoria.id] = categoria;
            return map;
        }, {});

        let filteredItems = items;

        if (filtro === 'valor_min') {
            filteredItems = items.filter(item => {
                return item.valor_atual <= item.valor_min;
            });
        } else if (filtro) {
            filteredItems = items.filter(item => item.categoria === filtro);
        }

        filteredItems.forEach(item => {
            const categoria = categoriasMap[item.categoria];
            if (categoria) {
                const categoriaCor = categoria.cor;
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');
                itemDiv.id = `item-${item.id}`;

                const porcent = proporcao(item.valor_atual, item.valor_max);
                aplicarCSSItem(itemDiv, porcent);
                
                const alertName = document.getElementsByClassName('name');
                const alertQtd = document.getElementsByClassName('quantidade');

                const corLiquidoSup = darkenColor(categoriaCor, 0.2);
                const corSombra = darkenColor(categoriaCor, 0.8);

                itemDiv.style.setProperty('--cor-liquidoSup', corLiquidoSup);
                itemDiv.style.setProperty('--cor-sombra', corSombra);
                itemDiv.style.setProperty('--cor-liquido', categoriaCor);

                itemDiv.innerHTML = `
                    <div class="menu">
                        <button id="btn${item.id}" class="btnInicial" onclick="transformarButton(this)" data-target="btn${item.id}i">-+</button>
                        <div id="btn${item.id}i" class="hidden">
                            <button class="btnE" onclick="diminuirValor(${item.id})">-1</button>
                            <button class="btnD" onclick="aumentarValor(${item.id})">+1</button>
                        </div>
                    </div>
                    <div class="shadow"></div>
                    <div class="pot" onclick="abrir_item(${item.id})">
                        <div class="brilho"></div>
                        <div class="liquido"></div>
                        <div class="liquido_superficie"></div>
                    </div>
                    <div>
                        <h6 class="quantidade">${item.valor_atual}</h6>
                        <h6 class="name">${item.nome}</h6>
                    </div>
                `;
                if (item.valor_atual <= item.valor_min) {
                    const nameElement = itemDiv.querySelector('.name');
                    const qtdElement = itemDiv.querySelector('.quantidade');

                        nameElement.style.color = 'red';
                        qtdElement.style.color = 'red';
                }

                container.appendChild(itemDiv);
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os itens:', error));
}

//carregar item no menu de edição
async function loadItemsEdicao(id) {
    const response = await fetch(`http://localhost:5000/api/armazem/${id}`);
    const data = await response.json();
    const postsContainer = document.getElementById('idItem');

      // Criação da div do item
      const itemDiv = document.createElement('div');

      const porcent = proporcao(data.valor_atual, data.valor_max);
      
      aplicarCSSItem(itemDiv, porcent);

      const categoriaId = data.categoria;
      const categoriaResponse = await fetch(`http://localhost:5000/api/categorias/${categoriaId}`);
      const categoria = await categoriaResponse.json();
    
      if (categoria && categoria.cor) {
        const corLiquido = categoria.cor;
        const corLiquidoSup = darkenColor(corLiquido, 0.2);
        const corSombra = darkenColor(corLiquido, 0.8);

        itemDiv.style.setProperty('--cor-liquidoSup', corLiquidoSup);
        itemDiv.style.setProperty('--cor-sombra', corSombra);
        itemDiv.style.setProperty('--cor-liquido', corLiquido);
      }
      
      itemDiv.innerHTML = `
          <div class="menu">
          </div>
          <div class="shadow_anim"></div>
          <div class="pot_anim">
            <div class="brilho"></div>
            <div class="liquido_anim"></div>
            <div class="liquido_superficie_anim"></div>
          </div>
      `;
      // Adiciona a div do item no container
      postsContainer.appendChild(itemDiv);
};
//Função para excluir item
function excluirItem(id) {
    const confirmDelete = confirm("Você tem certeza que deseja excluir este item?");
    if (confirmDelete) {
        fetch(`http://localhost:5000/api/armazem/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                // Remover o item da interface
                const itemDiv = document.getElementById(`item-${id}`);
                if (itemDiv) {
                    itemDiv.remove();
                }
                alert("Item excluído com sucesso!");
            } else {
                alert("Erro ao excluir o item.");
            }
            carregarFiltros();
            loadItems();
            fechar_item();
        })
        .catch(error => {
            console.error('Erro ao excluir item:', error);
            alert('Erro ao excluir o item.');
        });
    }
}
//tratamento de erros, garantir um número
function garantirNumero(valor) {
    if (isNaN(valor)) {
        throw new Error('Erro, Tente Novamente');
    }
    return Number(valor);
}

// Função para diminuir o valor atual em 1
async function diminuirValor(id) {
    const response = await fetch(`http://localhost:5000/api/armazem/${id}`);
    const data = await response.json();

    let valorAtual = garantirNumero(data.valor_atual);

    //Verifica se o valor atual é maior que 0 para não permitir que fique negativo
    const novoValorAtual = valorAtual > 0 ? valorAtual - 1 : 0;

    const dados = {
        nome: data.nome,
        valor_atual: parseInt(novoValorAtual),
        valor_max: data.valor_max,
        valor_min: data.valor_min,
        valor_compra: data.valor_compra,
        fornecedor: data.fornecedor,
        categoria: data.categoria,
        obs: data.obs
    };
    atualizarItem(id, dados);
    carregarFiltros();
    loadItems();
}
// Função para aumentar o valor atual em 1
async function aumentarValor(id) {
    const response = await fetch(`http://localhost:5000/api/armazem/${id}`);
    const data = await response.json();

    let valorAtual = garantirNumero(data.valor_atual);

    const novoValorAtual = valorAtual + 1;

    const dados = {
        nome: data.nome,
        valor_atual: parseInt(novoValorAtual),
        valor_max: data.valor_max,
        valor_min: data.valor_min,
        valor_compra: data.valor_compra,
        fornecedor: data.fornecedor,
        categoria: data.categoria,
        obs: data.obs
    };
    atualizarItem(id, dados);
    carregarFiltros();
    loadItems();
}

//Criar Categoria
  document.getElementById('categoryDados').addEventListener('submit', function(event) {
    event.preventDefault();
    const  nome = document.querySelector("#nomeCategory");
    const  cor = document.querySelector("#colorCategory");

    const data = {
        nome: nome.value,
        cor: cor.value,
    };

    fetch('http://localhost:5000/api/categorias', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Categoria cadastrada com sucesso!');
        carregarFiltros();
        loadItems();
    })
    .catch(error => {
        console.error('Erro ao cadastrar a Categoria:', error);
        alert('Erro ao cadastrar a Categoria!');
    });
});

//Carregar categorias
function carregarCategorias() {
    fetch('http://localhost:5000/api/categorias')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(categorias => {
            const selectElement = document.getElementById('categoria_select');
            
            selectElement.innerHTML = '';

            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = 'Escolha uma categoria';
            optionDefault.selected = true;
            optionDefault.disabled = true;
            selectElement.appendChild(optionDefault);

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                console.log(categoria.id);
                option.textContent = categoria.nome;
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar categorias:', error);
        });
}

// Função para carregar os filtros no select
function carregarFiltros() {
    fetch('http://localhost:5000/api/categorias')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(categorias => {
            const selectElement = document.getElementById('filtros');
            selectElement.innerHTML = '';

            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = 'Categorias';
            optionDefault.selected = true;
            selectElement.appendChild(optionDefault);

            const optionMinValue = document.createElement('option');
            optionMinValue.value = 'valor_min';
            optionMinValue.textContent = 'Precisando de Reposição';
            selectElement.appendChild(optionMinValue);

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                selectElement.appendChild(option);
            });

            selectElement.addEventListener('change', function() {
                const selectedCategoriaId = this.value;
                loadItems(selectedCategoriaId);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar categorias:', error);
        });
}

// Chama a função para carregar as categorias e o select
document.addEventListener('DOMContentLoaded', () => {
    carregarFiltros();
    loadItems();
});


function toggleInfo() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "flex";
}
function fecharInfo() {
    let infoBox = document.getElementById("infoBox");
    infoBox.style.display = "none";
}

//carregar catergorias do menu do item
function carregarCategoriasMenu(selectElement, categoriaAtual) {
    fetch('http://localhost:5000/api/categorias')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(categorias => {
            selectElement.innerHTML = '';

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                if (categoria.id === categoriaAtual) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar categorias:', error);
        });
}

//previne números negativos aos inputs
function preventNegativeInput(e) {
    if (e.key === '-' || e.key === 'ArrowDown' || e.key === 'NumpadSubtract') {
        e.preventDefault();
    }
}

// Função para converter a cor hexadecimal em RGB
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;

    hex = hex.replace(/^#/, '');

    if (hex.length === 6) {
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
    }

    return { r, g, b };
}

// Função para converter a cor RGB em hexadecimal
function rgbToHex(r, g, b) {
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
}

// Função para escurecer a cor em hex
function darkenColor(hex, percent) {
    const { r, g, b } = hexToRgb(hex);

    const newR = Math.max(0, r - (r * percent));
    const newG = Math.max(0, g - (g * percent));
    const newB = Math.max(0, b - (b * percent));

    return rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB));
}
//abrir atualizador de categorias
function abrir_atualCateg(){
    const abaCateg = document.getElementById('atualizar_category');
    abaCateg.style.display = "flex";
}
//fechar atualizador de categorias
function fechar_atualCateg(){
    const abaCateg = document.getElementById('atualizar_category');
    abaCateg.style.display = "none";
}

//carregar categorias no menu de atualização para edição
function carregarCategoriasAtualizar() {
    fetch('http://127.0.0.1:5000/api/categorias')
        .then(response => response.json())
        .then(categorias => {
            const categoriaLista = document.getElementById('categoria_lista');
            categoriaLista.innerHTML = '';

            categorias.forEach(categoria => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span style="color: ${categoria.cor};">${categoria.nome || "Cor desconhecida"}</span><br>
                    <button onclick="editarCategoria('${categoria.id}', '${categoria.nome}', '${categoria.cor}')">Editar</button>
                    <button onclick="excluirCategoria('${categoria.id}')">Excluir</button>
                `;
                categoriaLista.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar categorias:', error));
}

function editarCategoria(id, nome, cor) {
    const nomeInput = document.getElementById('categoria-nome');
    const corInput = document.getElementById('categoria-cor');
    const editarFormulario = document.getElementById('editar-categoria-form');
    const botaoCor = document.getElementById('categoria-cor');
    
    nomeInput.disabled = false;
    corInput.disabled = false;
    botaoCor.style.cursor = 'pointer';

    nomeInput.value = nome;
    corInput.value = cor;
    editarFormulario.onsubmit = function(event) {
        event.preventDefault();
        atualizarCategoria(id, nomeInput.value, corInput.value);
    };
};

function atualizarCategoria(id, nome, cor) {
    fetch(`http://127.0.0.1:5000/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, cor})
    })
    .then(response => response.json())
    .then(data => {
        alert('Categoria atualizada com sucesso!');
        carregarFiltros();
        loadItems();
        carregarCategoriasAtualizar();
        nomeInput.value = '';
        corInput.value = '';
        
        const botaoCor = document.getElementById('categoria-cor');
        nomeInput.disabled = true;
        corInput.disabled = true;
        botaoCor.style.cursor = 'none';
    })
    .catch(error => console.error('Erro ao atualizar categoria:', error));
}
//Exclui a categoria
function excluirCategoria(categoriaId) {
    const confirmacao = confirm("Você tem certeza que deseja excluir esta categoria?");

    if (!confirmacao) {
        return;
    }

    fetch(`http://127.0.0.1:5000/api/categorias/${categoriaId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            const categoriaElement = document.getElementById(`categoria-${categoriaId}`);
            if (categoriaElement) {
                categoriaElement.remove();
            }
            carregarCategoriasAtualizar();
            carregarFiltros();
            loadItems();
        } else if (data.error) {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir categoria:', error);
        alert("Ocorreu um erro ao tentar excluir a categoria.");
    });
}

function config(){
    alert("Caso tenha algum problema tente entrar em contato com o email a seguir: brunodornelaswork@gmail.com")
}