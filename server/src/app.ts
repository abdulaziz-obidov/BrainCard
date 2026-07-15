import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRoutes from './routes/api.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api/v1', apiRoutes);
app.use(errorHandler);

export default app;
