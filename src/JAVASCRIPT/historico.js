function listarMovimentacoes() {
    fetch(`http://localhost:5000/api/movimentacoes`)
        .then(response => response.json())
        .then(movimentacoes => {
            const container = document.getElementById('container_hist');

            container.innerHTML = '';
            
            movimentacoes.forEach(movimentacao => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item_invent');
                itemDiv.setAttribute('data-id', movimentacao.id);

                itemDiv.innerHTML = `
                    <p>Data: ${movimentacao.data}</p>
                    <p>Ação: ${movimentacao.acao}</p>
                    <p>Item: ${movimentacao.nome_item}</p>
                    <p>Quantidade: ${movimentacao.quantidade}</p>
                    <button class="delete-btn">Excluir</button>
                `;

                const deleteButton = itemDiv.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => {
                    const itemId = itemDiv.getAttribute('data-id');
                    excluirMovimentacao(itemId, itemDiv);
                });

                container.appendChild(itemDiv);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar movimentações:', error);
            carregando = false;
        });
}

function excluirMovimentacao(id, itemDiv) {
    fetch(`http://localhost:5000/api/movimentacao/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Movimentação excluída com sucesso!') {
            console.log(`Movimentação com ID ${id} excluída com sucesso.`);
            itemDiv.remove();
        } else {
            console.error(`Erro ao excluir movimentação com ID ${id}: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir movimentação:', error);
    });
}

document.getElementById('excluir-tudo').addEventListener('click', function() {
    let confirmacao = confirm("Você tem certeza que deseja apagar tudo?");
    if (confirmacao) {
    fetch('http://localhost:5000/api/movimentacoes', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        listarMovimentacoes();
    })
    .catch(error => {
        console.error('Erro ao excluir movimentações:', error);
        alert('Ocorreu um erro ao excluir as movimentações.');
    });}
});

window.onload = listarMovimentacoes();