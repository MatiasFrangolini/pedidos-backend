const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queueManager = require('./queues/queueManager');
const pedidosRepository = require('./db/pedidosRepository');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

// Ejemplo de endpoint para obtener pedidos por estado
app.get('/api/pedidos', async (req, res) => {
  const pedidos = await pedidosRepository.getPedidosPorEstado();
  res.json(pedidos);
});

// Endpoint para cambiar el estado de un pedido (ejemplo)
app.put('/api/pedidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;
  // Aquí deberías actualizar el estado en tu base de datos y publicar en la cola correspondiente
  await queueManager.publishEstadoCambio(id, nuevoEstado);
  res.json({ message: `Pedido ${id} actualizado a estado ${nuevoEstado}` });
});

// Inicializar las suscripciones a las colas
queueManager.init();

app.listen(PORT, () => {
  console.log(`Pedidos backend listening on port ${PORT}`);
});