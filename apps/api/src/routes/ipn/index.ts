import express from 'express';
import { pixPayRouter } from './pix-pay';

const ipnRouter = express.Router();

ipnRouter.use('/pix-pay', pixPayRouter);

export { ipnRouter };
