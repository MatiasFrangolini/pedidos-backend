const PedidoModel = require('../models/pedidoModel.js');
const DetallePedidoModel = require('../models/pedidoDetalleModel.js'); // Asegúrate de importar el modelo

// Simulación de acceso a la base de datos de pedidos

async function getPedidosPorEstado(estado) {
  // Aquí luego harás la consulta real a SQL Server
  // Por ahora, retorna un array simulado
  /*return [
    { id: 1, estado: estado || 'En preparacion', descripcion: 'Pedido de ejemplo', date: new Date() },
    { id: 2, estado: estado || 'En preparacion', descripcion: 'Otro pedido de ejemplo', date: new Date() },
    { id: 3, estado: estado || 'En preparacion', descripcion: 'Tercer pedido de ejemplo', date: new Date() }
  ];*/
  if (estado) {
    // Si se proporciona un estado, filtra los pedidos por ese estado
    return PedidoModel.findAll({
      where: { id_estado: estado },
      include: [
        {
          model: DetallePedidoModel,
          as: 'detalles'
        }
      ]
    });
  } else {
    // Si no se proporciona un estado, retorna todos los pedidos
    return PedidoModel.findAll({
      include: [
        {
          model: DetallePedidoModel,
          as: 'detalles'
        }
      ]
    });
  }
  return [];
}

async function getPedidoById(id) {
  return PedidoModel.findOne({
    where: { id_pedido: id },
    include: [
      {
        model: DetallePedidoModel,
        as: 'detalles'
      }
    ]
  });
}

async function actualizarEstadoPedido(id, nuevoEstado) {
  // Aquí luego harás el update real en SQL Server
  // Por ahora, retorna un objeto simulado
PedidoModel.update(
    { id_estado: nuevoEstado },
    { where: { id_pedido: id } }
  );
  return { id, nuevoEstado };
}

async function crearPedido(pedido) {

  // console.log("Creando pedido:", pedido);
  let result;
  try {
    result = await PedidoModel.create({
      id_pedido: pedido.id_pedido,
      id_estado: pedido.estado,
      direccion: pedido.direccion,
      nombre: "Juansito",
    });
  } catch (error) {
    console.log("Error al crear el pedido:", error);
    // Manejar error de pedido ya existente (por ejemplo, clave duplicada)
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
      return {
        error: true,
        message: 'El pedido ya está insertado.',
        id: pedido.id_pedido
      };
    }
    // Otros errores
    return {
      error: true,
      message: 'Error al crear el pedido.',
      details: error.message
    };
  }

  for (const item of pedido.items) {
    try {
      await DetallePedidoModel.create({
        id_producto: item.id_producto,
        id_pedido: pedido.id_pedido,
        cantidad: item.quantity
        // No 'id' field should be passed unless it exists in your model/table
      });
    } catch (error) {
      // Puedes manejar errores de detalle aquí si es necesario
      console.error('Error al crear detalle del pedido:', error.message);
    }
  }
  return getPedidoById(pedido.id_pedido)
}

module.exports = {
  getPedidosPorEstado,
  actualizarEstadoPedido,
  crearPedido,
};
