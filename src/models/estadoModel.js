const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js'); // Adjust the path to your database configuration

const Estado = sequelize.define('Estado', {
  id_estado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
}, {
  tableName: 'Estado', // Optional: Specify the table name in the database
  timestamps: false, // Adds `createdAt` and `updatedAt` fields
});


module.exports = Estado;