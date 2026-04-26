import { Request, Response } from "express";
import { ClienteService } from "../services/clientes.service";

//obtener todos lo clientes
export async function getClientes(req: Request, res: Response) {
    try {
        const clientes = await ClienteService.getAllClientes();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los clientes" });
    }
}

//obtener un cliente por su id
export async function getClienteById(req: Request, res: Response) {
    try {
        const cliente = await ClienteService.getClienteById(Number(req.params.id));
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el cliente" });
    }
}

//crear cliente
export async function createCliente(req: Request, res: Response) {
    try {
        const cliente = await ClienteService.createCliente(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el cliente" });
    }
}

//actualizar cliente
export async function updateCliente(req: Request, res: Response) {
    try {
        const cliente = await ClienteService.updateCliente(Number(req.params.id), req.body);
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el cliente" });
    }
}

//eliminar cliente
export async function deleteCliente(req: Request, res: Response) {
    try {
        await ClienteService.deleteCliente(Number(req.params.id));
        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el cliente" });
    }
}
