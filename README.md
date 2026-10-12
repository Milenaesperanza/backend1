# Manada Servicios

Aplicación Node.js con ESM para gestionar los servicios de Manada PetShop dentro de un sistema de turnos y reservas.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo `.env` a partir de `.env.example` y completar sus valores. El proyecto ya incluye un `.env` local para desarrollo.

## Ejecución

Para ejecutar la aplicación:

```bash
npm start
```

Para ejecutarla en modo desarrollo, reiniciando Node.js cuando cambian los archivos:

```bash
npm run dev
```

Para ejecutar las pruebas del `ServiceManager`:

```bash
npm test
```

Las pruebas se ejecutan sobre archivos temporales para no modificar el catálogo real de `src/data/services.json`.

## Variables de entorno

La aplicación requiere estas variables:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto de ejecución de la aplicación | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |

Si falta alguna variable o `PORT` no es un número válido entre 1 y 65535, la aplicación se detiene con un mensaje claro.

## Recurso `services`

El catálogo se persiste en `src/data/services.json`. Actualmente contiene los 91 servicios de la hoja `Servicios` del archivo `manada_catalogo_servicios.xlsx`. Cada servicio tiene esta estructura:

```json
{
  "id": "service-1",
  "name": "Baño y corte",
  "description": "Servicio de higiene para mascotas",
  "duration": 60,
  "price": 15000,
  "category": "Higiene",
  "available": true
}
```

- `id`: identificador único generado automáticamente.
- `name`: nombre del servicio.
- `description`: descripción del servicio.
- `duration`: duración en minutos.
- `price`: precio del servicio.
- `category`: categoría del servicio.
- `available`: indica si el servicio está disponible para reservar.

La importación utiliza las columnas `ID`, `Servicio`, `Descripción`, `Duración (min)`, `Precio (ARS)`, `Categoría` y `Disponible`. Los IDs numéricos del Excel se normalizan al formato `service-1`, `service-2`, etc. Las hojas `Profesionales` y `Categorías` quedan disponibles para futuros recursos de la API.

## Uso de `ServiceManager`

```js
import { ServiceManager } from './src/managers/ServiceManager.js';

const serviceManager = new ServiceManager();
```

### Obtener todos los servicios

```js
const services = serviceManager.getServices();
```

También permite filtrar por categoría, disponibilidad o texto de búsqueda:

```js
const availableHygieneServices = serviceManager.getServices({
  category: 'Higiene',
  available: true,
  search: 'baño'
});
```

### Obtener un servicio por ID

```js
const service = serviceManager.getServiceById('service-1');
// Devuelve el servicio o null si no existe.
```

### Agregar un servicio

El `id` no se envía: se genera automáticamente. Son obligatorios `name`, `description`, `duration`, `price`, `category` y `available`.

```js
const newService = serviceManager.addService({
  name: 'Baño y corte',
  description: 'Servicio de higiene para mascotas',
  duration: 60,
  price: 15000,
  category: 'Higiene',
  available: true
});
```

Si faltan datos obligatorios o se envía un `id`, el método devuelve un error.

### Actualizar un servicio

```js
const updatedService = serviceManager.updateService('service-1', {
  price: 18000,
  available: false
});
```

El `id` se conserva y no se puede modificar. El método devuelve `null` si el servicio no existe.

### Eliminar un servicio

```js
const deletedService = serviceManager.deleteService('service-1');
```

El método devuelve el servicio eliminado o `null` si no existe.

## Arquitectura

- `src/config/env.config.js`: carga y valida las variables de entorno.
- `src/managers/ServiceManager.js`: gestiona el catálogo de servicios.
- `src/routes/services.router.js`: define las rutas HTTP del recurso `services`.
- `src/data/services.json`: persistencia inicial del recurso `services`.
- `src/app.js`: configura la aplicación Express y sus rutas.
- `src/server.js`: inicia el servidor HTTP.
Al ejecutar la aplicación, la API queda disponible en `http://localhost:8080` con estas rutas HTTP:

- `GET /api/services`: lista y filtra servicios.
- `GET /api/services/:id`: obtiene un servicio.
- `POST /api/services`: agrega un servicio.
- `PUT /api/services/:id`: actualiza un servicio.
- `DELETE /api/services/:id`: elimina un servicio.
