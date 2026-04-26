import { ClienteModel } from "../models/cliente.model";

export const ClienteService = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};

async function getAllClientes() {
    return await ClienteModel.findAll();
}

async function getClienteById(id: number) {
    return await ClienteModel.findById(id);
}

async function createCliente(cliente: any) {
    return await ClienteModel.create(cliente);
}

async function updateCliente(id: number, cliente: any) {
    return await ClienteModel.update(id, cliente);
}

async function deleteCliente(id: number) {
    return await ClienteModel.remove(id);
}

