const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env file

// Create a Sequelize instance with SQL Server configuration
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST, // Database host (e.g., localhost or IP address)
  dialect: 'mssql', // Specify SQL Server as the dialect
  port: process.env.DATABASE_PORT || 1433, // Default SQL Server port
  logging: false, // Disable logging (optional)
  dialectOptions: {
    options: {
      encrypt: true, // Use encryption if required by your SQL Server
      trustServerCertificate: false, // For self-signed certificates (optional)
    },
  },
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    // console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;