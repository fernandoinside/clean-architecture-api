
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
  console.log('Conectado ao Redis!');
});

redisClient.on('error', (err) => {
  console.error('Erro de conexão com o Redis:', err);
});

export default redisClient;
