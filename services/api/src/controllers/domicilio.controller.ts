import { Request, Response } from "express";
import { DomiciliosService } from "../services/domicilio.service";
import { ClienteService } from "../services/clientes.service";

//obtener todos lo domicilios
export async function getDomicilios(req: Request, res: Response) {
    try {
        const domicilios = await DomiciliosService.getAllDomicilios();
        res.json(domicilios);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener los domicilios" });
    }
}

//obtener un domicilio por su id
export async function getDomicilioById(req: Request, res: Response) {
    try {
        const domicilio = await DomiciliosService.getDomicilioById(Number(req.params.id));
        res.json(domicilio);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el domicilio" });
    }
}

//obtener los domicilios de un cliente
export async function getDomiciliosByCliente(req: Request, res: Response) {
    try {
        //primero verificamos que el cliente exista, si no existe, no tiene sentido buscar sus domicilios
        const cliente = await ClienteService.getClienteById(Number(req.params.id));
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const domicilios = await DomiciliosService.getDomiciliosByCliente(Number(req.params.id));
        res.json(domicilios);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los domicilios del cliente" });
    }
}

//crear domicilio
export async function createDomicilio(req: Request, res: Response) {
    try {
        //verificar que el cliente exista antes de crear un domicilio para ese cliente
        const cliente = await ClienteService.getClienteById(Number(req.body.cliente_id));
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado, no se puede crear domicilio" });
        }
        const domicilio = await DomiciliosService.createDomicilio(req.body);
        res.json(domicilio);
    }
    catch (error) {
        res.status(500).json({ message: "Error al crear el domicilio" });
    }
}

//actualizar domicilio
export async function updateDomicilio(req: Request, res: Response) {
    try {
        const domicilio = await DomiciliosService.updateDomicilio(Number(req.params.id), req.body);
        res.json(domicilio);
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar el domicilio" });
    }
}

//eliminar domicilio
export async function deleteDomicilio(req: Request, res: Response) {
    try {
        await DomiciliosService.deleteDomicilio(Number(req.params.id));
        res.json({ message: "Domicilio eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el domicilio" });
    }
}
