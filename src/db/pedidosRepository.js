// Simulación de acceso a la base de datos de pedidos

async function getPedidosPorEstado(estado) {
  // Aquí luego harás la consulta real a SQL Server
  // Por ahora, retorna un array simulado
  return [
    { id: 1, estado: estado || 'En preparacion', descripcion: 'Pedido de ejemplo' }
  ];
}

async function actualizarEstadoPedido(id, nuevoEstado) {
  // Aquí luego harás el update real en SQL Server
  // Por ahora, retorna un objeto simulado
  return { id, nuevoEstado };
}

async function crearPedido(pedido) {
  // Aquí luego harás el insert real en SQL Server
  // Por ahora, retorna el pedido simulado con un id
  return { id: Date.now(), ...pedido };
}

module.exports = {
  getPedidosPorEstado,
  actualizarEstadoPedido,
  crearPedido,
};