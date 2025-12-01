import express from 'express';
import { PixPayController } from './controller';

const pixPayRouter = express.Router();

const pixPayController = new PixPayController();

pixPayRouter.post('/', pixPayController.submit);

export { pixPayRouter };
