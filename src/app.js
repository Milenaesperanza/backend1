import express from 'express';
import { ServiceManager } from './managers/ServiceManager.js';
import { createServicesRouter } from './routes/services.router.js';

export const createApp = (serviceManager = new ServiceManager()) => {
  const app = express();

  app.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    next();
  });

  app.use(express.json());

  app.use('/api/services', createServicesRouter(serviceManager));

  app.use('/api/services', (request, response) => {
    response.status(405).json({ error: 'Método no permitido.' });
  });

  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      response.status(400).json({ error: 'El cuerpo de la solicitud debe contener JSON válido.' });
      return;
    }

    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(400).json({ error: error.message });
  });

  return app;
};

export const serviceManager = new ServiceManager();
export const app = createApp(serviceManager);
