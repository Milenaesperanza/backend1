import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ServiceManager } from './ServiceManager.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const defaultDataPath = resolve(currentDirectory, '../data/bookings.json');

export class BookingManager {
  constructor(dataPath = defaultDataPath, serviceManager = new ServiceManager()) {
    this.dataPath = resolve(dataPath);
    this.serviceManager = serviceManager;
    this.bookings = this.#loadBookings();
  }

  createBooking(bookingData) {
    if (bookingData?.id !== undefined) {
      throw new Error('El id se genera automáticamente y no debe enviarse al crear una reserva.');
    }

    const booking = this.#normalizeBooking(bookingData);
    const newBooking = { id: this.#nextId(), ...booking };
    this.bookings.push(newBooking);
    this.#saveBookings();
    return newBooking;
  }

  getBookingById(id) {
    return this.bookings.find((booking) => booking.id === id) ?? null;
  }

  addServiceToBooking(bookingId, serviceId) {
    const booking = this.getBookingById(bookingId);
    if (!booking || !this.serviceManager.getServiceById(serviceId)) return null;

    const bookingService = booking.services.find((item) => item.service === serviceId);
    if (bookingService) bookingService.quantity += 1;
    else booking.services.push({ service: serviceId, quantity: 1 });

    this.#saveBookings();
    return booking;
  }

  #loadBookings() {
    if (!existsSync(this.dataPath)) {
      throw new Error(`No se encontró el archivo de reservas: ${this.dataPath}`);
    }

    try {
      const bookings = JSON.parse(readFileSync(this.dataPath, 'utf8'));
      if (!Array.isArray(bookings)) throw new Error('El archivo debe contener un array de reservas.');
      return bookings;
    } catch (error) {
      throw new Error(`No se pudieron cargar las reservas: ${error.message}`);
    }
  }

  #saveBookings() {
    writeFileSync(this.dataPath, `${JSON.stringify(this.bookings, null, 2)}\n`, 'utf8');
  }

  #normalizeBooking(booking) {
    if (!booking || typeof booking !== 'object') {
      throw new Error('Los datos de la reserva son obligatorios.');
    }

    const requiredFields = ['clientName', 'clientEmail', 'date', 'time', 'status'];
    const missingFields = requiredFields.filter(
      (field) => booking[field] === undefined || booking[field] === null
    );
    if (missingFields.length > 0) {
      throw new Error(`Faltan propiedades obligatorias: ${missingFields.join(', ')}.`);
    }

    const normalized = {
      clientName: this.#requiredText(booking.clientName, 'clientName'),
      clientEmail: this.#requiredText(booking.clientEmail, 'clientEmail'),
      date: this.#requiredText(booking.date, 'date'),
      time: this.#requiredText(booking.time, 'time'),
      status: this.#requiredText(booking.status, 'status'),
      services: booking.services ?? [],
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.clientEmail)) {
      throw new Error('clientEmail debe ser un email válido.');
    }
    if (!Array.isArray(normalized.services)) throw new Error('services debe ser un array.');
    normalized.services = this.#normalizeServices(normalized.services);
    return normalized;
  }

  #normalizeServices(services) {
    const normalizedServices = [];
    for (const item of services) {
      if (!item || typeof item !== 'object' || typeof item.service !== 'string') {
        throw new Error('Cada servicio de una reserva debe tener un id en service.');
      }
      if (!this.serviceManager.getServiceById(item.service)) {
        throw new Error(`El servicio ${item.service} no existe.`);
      }
      const quantity = item.quantity ?? 1;
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('La quantity de un servicio debe ser un entero mayor a 0.');
      }

      const existing = normalizedServices.find((service) => service.service === item.service);
      if (existing) existing.quantity += quantity;
      else normalizedServices.push({ service: item.service, quantity });
    }
    return normalizedServices;
  }

  #requiredText(value, field) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${field} debe ser un texto no vacío.`);
    }
    return value.trim();
  }

  #nextId() {
    const numericIds = this.bookings
      .map((booking) => Number.parseInt(String(booking.id).replace(/^booking-/, ''), 10))
      .filter(Number.isInteger);
    const nextNumber = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    return `booking-${nextNumber}`;
  }
}
