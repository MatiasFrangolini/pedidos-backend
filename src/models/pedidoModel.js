const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js'); // Adjust the path to your database configuration

const Pedido = sequelize.define('Pedido', {
  id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nombre:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE, // Sequelize's DATE type maps to SQL Server's DATETIME
    allowNull: false, // No es obligatorio para los INSERT
    defaultValue: sequelize.literal('GETDATE()'),
  },
}, {
  tableName: 'Pedido',
  timestamps: false,
});

const DetallePedido = require('./pedidoDetalleModel.js');
const Estado = require('./estadoModel.js');

Pedido.hasMany(DetallePedido, {
  foreignKey: 'id_pedido',
  as: 'detalles',
});

DetallePedido.belongsTo(Pedido, {
  foreignKey: 'id_pedido',
  as: 'pedido',
});

Pedido.belongsTo(Estado, {
  foreignKey: 'id_estado',
  as: 'estado',
});

Estado.hasMany(Pedido, {
  foreignKey: 'id_estado',
  as: 'pedidos',
});

module.exports = Pedido;