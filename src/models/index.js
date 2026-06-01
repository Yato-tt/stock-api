const Empresa = require('./empresaModel');
const Fornecedor = require('./fornecedorModels');
const User = require('./userModel');
const Produtos = require('./produtoModel');
const Movimentacao = require('./movimentacaoModel');

Empresa.hasMany(User, { foreignKey: 'empresa_id' });
Empresa.hasMany(Fornecedor, { foreignKey: 'empresa_id' });
Empresa.hasMany(Produtos, { foreignKey: 'empresa_id' });
Empresa.hasMany(Movimentacao, { foreignKey: 'empresa_id' });

User.belongsTo(Empresa, { foreignKey: 'empresa_id' });
User.hasMany(Movimentacao, { foreignKey: 'user_id' });

Fornecedor.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Fornecedor.hasMany(Produtos, { foreignKey: 'fornecedor_id' });

Produtos.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Produtos.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id' });
Produtos.hasMany(Movimentacao, { foreignKey: 'produto_id' });

Movimentacao.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Movimentacao.belongsTo(User, { foreignKey: 'user_id' });
Movimentacao.belongsTo(Produtos, { foreignKey: 'produto_id' });


module.exports = {
  Empresa,
  Fornecedor,
  User,
  Produtos,
  Movimentacao,
}
