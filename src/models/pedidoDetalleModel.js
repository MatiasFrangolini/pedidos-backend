const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js'); // Adjust the path to your database configuration

const DetallePedido = sequelize.define('DetallePedido', {
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  cantidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'PedidoDetalle', // Specify the table name in the database
  timestamps: false, // Disables `createdAt` and `updatedAt` fields
  freezeTableName: true,
});

module.exports = DetallePedido;