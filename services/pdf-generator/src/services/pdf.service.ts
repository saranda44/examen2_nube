import PDFDocument from "pdfkit";

// Recibe una nota completa y devuelve un Buffer con el PDF generado
export async function generatePDFBuffer(nota: any): Promise<Buffer> {
    const cliente = nota.cliente;
    const detalles = nota.detalle;

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });

        // Título
        doc.fontSize(20).text('Nota de Venta', { align: 'center' });
        doc.moveDown();

        // Información del Cliente
        doc.fontSize(14).text('Información del Cliente');
        doc.fontSize(12).text(`Razón Social: ${cliente.razon_social}`);
        doc.fontSize(12).text(`Nombre Comercial: ${cliente.nombre_comercial}`);
        doc.text(`RFC: ${cliente.rfc}`);
        doc.text(`Correo electrónico: ${cliente.correo}`);
        doc.text(`Teléfono: ${cliente.telefono}`);
        doc.moveDown();

        // Información de la Nota
        doc.fontSize(14).text('Información de la Nota');
        doc.fontSize(12).text(`Folio: ${nota.folio}`);
        doc.moveDown();

        // Contenido de la nota
        doc.fontSize(14).text('Contenido de la nota');
        doc.moveDown();
        if (detalles) {
            detalles.forEach((det: any, index: number) => {
                doc.fontSize(10).text(`${index + 1}. Producto: ${det.producto}`);
                doc.text(`   Cantidad: ${det.cantidad} | Precio Unitario: $${det.precio_unitario} | Importe: $${det.importe}`);
                doc.moveDown(0.5);
            });
            doc.moveDown();
        }

        doc.fontSize(12).text(`TOTAL IMPORTE: $${nota.total}`);

        doc.end();
    });
}