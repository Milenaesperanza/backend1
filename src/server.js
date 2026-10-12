import { env } from './config/env.config.js';
import { app, serviceManager } from './app.js';

app.listen(env.port, () => {
  console.log(`Manada Servicios iniciado en http://localhost:${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
  console.log(`Servicios cargados: ${serviceManager.getServices().length}`);
});
