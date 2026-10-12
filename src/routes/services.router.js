import express from 'express';

export const createServicesRouter = (serviceManager) => {
  const router = express.Router();

  router.get('/', (request, response) => {
    response.json(serviceManager.getServices({
      category: request.query.category,
      available: request.query.available,
      search: request.query.search,
    }));
  });

  router.post('/', (request, response) => {
    response.status(201).json(serviceManager.addService(request.body));
  });

  router.get('/:sid', (request, response) => {
    const service = serviceManager.getServiceById(request.params.sid);
    response.status(service ? 200 : 404).json(service ?? { error: 'Servicio no encontrado.' });
  });

  router.put('/:sid', (request, response) => {
    const service = serviceManager.updateService(request.params.sid, request.body);
    response.status(service ? 200 : 404).json(service ?? { error: 'Servicio no encontrado.' });
  });

  router.delete('/:sid', (request, response) => {
    const service = serviceManager.deleteService(request.params.sid);
    response.status(service ? 200 : 404).json(service ?? { error: 'Servicio no encontrado.' });
  });

  return router;
};
