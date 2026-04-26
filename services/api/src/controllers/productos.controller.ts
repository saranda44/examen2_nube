import { Request, Response } from "express";
import { ProductoService } from "../services/productos.service";

//obtener todos lo productos
export async function getProductos(req: Request, res: Response) {
    try {
        const productos = await ProductoService.getAllProductos();
        res.status(200).json(productos);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener los productos" });
    }
}

//obtener un producto por id
export async function getProductoById(req: Request, res: Response) {
    try {
        const producto = await ProductoService.getProductoById(Number(req.params.id));
        res.status(200).json(producto);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el producto" });
    }
}

//crear un producto
export async function createProducto(req: Request, res: Response) {
    try {
        const producto = await ProductoService.createProducto(req.body);
        res.status(201).json(producto);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el producto" });
    }
}

//actuualizar producto
export async function updateProducto(req: Request, res: Response) {
    try {
        const producto = await ProductoService.updateProducto(Number(req.params.id), req.body);
        res.status(200).json(producto);
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
}

//eliminar producto
export async function deleteProducto(req: Request, res: Response) {
    try {
        const producto = await ProductoService.deleteProducto(Number(req.params.id));
        res.status(200).json({ message: "Producto eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
}
