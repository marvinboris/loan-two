import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { supabase } from '../../../../lib';
import { Loan } from '../../../../types';
import { calculatePenalty } from '../../../../utils';

export class ApplicationsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select()
        .eq('customer_id', req.user.id)
        .order('id', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: data.map((item) => {
          const penalty = calculatePenalty(item as Loan);

          return { ...item, penalty };
        }),
      });
    } catch (error) {
      next(error);
    }
  }
}
