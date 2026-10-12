import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ServiceManager } from '../src/managers/ServiceManager.js';

let temporaryDirectory;
let dataPath;
let manager;

const validService = {
  name: 'Baño de prueba',
  description: 'Servicio de higiene para mascotas',
  duration: 60,
  price: 15000,
  category: 'peluqueria',
  available: true,
};

describe('ServiceManager', () => {
  beforeEach(() => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'manada-servicios-'));
    dataPath = join(temporaryDirectory, 'services.json');
    writeFileSync(dataPath, '[]\n', 'utf8');
    manager = new ServiceManager(dataPath);
  });

  afterEach(() => {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('devuelve todos los servicios', () => {
    assert.deepEqual(manager.getServices(), []);
  });

  it('agrega un servicio y genera el id internamente', () => {
    const service = manager.addService(validService);

    assert.equal(service.id, 'service-1');
    assert.deepEqual(manager.getServiceById('service-1'), service);
  });

  it('rechaza un id recibido desde addService', () => {
    assert.throws(
      () => manager.addService({ ...validService, id: 'externo' }),
      /El id se genera automáticamente/
    );
  });

  it('rechaza servicios incompletos', () => {
    const incompleteService = { ...validService };
    delete incompleteService.description;

    assert.throws(
      () => manager.addService(incompleteService),
      /Faltan propiedades obligatorias: description/
    );
  });

  it('devuelve null cuando no encuentra un servicio', () => {
    assert.equal(manager.getServiceById('service-404'), null);
  });

  it('actualiza un servicio sin modificar su id', () => {
    const service = manager.addService(validService);
    const updatedService = manager.updateService(service.id, {
      price: 18000,
      available: false,
    });

    assert.equal(updatedService.id, service.id);
    assert.equal(updatedService.price, 18000);
    assert.equal(updatedService.available, false);
  });

  it('rechaza la modificación del id', () => {
    const service = manager.addService(validService);

    assert.throws(
      () => manager.updateService(service.id, { id: 'service-99' }),
      /no se puede modificar/
    );
  });

  it('devuelve null al actualizar un servicio inexistente', () => {
    assert.equal(manager.updateService('service-404', { price: 1000 }), null);
  });

  it('elimina un servicio y devuelve null si ya no existe', () => {
    const service = manager.addService(validService);

    assert.deepEqual(manager.deleteService(service.id), service);
    assert.equal(manager.deleteService(service.id), null);
    assert.equal(manager.getServices().length, 0);
  });

  it('persiste los cambios en services.json', () => {
    const service = manager.addService(validService);
    const savedServices = JSON.parse(readFileSync(dataPath, 'utf8'));

    assert.deepEqual(savedServices, [service]);
  });
});
