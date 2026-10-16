import 'dotenv/config';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import publicMessagesHandler from './api/public-messages';
import unlockJourneyHandler from './api/unlock-journey';
import adminHandler from './api/admin';

function apiDevMiddleware(): Plugin {
  const handlerMiddleware = async (req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0];
    if (
      url === '/api/public-messages' ||
      url === '/api/unlock-journey' ||
      url === '/api/admin'
    ) {
      try {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            req.body = {};
          }
        }

        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        if (url === '/api/public-messages') {
          await publicMessagesHandler(req, res);
        } else if (url === '/api/unlock-journey') {
          await unlockJourneyHandler(req, res);
        } else if (url === '/api/admin') {
          await adminHandler(req, res);
        }
        return;
      } catch (err: any) {
        console.error('API Middleware Error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        return;
      }
    }
    next();
  };

  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(handlerMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handlerMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
});
