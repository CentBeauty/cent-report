import { createClient } from 'redis';

export async function connectRedis() {
  const client = createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  return client;
}

export async function set(key: string, value: string, expiredAt: number) {
  const client = await connectRedis();
  await client.set(key, value, {
    EX: expiredAt,
  });
  await client.disconnect();
}
export async function get(key: string) {
  const client = await connectRedis();
  const value = await client.get(key);
  await client.disconnect();
  return value;
}

export async function deleteKey(key: string) {
  const client = await connectRedis();
  await client.del(key);
  await client.disconnect();
}
