import { env } from './config/env.config.js';
import { app, serviceManager, bookingManager } from './app.js';

app.listen(env.port, () => {
  console.log(`Manada Servicios iniciado en http://localhost:${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
  console.log(`Servicios cargados: ${serviceManager.getServices().length}`);
  console.log(`Reservas cargadas: ${bookingManager.bookings.length}`);
});
