const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queueManager = require('./queues/queueManager');
const pedidosRepository = require('./db/pedidosRepository');
const http = require('http');
const WebSocket = require('ws');
const subscribers = require('./queues/subscribers');

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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let wsClients = [];

wss.on('connection', (ws) => {
  wsClients.push(ws);
  // Enviar mensaje de bienvenida al conectar
  ws.send(JSON.stringify({ tipo: 'info', mensaje: 'conectado' }));
  ws.on('close', () => {
    wsClients = wsClients.filter(client => client !== ws);
  });
});

// Publicar "hello world" cada 5 segundos a todos los clientes WebSocket conectados
/*setInterval(() => {
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'test', mensaje: 'hello world' }));
    }
  });
}, 5000);*/

// Modifica la suscripción a pedidos nuevos:
queueManager.init({
  onNuevoPedido: async (data) => {
    console.log('Nuevo pedido recibido:', data);
    await pedidosRepository.crearPedido(data);
    // Enviar a todos los clientes WebSocket conectados
    wsClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ tipo: 'nuevo_pedido', pedido: data }));
      }
    });
  },
  onPedidoCancelado: async (data) => {
    console.log('Pedido cancelado recibido:', data);
    await pedidosRepository.actualizarEstadoPedido(data.pedidoId, 'Cancelado');
  }
});

// Suscribirse a cambios_estado solo para cancelados
subscribers.subscribeCambiosEstadoCancelado(async (data) => {
  console.log('[cambios_estado] Pedido cancelado recibido:', data);
  // Aquí puedes agregar lógica adicional si lo deseas
});

server.listen(PORT, () => {
  console.log(`Pedidos backend listening on port ${PORT}`);
});