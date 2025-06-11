const amqp = require('amqplib');

async function subscribePedidosNuevos(onMessage) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();
  const queue = 'pedidos_nuevos';
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      onMessage(data);
      channel.ack(msg);
    }
  });
  console.log(`Suscrito a la cola "${queue}"`);
}

async function subscribeCambiosEstadoCancelado(onMessage) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();
  const queue = 'cambios_estado';
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      if (data.nuevoEstado === 'Cancelado') {
        onMessage(data);
        channel.ack(msg);
      }
    }
  });
  console.log(`Suscrito a la cola "${queue}" (solo cancelados)`);
}

module.exports = {
  subscribePedidosNuevos,
  subscribeCambiosEstadoCancelado,
};