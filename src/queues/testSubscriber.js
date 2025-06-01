const amqp = require('amqplib');

async function main() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();
  const queue = 'pedidos_nuevos';

  await channel.assertQueue(queue, { durable: true });

  console.log(`Esperando mensajes en la cola "${queue}"...`);
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('Pedido recibido:', data);
      channel.ack(msg);
    }
  });
}

main().catch(console.error);