import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { SubmitInput } from './interfaces';
import { pixPayService } from './service';

export class PixPayController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pixPayService.submit(req.body as SubmitInput);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }
}
