const amqp = require('amqplib');

const QUEUES = {
  NUEVO: 'pedidos_nuevos',
  EN_PREPARACION: 'pedidos_en_preparacion',
  LISTO_PARA_ENTREGAR: 'pedidos_listos_para_entregar',
  ENTREGADO: 'pedidos_entregados',
  FALLO_ENTREGA: 'pedidos_fallo_entrega',
  CANCELADO: 'pedidos_cancelados'
};

let channel;

async function connect() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  for (const queue of Object.values(QUEUES)) {
    await channel.assertQueue(queue, { durable: true });
  }
}

async function publishEstadoCambio(pedidoId, nuevoEstado) {
  let queue;
  switch (nuevoEstado) {
    case 'En preparacion':
      queue = QUEUES.EN_PREPARACION;
      break;
    case 'Listo para entregar':
      queue = QUEUES.LISTO_PARA_ENTREGAR;
      break;
    case 'Entregado':
      queue = QUEUES.ENTREGADO;
      break;
    case 'Fallo en la entrega':
      queue = QUEUES.FALLO_ENTREGA;
      break;
    case 'Cancelado':
      queue = QUEUES.CANCELADO;
      break;
    default:
      queue = QUEUES.NUEVO;
  }
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify({ pedidoId, nuevoEstado })));
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

async function init() {
  await connect();
  // Se suscribe nomas a la cola de pedidos nuevos
  // De las demas colas va a ser publisher cuando se actualice el estado de un pedido
  subscribe('pedidos_nuevos', async (data) => {
    console.log('Nuevo pedido recibido:', data);
    // Aquí lógica para guardar el pedido en la base de datos interna
  });
}

module.exports = {
  init,
  publishEstadoCambio,
};
