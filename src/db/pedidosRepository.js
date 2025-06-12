// Simulación de acceso a la base de datos de pedidos

async function getPedidosPorEstado(estado) {
  // Aquí luego harás la consulta real a SQL Server
  // Por ahora, retorna un array simulado
  /*return [
    { id: 1, estado: estado || 'En preparacion', descripcion: 'Pedido de ejemplo', date: new Date() },
    { id: 2, estado: estado || 'En preparacion', descripcion: 'Otro pedido de ejemplo', date: new Date() },
    { id: 3, estado: estado || 'En preparacion', descripcion: 'Tercer pedido de ejemplo', date: new Date() }
  ];*/
  return [];
}

async function actualizarEstadoPedido(id, nuevoEstado) {
  // Aquí luego harás el update real en SQL Server
  // Por ahora, retorna un objeto simulado
  return { id, nuevoEstado };
}

async function crearPedido(pedido) {
  // Aquí luego harás el insert real en SQL Server
  // Por ahora, retorna el pedido simulado con un id
  return { id: pedido.id_pedido, date: new Date(), estado: "Pendiente de preparacion", descripcion: 'este es un pedido nuevo' };
}

module.exports = {
  getPedidosPorEstado,
  actualizarEstadoPedido,
  crearPedido,
};