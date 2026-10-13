import express from 'express';

export const createBookingsRouter = (bookingManager) => {
  const router = express.Router();

  router.post('/', (request, response) => {
    response.status(201).json(bookingManager.createBooking(request.body));
  });

  router.get('/:bid', (request, response) => {
    const booking = bookingManager.getBookingById(request.params.bid);
    response.status(booking ? 200 : 404).json(booking ?? { error: 'Reserva no encontrada.' });
  });

  router.post('/:bid/services/:sid', (request, response) => {
    const booking = bookingManager.addServiceToBooking(request.params.bid, request.params.sid);
    response.status(booking ? 200 : 404).json(
      booking ?? { error: 'La reserva o el servicio no existe.' }
    );
  });

  return router;
};
