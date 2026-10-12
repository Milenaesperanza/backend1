import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['PORT', 'NODE_ENV'];
const missingVariables = requiredVariables.filter((variable) => {
  const value = process.env[variable];
  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missingVariables.join(', ')}. ` +
      'Revisá el archivo .env.'
  );
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('La variable PORT debe ser un número entero entre 1 y 65535.');
}

export const env = Object.freeze({
  port,
  nodeEnv: process.env.NODE_ENV,
});
