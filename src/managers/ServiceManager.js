import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const defaultDataPath = resolve(currentDirectory, '../data/services.json');

export class ServiceManager {
  constructor(dataPath = defaultDataPath) {
    this.dataPath = resolve(dataPath);
    this.services = this.#loadServices();
  }

  getServices(filters = {}) {
    const { category, available, search } = filters;
    const normalizedSearch = search?.toLowerCase().trim();

    return this.services.filter((service) => {
      const matchesCategory = category
        ? service.category.toLowerCase() === category.toLowerCase()
        : true;
      const matchesAvailable = available === undefined
        ? true
        : service.available === (available === true || available === 'true');
      const matchesSearch = normalizedSearch
        ? [service.name, service.description, service.category]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesCategory && matchesAvailable && matchesSearch;
    });
  }

  getServiceById(id) {
    return this.services.find((service) => service.id === id) ?? null;
  }

  addService(serviceData) {
    if (serviceData?.id !== undefined) {
      throw new Error('El id se genera automáticamente y no debe enviarse al agregar un servicio.');
    }

    const service = this.#normalizeService(serviceData);
    const newService = {
      id: this.#nextId(),
      ...service,
    };

    this.services.push(newService);
    this.#saveServices();
    return newService;
  }

  updateService(id, updatedData) {
    const index = this.services.findIndex((service) => service.id === id);

    if (index === -1) {
      return null;
    }

    if (updatedData?.id !== undefined && updatedData.id !== id) {
      throw new Error('El id de un servicio no se puede modificar.');
    }

    const updatedService = this.#normalizeService({
      ...this.services[index],
      ...updatedData,
      id,
    });

    this.services[index] = { id, ...updatedService };
    this.#saveServices();
    return this.services[index];
  }

  deleteService(id) {
    const deletedService = this.getServiceById(id);

    if (!deletedService) {
      return null;
    }

    this.services = this.services.filter((service) => service.id !== id);
    this.#saveServices();
    return deletedService;
  }

  #loadServices() {
    if (!existsSync(this.dataPath)) {
      throw new Error(`No se encontró el archivo de servicios: ${this.dataPath}`);
    }

    try {
      const content = readFileSync(this.dataPath, 'utf8');
      const services = JSON.parse(content);

      if (!Array.isArray(services)) {
        throw new Error('El archivo debe contener un array de servicios.');
      }

      return services;
    } catch (error) {
      throw new Error(`No se pudo cargar el catálogo de servicios: ${error.message}`);
    }
  }

  #saveServices() {
    writeFileSync(this.dataPath, `${JSON.stringify(this.services, null, 2)}\n`, 'utf8');
  }

  #normalizeService(service) {
    if (!service || typeof service !== 'object') {
      throw new Error('Los datos del servicio son obligatorios.');
    }

    const requiredFields = [
      'name',
      'description',
      'duration',
      'price',
      'category',
      'available',
    ];
    const missingFields = requiredFields.filter(
      (field) => service[field] === undefined || service[field] === null
    );

    if (missingFields.length > 0) {
      throw new Error(`Faltan propiedades obligatorias: ${missingFields.join(', ')}.`);
    }

    const normalized = {
      name: service.name?.trim(),
      description: service.description?.trim(),
      category: service.category?.trim(),
      price: Number(service.price),
      duration: Number(service.duration),
      available: service.available,
    };

    if (!normalized.name || !normalized.description || !normalized.category) {
      throw new Error('name, description y category no pueden estar vacíos.');
    }

    if (!Number.isFinite(normalized.price) || normalized.price < 0) {
      throw new Error('El precio del servicio debe ser un número mayor o igual a 0.');
    }

    if (!Number.isInteger(normalized.duration) || normalized.duration <= 0) {
      throw new Error('La duración debe ser un número entero mayor a 0.');
    }

    if (typeof normalized.available !== 'boolean') {
      throw new Error('available debe ser un valor booleano.');
    }

    return normalized;
  }

  #nextId() {
    const numericIds = this.services
      .map((service) => Number.parseInt(String(service.id).replace(/^service-/, ''), 10))
      .filter(Number.isInteger);
    const nextNumber = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

    return `service-${nextNumber}`;
  }
}
