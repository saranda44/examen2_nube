import { DomicilioModel } from "../models/domicilio.model";

export const DomiciliosService = {
    getAllDomicilios,
    getDomicilioById,
    getDomiciliosByCliente,
    createDomicilio,
    updateDomicilio,
    deleteDomicilio
};

async function getAllDomicilios(){
    return await DomicilioModel.findAll();
}

async function getDomicilioById(id: number){
    return await DomicilioModel.findById(id);
}

async function getDomiciliosByCliente(cliente_id: number){
    return await DomicilioModel.findByIdCliente(cliente_id);
}

async function createDomicilio(domicilio: any){
    return await DomicilioModel.create(domicilio);
}

async function updateDomicilio(id: number, domicilio: any){
    return await DomicilioModel.update(id, domicilio);
}

async function deleteDomicilio(id: number){
    return await DomicilioModel.remove(id);
}

