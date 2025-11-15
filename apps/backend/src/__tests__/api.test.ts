import { describe, test, expect } from 'vitest';
import app from '../app';

describe('API Endpoints', () => {
  test('GET / - returns API info', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('message', 'Task Manager API');
    expect(data).toHaveProperty('version', '1.0.0');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('timestamp');
  });

  test('GET /health - returns health status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('database', 'connected');
    expect(data).toHaveProperty('timestamp');
  });

  test('GET /nonexistent - returns 404', async () => {
    const res = await app.request('/nonexistent');
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data).toHaveProperty('error', 'Not Found');
    expect(data).toHaveProperty('path', '/nonexistent');
  });
});