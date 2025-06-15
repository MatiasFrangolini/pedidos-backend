const amqp = require('amqplib');

const QUEUES = {
  NUEVO: 'pedidos_nuevos',
  CAMBIOS_ESTADO: 'cambios_estado'
};

let channel;

async function connect() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  for (const queue of Object.values(QUEUES)) {
    await channel.assertQueue(queue, { durable: true });
  }
}

async function publishCambioEstado(pedidoId, nuevoEstado) {
  if (!channel) {
    throw new Error('Channel not initialized. Call connect() first.');
  }
  console.log(`Publicando cambio de estado para pedido ${pedidoId}: ${nuevoEstado}`);
  try {
    await channel.sendToQueue(
      QUEUES.CAMBIOS_ESTADO,
      Buffer.from(JSON.stringify({ pedidoId, nuevoEstado }))
    );
  } catch (error) {
    console.error('Error publicando cambio de estado:', error);
    throw error;
  }
}

function subscribe(queue, handler) {
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      channel.ack(msg);
    }
  });
}

async function init({ onNuevoPedido, onPedidoCancelado }) {
  await connect();
  // Suscribirse a pedidos_nuevos para crear el pedido en la base de datos
  subscribe(QUEUES.NUEVO, async (data) => {
    if (onNuevoPedido) await onNuevoPedido(data);
  });
  // Suscribirse a cambios_estado solo para pedidos cancelados
  subscribe(QUEUES.CAMBIOS_ESTADO, async (data) => {
    if (data.nuevoEstado === 'Cancelado' && onPedidoCancelado) {
      await onPedidoCancelado(data);
    }
  });
}

module.exports = {
  init,
  publishCambioEstado,
};
