import { createServer } from 'node:http';
import { env } from './config/env.config.js';
import { ServiceManager } from './managers/ServiceManager.js';

const serviceManager = new ServiceManager();

const sendJson = (response, statusCode, data) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(data));
};

const readRequestBody = async (request) => {
  let body = '';

  for await (const chunk of request) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (requestUrl.pathname === '/api/services') {
      if (request.method === 'GET') {
        const services = serviceManager.getServices({
          category: requestUrl.searchParams.get('category') || undefined,
          available: requestUrl.searchParams.has('available')
            ? requestUrl.searchParams.get('available')
            : undefined,
          search: requestUrl.searchParams.get('search') || undefined,
        });
        sendJson(response, 200, services);
        return;
      }

      if (request.method === 'POST') {
        const service = serviceManager.addService(await readRequestBody(request));
        sendJson(response, 201, service);
        return;
      }
    }

    const serviceMatch = requestUrl.pathname.match(/^\/api\/services\/([^/]+)$/);

    if (serviceMatch) {
      const id = decodeURIComponent(serviceMatch[1]);

      if (request.method === 'GET') {
        const service = serviceManager.getServiceById(id);
        sendJson(response, service ? 200 : 404, service ?? { error: 'Servicio no encontrado.' });
        return;
      }

      if (request.method === 'PATCH') {
        const service = serviceManager.updateService(id, await readRequestBody(request));
        sendJson(response, service ? 200 : 404, service ?? { error: 'Servicio no encontrado.' });
        return;
      }

      if (request.method === 'DELETE') {
        const service = serviceManager.deleteService(id);
        sendJson(response, service ? 200 : 404, service ?? { error: 'Servicio no encontrado.' });
        return;
      }
    }

    sendJson(response, 405, { error: 'Método no permitido.' });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
});

server.listen(env.port, () => {
  console.log(`Manada Servicios iniciado en http://localhost:${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
  console.log(`Servicios cargados: ${serviceManager.getServices().length}`);
});

export { serviceManager };
