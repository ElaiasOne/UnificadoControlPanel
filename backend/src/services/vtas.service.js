const { getPool, sql } = require('../db/connection');

function normalizarFecha(fecha, fallback) {
    if (!fecha) {
        return fallback;
    }

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
        return fallback;
    }

    return parsed;
}

async function obtenerVtas({ desde, hasta } = {}) {
    let fechaHasta = normalizarFecha(hasta, new Date());
    let fechaDesde = normalizarFecha(
        desde,
        new Date(fechaHasta.getTime() - 1000 * 60 * 60 * 24 * 30),
    );

    if (fechaDesde > fechaHasta) {
        const temporal = fechaDesde;
        fechaDesde = fechaHasta;
        fechaHasta = temporal;
    }

    const pool = await getPool();
    const request = pool.request();

    request.input('fecha_desde', sql.Date, fechaDesde);
    request.input('fecha_hasta', sql.Date, fechaHasta);

    const result = await request.query(`
        WITH VentasFiltradas AS (
          SELECT ClienteWeb, Sucursal, Fecha
          FROM VtaArticulosUnificado
          WHERE Fecha BETWEEN @fecha_desde AND @fecha_hasta
          GROUP BY ClienteWeb, Sucursal, Fecha
      )
  
      SELECT 
          C.ClienteWeb, 
          C.Descripcion, 
          C.Sucursal, 
          C.Direccion, 
          ISNULL(L.Descripcion, '') AS Localidad, 
          ISNULL(P.Descripcion, '') AS Provincia,
          COUNT(V.Fecha) AS Dias
      FROM Clientes C
      LEFT JOIN Localidades L ON L.Codigo = C.Localidad
      LEFT JOIN Provincias P ON P.Codigo = L.Provincia
      LEFT JOIN VentasFiltradas V ON V.ClienteWeb = C.ClienteWeb AND V.Sucursal = C.Sucursal
      WHERE C.Habilitado = 1
      GROUP BY 
          C.ClienteWeb, C.Descripcion, C.Sucursal, C.Direccion, 
          L.Descripcion, P.Descripcion
        `);

    return result.recordset;
}

module.exports = {
    obtenerVtas,
};