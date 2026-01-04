const Empresa = require('./empresaModel');
const Fornecedor = require('./fornecedorModels');
const User = require('./userModel');
const Produtos = require('./produtoModel');

Empresa.hasMany(User, { foreignKey: 'empresa_id' });
Empresa.hasMany(Fornecedor, { foreignKey: 'empresa_id' });
Empresa.hasMany(Produtos, { foreignKey: 'empresa_id' });

User.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Fornecedor.belongsTo(Empresa, { foreignKey: 'empresa_id' } );
Fornecedor.hasMany(Produtos, { foreignKey: 'fornecedor_id' } );

Produtos.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Produtos.belongsTo(Fornecedor, { foreignKey: 'fornecedor_id' });


module.exports = {
  Empresa,
  Fornecedor,
  User,
  Produtos,
}
