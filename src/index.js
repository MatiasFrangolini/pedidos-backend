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
  // console.log(req.body);
  // Asegúrate de que el body tenga la forma { estado: "nuevoEstado" }
  const { estado: nuevoEstado } = req.body;
  // const { nuevoEstado } = req.body.estado; // Asegúrate de que el cuerpo de la solicitud tenga un campo "estado"
  // Aquí deberías actualizar el estado en tu base de datos y publicar en la cola correspondiente
  const pedido = await pedidosRepository.actualizarEstadoPedido(id, nuevoEstado);
  await queueManager.publishCambioEstado(id, nuevoEstado);
  res.json({ message: `Pedido ${id} actualizado a estado ${nuevoEstado}` });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let wsClients = [];

wss.on('connection', (ws) => {
  wsClients.push(ws);
  // Enviar mensaje de bienvenida al conectar
  // ws.send(JSON.stringify({ tipo: 'info', mensaje: 'conectado' }));
  console.log('Nuevo cliente WebSocket conectado');
  ws.on('close', () => {
    wsClients = wsClients.filter(client => client !== ws);
  });
});

// genera  pedidos aleatorios cada 15 segundos
/*setInterval(() => {
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      
      // Generar pedidos aleatorios
      const estados = ['Pendiente de preparacion', 'Listo para enviar', 'En camino', 'Entregado', 'Cancelado'];
      const randomEstado = () => estados[Math.floor(Math.random() * estados.length)];
      const pedidos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        estado: randomEstado(),
        descripcion: `Pedido de ejemplo ${i + 1}`,
        date: new Date()
      }));
      ws.send(JSON.stringify({ tipo: 'pedidos_random', pedidos }));
    }
  });
}, 15000); // 15 segundos*/

// Modifica la suscripción a pedidos nuevos:
queueManager.init({
  onNuevoPedido: async (data) => {
    console.log('Nuevo pedido recibido');
    nuevoPedido = await pedidosRepository.crearPedido(data);
    // Enviar a todos los clientes WebSocket conectados
    wsClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ tipo: 'nuevo_pedido', pedido_nuevo: nuevoPedido }));
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