const amqp = require('amqplib');

async function main() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();

  // Suscribirse a pedidos_nuevos
  const queueNuevos = 'pedidos_nuevos';
  await channel.assertQueue(queueNuevos, { durable: true });
  console.log(`Esperando mensajes en la cola "${queueNuevos}"...`);
  channel.consume(queueNuevos, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('[pedidos_nuevos] Pedido recibido:', data);
      channel.ack(msg);
    }
  });

  // Suscribirse a cambios_estado solo para cancelados
  const queueCambios = 'cambios_estado';
  await channel.assertQueue(queueCambios, { durable: true });
  console.log(`Esperando mensajes en la cola "${queueCambios}" (solo cancelados)...`);
  channel.consume(queueCambios, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      if (data.nuevoEstado === 'Cancelado') {
        console.log('[cambios_estado] Pedido cancelado recibido:', data);
        channel.ack(msg);
      } // en el else no hace ack, para volver a dejar el pedido en la cola
      
    }
  });
}

main().catch(console.error);