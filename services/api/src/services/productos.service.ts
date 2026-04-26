import { ProductoModel } from "../models/producto.model";

export const ProductoService = {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
};

async function getAllProductos(){
    return await ProductoModel.findAll();
}

async function getProductoById(id: number){
    return await ProductoModel.findById(id);
}

async function createProducto(producto: any){
    return await ProductoModel.create(producto);
}

async function updateProducto(id: number, producto: any){
    return await ProductoModel.update(id, producto);
}

async function deleteProducto(id: number){
    return await ProductoModel.remove(id);
}
