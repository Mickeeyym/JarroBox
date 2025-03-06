import json
import os
from flask import Flask, request, jsonify
from datetime import datetime
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#Construtor do item
class item:
    def __init__(self, nome, valor_atual, valor_max, valor_min, valor_compra, fornecedor, categoria, obs):
        self.id = str(uuid.uuid4().int)[:10]
        self.nome = nome
        self.valor_atual = valor_atual
        self.valor_max = valor_max
        self.valor_min = valor_min
        self.valor_compra = valor_compra
        self.fornecedor = fornecedor
        self.categoria = categoria
        self.obs = obs

    def to_dict(self):  
        return {
            'id': self.id,
            'nome': self.nome,
            'valor_atual': self.valor_atual,
            'valor_max': self.valor_max,
            'valor_min': self.valor_min,
            'valor_compra': self.valor_compra,
            'fornecedor': self.fornecedor,
            'categoria': self.categoria,
            'obs': self.obs
        }


#CRUD dos itens
class itemCRUD: 
    def __init__(self, arquivo='itens.json'):
        self.arquivo = arquivo  
        self.itens = self.carregar_itens() or []

    def carregar_itens(self):   
        if os.path.exists(self.arquivo):
            with open(self.arquivo, 'r', encoding="utf-8") as f:
                if os.path.getsize(self.arquivo) > 0:  
                    dados = json.load(f)
                    itens = []
                    for d in dados:
                        d_renomeado = {
                            'nome': d.get('nome'),
                            'valor_atual': d.get('valor_atual'),
                            'valor_max': d.get('valor_max'),
                            'valor_min': d.get('valor_min'),
                            'valor_compra': d.get('valor_compra'),
                            'fornecedor': d.get('fornecedor'),
                            'categoria': d.get('categoria'),
                            'obs': d.get('obs')
                        }
                        itens.append(item(**d_renomeado))
                    return itens
        return []
    
    def salvar_item(self):
        with open(self.arquivo, 'w', encoding="utf-8") as f:
            json.dump([i.to_dict() for i in self.itens], f, indent = 4, ensure_ascii=False)
    
    def cadastrar_item(self, nome, valor_atual, valor_max, valor_min, valor_compra, fornecedor, categoria, obs):
        novo_item = item(nome, valor_atual, valor_max, valor_min, valor_compra, fornecedor, categoria, obs)
        self.itens.append(novo_item)
        self.salvar_item()
        return novo_item.to_dict()
    
    def atualizar_item(self, id, dados):
        item_encontrado = next((i for i in self.itens if i.id == id), None)

        if item_encontrado:
            item_encontrado.nome = dados.get('nome', item_encontrado.nome)
            item_encontrado.valor_atual = int(dados.get('valor_atual', item_encontrado.valor_atual))
            item_encontrado.valor_max = int(dados.get('valor_max', item_encontrado.valor_max))
            
            valor_min = dados.get('valor_min')
            if valor_min is not None and valor_min != "":
                item_encontrado.valor_min = int(valor_min)
            else:
                item_encontrado.valor_min = ""
            
            valor_compra = dados.get('valor_compra')
            if valor_compra is not None and valor_compra != "":
                item_encontrado.valor_compra = float(valor_compra)
            else:
                item_encontrado.valor_compra = ""

            item_encontrado.fornecedor = dados.get('fornecedor', item_encontrado.fornecedor)
            item_encontrado.categoria = dados.get('categoria', item_encontrado.categoria)
            item_encontrado.obs = dados.get('obs', item_encontrado.obs)
            self.salvar_item()
            return item_encontrado.to_dict()
        return None
    
    def deletar_item(self, id):
        item_encontrado = next((i for i in self.itens if i.id == id), None)
        if item_encontrado:
            self.itens.remove(item_encontrado)
            self.salvar_item()
            return item_encontrado.to_dict()
        return None

item_crud = itemCRUD()

# CRUD das Categorias
class Categoria:
    def __init__(self, nome, cor):
        self.id = str(uuid.uuid4().int)[:6]
        self.nome = nome
        self.cor = cor

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cor': self.cor
        }

    @classmethod
    def from_dict(cls, data):
        categoria = cls(nome=data['nome'], cor=data.get('cor'))
        categoria.id = data['id']
        return categoria


class CategoriaCRUD:
    def __init__(self, arquivo='categorias.json'):
        self.arquivo = arquivo
        self.categorias = self.carregar_categorias() or []
    
    def buscar_categoria_por_id(self, categoria_id):
        return next((categoria for categoria in self.categorias if categoria.id == categoria_id), None)

    def carregar_categorias(self):
        if os.path.exists(self.arquivo):
            with open(self.arquivo, 'r', encoding="utf-8") as f:
                if os.path.getsize(self.arquivo) > 0:
                    return [Categoria.from_dict(d) for d in json.load(f)]
        return []

    def salvar_categorias(self):
        with open(self.arquivo, 'w', encoding="utf-8") as f:
            json.dump([categoria.to_dict() for categoria in self.categorias], f, indent=4, ensure_ascii=False)

    def cadastrar_categoria(self, nome, cor=None):
        nova_categoria = Categoria(nome, cor)
        self.categorias.append(nova_categoria)
        self.salvar_categorias()

    def ler_categorias(self):
        return [categoria.to_dict() for categoria in self.categorias]

    def atualizar_categoria(self, categoria_id, nome=None, cor=None):
        for categoria in self.categorias:
            if categoria.id == categoria_id:
                if nome:
                    categoria.nome = nome
                if cor:
                    categoria.cor = cor
                self.salvar_categorias()
                return True
        return False

    def excluir_categoria(self, categoria_id):
        categoria = self.buscar_categoria_por_id(categoria_id)
        if categoria:
            categoria_associada = any(item.categoria == categoria.id for item in item_crud.itens)
            if categoria_associada:
                return False

            self.categorias.remove(categoria)
            self.salvar_categorias()
            return True
        
        return False

crud = CategoriaCRUD()

#Movimentação
class Movimentacao:
    def __init__(self, acao, item_id, nome_item, quantidade, data=None):
        self.id = str(uuid.uuid4().int)[:6]
        self.acao = acao 
        self.item_id = item_id
        self.nome_item = nome_item
        self.quantidade = quantidade
        self.data = data or datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def to_dict(self):
        return {
            'id': self.id,
            'acao': self.acao,
            'item_id': self.item_id,
            'nome_item': self.nome_item,
            'quantidade': self.quantidade,
            'data': self.data
        }
    @classmethod
    def from_dict(cls, data):
        movimentacao = cls(data['acao'], data['item_id'], data['nome_item'], data['quantidade'], data['data'])
        movimentacao.id = data['id']
        return movimentacao

class MovimentacaoCRUD:
    def __init__(self, arquivo='movimentacoes.json'):
        self.arquivo = arquivo
        self.movimentacoes = self.carregar_movimentacoes() or []

    def carregar_movimentacoes(self):
        if os.path.exists(self.arquivo):
            with open(self.arquivo, 'r', encoding="utf-8") as f:
                try:
                    content = f.read().strip()
                    if content:
                        return [Movimentacao.from_dict(d) for d in json.loads(content)]
                    else:
                        return []
                except json.JSONDecodeError:
                    return []
        return []
    []

    def salvar_movimentacoes(self):
        with open(self.arquivo, 'w', encoding="utf-8") as f:
            json.dump([m.to_dict() for m in self.movimentacoes], f, indent=4, ensure_ascii=False)

    def adicionar_movimentacao(self, acao, item_id, nome_item, quantidade):
        movimentacao = Movimentacao(acao, item_id, nome_item, quantidade)
        self.movimentacoes.append(movimentacao)
        self.salvar_movimentacoes()

    def excluir_movimentacao(self, id):
        movimentacao = next((m for m in self.movimentacoes if m.id == id), None)
        if movimentacao:
            self.movimentacoes.remove(movimentacao)
            self.salvar_movimentacoes()
            return movimentacao
        return None

    def listar_movimentacoes(self):
        return [m.to_dict() for m in self.movimentacoes] 


#ROTAS
@app.route('/api/categorias', methods=['POST'])
def criar_categoria():
    data = request.get_json()
    
    if not data or 'nome' not in data:
        return jsonify({'error': 'Nome é obrigatório.'}), 400
    
    cor = data.get('cor')
    crud.cadastrar_categoria(data['nome'], cor)
    return jsonify({'message': 'Categoria criada com sucesso!'}), 201

@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    categorias = crud.ler_categorias()
    return jsonify(categorias)

@app.route('/api/categorias/<string:id>', methods=['PUT'])
def atualizar_categoria(id):
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dados inválidos.'}), 400
    
    nome = data.get('nome')
    cor = data.get('cor')
    
    updated = crud.atualizar_categoria(id, nome, cor)
    
    if updated:
        return jsonify({'message': f'Categoria com ID {id} atualizada com sucesso!'}), 200
    else:
        return jsonify({'error': 'Categoria não encontrada.'}), 404

@app.route('/api/categorias/<string:id>', methods=['DELETE'])
def excluir_categoria(id):
    deleted = crud.excluir_categoria(id)
    
    if deleted:
        
        return jsonify({'message': f'Categoria excluída com sucesso!'}), 200
    else:
        
        return jsonify({'error': 'Não é possível excluir esta categoria, pois ela está associada a um ou mais itens! Altere a categoria dos itens associados a ela primeiro, se quiser excluí-la.'}), 400

@app.route('/api/categorias/<string:id>', methods=['GET'])
def buscar_categoria(id):
    categoria = crud.buscar_categoria_por_id(id)
    
    if categoria:
        return jsonify(categoria.to_dict()), 200
    else:
        return jsonify({'error': 'Categoria não encontrada!'}), 404



movimentacao_crud = MovimentacaoCRUD()
#Cadastrar novo Item
@app.route('/api/armazem', methods=['POST'])
def cadastrar_item():
    data = request.get_json()

    categoria_id = data.get('categoria')

    categoria = next((c for c in crud.categorias if c.id == categoria_id), None)
    
    if not categoria:
        return jsonify({'error': 'Categoria não encontrada!'}), 404
    
    item = item_crud.cadastrar_item(
        data['nome'],
        data['valor_atual'],
        data['valor_max'],
        data['valor_min'],
        data['valor_compra'],
        data['fornecedor'],
        categoria_id,
        data['obs']
    )

    movimentacao_crud.adicionar_movimentacao(
        'Criação',
        item['id'],
        item['nome'],
        item['valor_atual']
    )

    return jsonify(item), 201

#Buscar um item pelo ID
@app.route('/api/armazem/<id>', methods=['GET'])
def buscar_item(id):
    item_encontrado = next((i for i in item_crud.itens if i.id == id), None)
    
    if item_encontrado:
        return jsonify(item_encontrado.to_dict()), 200
    else:
        return jsonify({"message": "Item não encontrado!"}), 404

#Listar Itens
@app.route('/api/armazem', methods=['GET'])
def listar_itens():
    return jsonify([item.to_dict() for item in item_crud.itens]), 200

#atualizar item
@app.route('/api/armazem/<id>', methods=['PUT'])
def atualizar_item(id):
    data = request.get_json()
    item_encontrado = next((i for i in item_crud.itens if i.id == id), None)
    
    if item_encontrado:
        valor_atual_antigo = item_encontrado.valor_atual
        item_atualizado = item_crud.atualizar_item(id, data)
        if item_atualizado:
            if item_atualizado['valor_atual'] < valor_atual_antigo:
                movimentacao_crud.adicionar_movimentacao(
                    'Retirado',
                    item_atualizado['id'],
                    item_atualizado['nome'],
                    item_atualizado['valor_atual'] - valor_atual_antigo
            )
            if item_atualizado['valor_atual'] > valor_atual_antigo:
                movimentacao_crud.adicionar_movimentacao(
                    'Adicionado',
                    item_atualizado['id'],
                    item_atualizado['nome'],
                    item_atualizado['valor_atual'] - valor_atual_antigo
                )
            return jsonify(item_atualizado), 200
        else:
            return jsonify({"message": "Item não encontrado!"}), 404
    
# Excluir um item
@app.route('/api/armazem/<id>', methods=['DELETE'])
def excluir_item(id):
    item_deletado = item_crud.deletar_item(id)
    if item_deletado:
        movimentacao_crud.adicionar_movimentacao(
            'Exclusão',
            item_deletado['id'],
            item_deletado['nome'],
            item_deletado['valor_atual']
        )
        return jsonify({"message": "Item excluído com sucesso!"}), 200
    else:
        return jsonify({"message": "Item não encontrado!"}), 404
    
@app.route('/api/movimentacao/<id>', methods=['DELETE'])
def excluir_movimentacao(id):
    movimentacao_excluida = movimentacao_crud.excluir_movimentacao(id)
    if movimentacao_excluida:
        return jsonify({"message": "Movimentação excluída com sucesso!"}), 200
    else:
        return jsonify({"message": "Movimentação não encontrada!"}), 404

@app.route('/api/movimentacoes', methods=['GET'])
def listar_movimentacoes():
    movimentacoes = movimentacao_crud.listar_movimentacoes()
    return jsonify(movimentacoes), 200

@app.route('/api/movimentacoes', methods=['DELETE'])
def excluir_todas_movimentacoes():
    movimentacao_crud.movimentacoes = []
    try:
        movimentacao_crud.salvar_movimentacoes()
        return jsonify({"message": "Todas as movimentações foram excluídas com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro ao excluir as movimentações: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=False)