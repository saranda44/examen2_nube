// POST /generate
// Body: {
//   "id": 123,
//   "folio": "FOLIO-1772912265164",
//   "total": 5000,
//   "cliente": { "razon_social": "...", "rfc": "...", "correo": "...", "telefono": "..." },
//   "direccion_facturacion": { ... },
//   "direccion_envio": { ... },
//   "detalle": [ { "producto": "...", "cantidad": 12, "precio_unitario": 500, "importe": 6000 } ]
// }

// Response 200: {
//   "url": "https://7bucket-name.s3.amazonaws.com/dsvdsf/FOLIO-1772912265164.pdf",
// }