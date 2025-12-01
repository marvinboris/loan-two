import { TradingStatus } from '../../../../types';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../../../../lib';
import { filter } from '../../../../utils';

export class FinancialController {
  async getRepaymentInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        mobile,
        name,
        daysOverdue,
        repaymentCodeVaLink,
        tradingStatus,
        paymentChannel,
        repayment,
        creationTime,
        paybackTime,
        loanNumber,
        repaymentNumber,
        collector,
        paymentCompanySerialNumber,
        numPayment,
        product,
      } = req.query;

      // Construire la requête avec jointures
      let query = supabase.from('repayments').select(
        `
          *,
          loans:loan_id!inner (
            *,
            customers:customer_id!inner (
              name,
              mobile
            ),
            collectors:collector_id (name)
          )
        `,
        { count: 'exact' }
      );

      // Appliquer les filtres
      if (mobile) query = query.ilike('loans.customers.mobile', `%${mobile}%`);
      if (name) query = query.ilike('loans.customers.name', `%${name}%`);
      if (daysOverdue)
        query = query.eq('loans.days_overdue', +(daysOverdue as string));
      if (repaymentCodeVaLink)
        query = query.ilike(
          'repayment_code_va_link',
          `%${repaymentCodeVaLink}%`
        );
      if (tradingStatus)
        query = query.eq(
          'trading_status',
          tradingStatus as string as TradingStatus
        );
      if (paymentChannel)
        query = query.eq('payment_channel', `%${paymentChannel}%`);
      if (repayment) query = query.eq('repayment_amount', +`${repayment}`);
      if (creationTime) {
        const day = new Date(creationTime as string);
        query = query
          .gte('creation_time', day.toISOString())
          .lt(
            'creation_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (paybackTime) {
        const day = new Date(paybackTime as string);
        query = query
          .gte('payback_time', day.toISOString())
          .lt(
            'payback_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (loanNumber)
        query = query.ilike('loans.loan_number', `%${loanNumber}%`);
      if (repaymentNumber)
        query = query.ilike('repayment_number', `%${repaymentNumber}%`);
      if (collector)
        query = query.ilike('loans.collectors.name', `%${collector}%`);
      if (paymentCompanySerialNumber)
        query = query.ilike(
          'payment_company_serial_number',
          `%${paymentCompanySerialNumber}%`
        );
      if (product) query = query.ilike('loans.product_name', `%${product}%`);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: repayments, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        repayments?.map((repayment) => ({
          id: repayment.id,
          repaymentNum: repayment.repayment_number,
          loanNum: repayment.loans?.loan_number,
          product: repayment.loans?.product_name,
          name: repayment.loans?.customers?.name,
          mobile: repayment.loans?.customers?.mobile,
          tradingStatus: repayment.trading_status,
          repaymentCodeVaLink: repayment.repayment_code_va_link,
          repaymentAmt: repayment.repayment_amount,
          realAmt: repayment.real_amount,
          latestFollowUpTime: repayment.latest_follow_up_time,
          followUpResults: repayment.follow_up_results,
          descFollowUp: repayment.desc_follow_up,
          whetherAssigned: repayment.whether_assigned,
        })) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLoanInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        mobile,
        name,
        daysOverdue,
        repaymentCodeVaLink,
        tradingStatus,
        paymentChannel,
        repayment,
        creationTime,
        paybackTime,
        loanNumber,
        repaymentNumber,
        collector,
        paymentCompanySerialNumber,
        numPayment,
        product,
      } = req.query;

      // Construire la requête avec jointures
      let query = supabase.from('loans').select(
        `
          *,
          customers:customer_id!inner (name, mobile),
          collectors:collector_id (name),
          repayments:repayments (*)
        `,
        { count: 'exact' }
      );

      // Appliquer les filtres
      if (mobile) query = query.ilike('customers.mobile', `%${mobile}%`);
      if (name) query = query.ilike('customers.name', `%${name}%`);
      if (daysOverdue)
        query = query.eq('days_overdue', +(daysOverdue as string));
      if (repaymentCodeVaLink)
        query = query.ilike(
          'repayments.repayment_code_va_link',
          `%${repaymentCodeVaLink}%`
        );
      if (tradingStatus)
        query = query.eq(
          'repayments.trading_status',
          tradingStatus as string as TradingStatus
        );
      if (paymentChannel)
        query = query.eq('repayments.payment_channel', `%${paymentChannel}%`);

      if (repayment)
        query = query.eq('repayments.repayment_amount', +`${repayment}`);
      if (creationTime) {
        const day = new Date(creationTime as string);
        query = query
          .gte('repayments.creation_time', day.toISOString())
          .lt(
            'repayments.creation_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (paybackTime) {
        const day = new Date(paybackTime as string);
        query = query
          .gte('repayments.payback_time', day.toISOString())
          .lt(
            'repayments.payback_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (loanNumber) query = query.ilike('loan_number', `%${loanNumber}%`);
      if (repaymentNumber)
        query = query.ilike(
          'repayments.repayment_number',
          `%${repaymentNumber}%`
        );
      if (collector) query = query.ilike('collectors.name', `%${collector}%`);
      if (paymentCompanySerialNumber)
        query = query.eq(
          'repayments.payment_company_serial_number',
          `%${paymentCompanySerialNumber}%`
        );
      if (product) query = query.ilike('product_name', `%${product}%`);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: loans, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      // Aplatir les données pour chaque remboursement
      const items =
        loans?.flatMap(
          (loan) =>
            loan.repayments?.map((repayment) => ({
              id: repayment.id,
              repaymentNum: repayment.repayment_number,
              loanNum: loan.loan_number,
              product: loan.product_name,
              name: loan.customers?.name,
              mobile: loan.customers?.mobile,
              tradingStatus: repayment.trading_status,
              repaymentCodeVaLink: repayment.repayment_code_va_link,
              repaymentAmt: repayment.repayment_amount,
              realAmt: repayment.real_amount,
              latestFollowUpTime: repayment.latest_follow_up_time,
              followUpResults: repayment.follow_up_results,
              descFollowUp: repayment.desc_follow_up,
              whetherAssigned: repayment.whether_assigned,
            })) || []
        ) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { mobile, loanNum, masterLoanNum } = req.query;

      // Construire la requête avec jointures
      let query = supabase.from('repayments').select(
        `
          *,
          loans:loan_id (
            *,
            customers:customer_id (name, mobile)
          )
        `,
        { count: 'exact' }
      );

      // Appliquer les filtres
      if (mobile) query = query.eq('loans.customer.mobile', mobile);
      if (loanNum) query = query.eq('loans.loan_number', loanNum as string);
      if (masterLoanNum)
        query = query.eq('loans.master_loan_number', masterLoanNum);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: repayments, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        repayments?.map((repayment) => ({
          id: repayment.id,
          repaymentNum: repayment.repayment_number,
          loanNum: repayment.loans?.loan_number,
          product: repayment.loans?.product_name,
          name: repayment.loans?.customers?.name,
          mobile: repayment.loans?.customers?.mobile,
          tradingStatus: repayment.trading_status,
          repaymentCodeVaLink: repayment.repayment_code_va_link,
          repaymentAmt: repayment.repayment_amount,
          realAmt: repayment.real_amount,
          latestFollowUpTime: repayment.latest_follow_up_time,
          followUpResults: repayment.follow_up_results,
          descFollowUp: repayment.desc_follow_up,
          whetherAssigned: repayment.whether_assigned,
        })) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Construire la requête avec jointures
      let query = supabase.from('transactions').select(
        `
          *
        `,
        { count: 'exact' }
      );

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: transactions, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items = transactions || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }
}
