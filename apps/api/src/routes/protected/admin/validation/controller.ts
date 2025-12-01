import { Kyc, KycStatus, Loan, LoanStatus } from '../../../../types';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../../../../lib';
import { filter } from '../../../../utils';
import {
  BorrowCancellationInput,
  BorrowValidationInput,
  KycValidationInput,
  UnblockClientInput,
} from './interfaces';
import { validationService } from './service';

export class ValidationController {
  async getKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        importDate,
        followUpDate,
        userLabel,
        mobile,
        telemarketer,
        whetherApply,
        allocationTime,
        whetherAssigned,
        whetherFollowedUp,
        latestFollowUpPerson,
        appName,
      } = req.query;

      let query = supabase
        .from('customers')
        .select(
          `
          *,
          telemarketers:telemarketer_id (name),
          kyc:kyc (*)
        `,
          { count: 'exact' }
        )
        .eq('type', 'new')
        .not('kyc', 'is', null)
        .eq('kyc.status', KycStatus.PENDING);

      // Appliquer les filtres
      if (importDate) {
        const importDay = new Date(importDate as string);
        query = query
          .gte('created_at', importDay.toISOString())
          .lt(
            'created_at',
            new Date(importDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (followUpDate) {
        const day = new Date(followUpDate as string);
        query = query
          .gte('latest_follow_up_time', day.toISOString())
          .lt(
            'latest_follow_up_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (userLabel) query = query.ilike('user_label', `%${userLabel}%`);
      if (mobile) query = query.ilike('mobile', `%${mobile}%`);
      if (telemarketer)
        query = query.ilike('telemarketers.name', `%${telemarketer}%`);
      if (whetherApply)
        query =
          whetherApply !== 'true'
            ? query.is('whether_apply', null)
            : query.not('whether_apply', 'is', null);
      if (allocationTime) {
        const day = new Date(allocationTime as string);
        query = query
          .gte('allocation_time', day.toISOString())
          .lt(
            'allocation_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (whetherAssigned)
        query =
          whetherAssigned !== 'true'
            ? query.is('telemarketers.name', null)
            : query.not('telemarketers.name', 'is', null);
      if (whetherFollowedUp)
        query =
          whetherFollowedUp === 'true'
            ? query.not('latest_follow_up_time', 'is', null)
            : query.is('latest_follow_up_time', null);
      if (latestFollowUpPerson)
        query = query.ilike('telemarketers.name', `%${latestFollowUpPerson}%`);
      if (appName) query = query.ilike('app_name', `%${appName}%`);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: customers, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        customers?.map((customer) => ({
          id: customer.id,
          mobile: customer.mobile,
          name: customer.name,
          prevRepaymentTime: customer.prev_repayment_time,
          appName: customer.app_name,
          followUpPerson: customer.telemarketers?.name,
          whetherApply: customer.whether_apply,
          appTime: customer.app_time,
          allocationTime: customer.allocation_time,
          latestFollowUpTime: customer.latest_follow_up_time,
          followUpResults: customer.follow_up_results,
          descFollowUp: customer.desc_follow_up,
          whetherAssigned: customer.whether_assigned,
          telemarketer: customer.telemarketers?.name,
          kyc: customer.kyc[0],
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

  async getBorrow(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        importDate,
        followUpDate,
        userLabel,
        mobile,
        telemarketer,
        whetherApply,
        allocationTime,
        whetherAssigned,
        whetherFollowedUp,
        latestFollowUpPerson,
        appName,
      } = req.query;

      const getLoans = async (loanStatus: LoanStatus, qty = 0) => {
        let query = supabase
          .from('customers')
          .select(
            `
          *,
          telemarketers:telemarketer_id (name),
          loans:loans (*),
          kyc:kyc (*)
        `,
            { count: 'exact' }
          )
          .not('loans', 'is', null)
          .not('kyc', 'is', null)
          .eq('kyc.status', KycStatus.SUCCESS)
          .eq('loans.loan_status', loanStatus);

        // Appliquer les filtres
        if (importDate) {
          const importDay = new Date(importDate as string);
          query = query
            .gte('created_at', importDay.toISOString())
            .lt(
              'created_at',
              new Date(importDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
            );
        }
        if (followUpDate) {
          const day = new Date(followUpDate as string);
          query = query
            .gte('latest_follow_up_time', day.toISOString())
            .lt(
              'latest_follow_up_time',
              new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
            );
        }
        if (userLabel) query = query.ilike('user_label', `%${userLabel}%`);
        if (mobile) query = query.ilike('mobile', `%${mobile}%`);
        if (telemarketer)
          query = query.ilike('telemarketers.name', `%${telemarketer}%`);
        if (whetherApply)
          query =
            whetherApply !== 'true'
              ? query.is('whether_apply', null)
              : query.not('whether_apply', 'is', null);
        if (allocationTime) {
          const day = new Date(allocationTime as string);
          query = query
            .gte('allocation_time', day.toISOString())
            .lt(
              'allocation_time',
              new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
            );
        }
        if (whetherAssigned)
          query =
            whetherAssigned !== 'true'
              ? query.is('telemarketers.name', null)
              : query.not('telemarketers.name', 'is', null);
        if (whetherFollowedUp)
          query =
            whetherFollowedUp === 'true'
              ? query.not('latest_follow_up_time', 'is', null)
              : query.is('latest_follow_up_time', null);
        if (latestFollowUpPerson)
          query = query.ilike(
            'telemarketers.name',
            `%${latestFollowUpPerson}%`
          );
        if (appName) query = query.ilike('app_name', `%${appName}%`);

        const total = (await query).count;
        const [from, to] = filter(req.query);
        if (qty >= to - from + 1) return { items: [], total };

        const { data: customers, error } = await query
          .range(from, to - qty)
          .order('id', { ascending: false });

        if (error) throw error;

        const borrowCustomers = customers.filter((customer) =>
          customer.loans.some((loan) => loan.loan_status === LoanStatus.PENDING)
        );
        const cancelBorrowCustomers = customers.filter((customer) =>
          customer.loans.some(
            (loan) => loan.loan_status === LoanStatus.ACCEPTED
          )
        );

        const items =
          [...borrowCustomers, ...cancelBorrowCustomers].map((customer) => ({
            id: customer.id,
            mobile: customer.mobile,
            name: customer.name,
            prevRepaymentTime: customer.prev_repayment_time,
            appName: customer.app_name,
            followUpPerson: customer.telemarketers?.name,
            // followUpPerson: customer.follow_up_person,
            whetherApply: customer.whether_apply,
            appTime: customer.app_time,
            allocationTime: customer.allocation_time,
            latestFollowUpTime: customer.latest_follow_up_time,
            followUpResults: customer.follow_up_results,
            descFollowUp: customer.desc_follow_up,
            whetherAssigned: customer.whether_assigned,
            telemarketer: customer.telemarketers?.name,
            borrow: customer.loans.find(
              (loan) => loan.loan_status === LoanStatus.PENDING
            ),
            cancelBorrow: customer.loans.find(
              (loan) => loan.loan_status === LoanStatus.ACCEPTED
            ),
          })) || [];

        return { items, total };
      };

      const pending = await getLoans(LoanStatus.PENDING);
      const accepted = await getLoans(
        LoanStatus.ACCEPTED,
        pending.items.length
      );

      res.json({
        success: true,
        items: [...pending.items, ...accepted.items],
        total: pending.total + accepted.total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlockedClients(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        importDate,
        followUpDate,
        userLabel,
        mobile,
        telemarketer,
        whetherApply,
        allocationTime,
        whetherAssigned,
        whetherFollowedUp,
        latestFollowUpPerson,
        appName,
      } = req.query;

      let query = supabase
        .from('customers')
        .select(
          `
          *,
          telemarketers:telemarketer_id (name)
        `,
          { count: 'exact' }
        )
        .eq('blocked', true);

      // Appliquer les filtres
      if (importDate) {
        const importDay = new Date(importDate as string);
        query = query
          .gte('created_at', importDay.toISOString())
          .lt(
            'created_at',
            new Date(importDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (followUpDate) {
        const day = new Date(followUpDate as string);
        query = query
          .gte('latest_follow_up_time', day.toISOString())
          .lt(
            'latest_follow_up_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (userLabel) query = query.ilike('user_label', `%${userLabel}%`);
      if (mobile) query = query.ilike('mobile', `%${mobile}%`);
      if (telemarketer)
        query = query.ilike('telemarketers.name', `%${telemarketer}%`);
      if (whetherApply)
        query =
          whetherApply !== 'true'
            ? query.is('whether_apply', null)
            : query.not('whether_apply', 'is', null);
      if (allocationTime) {
        const day = new Date(allocationTime as string);
        query = query
          .gte('allocation_time', day.toISOString())
          .lt(
            'allocation_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (whetherAssigned)
        query =
          whetherAssigned !== 'true'
            ? query.is('telemarketers.name', null)
            : query.not('telemarketers.name', 'is', null);
      if (whetherFollowedUp)
        query =
          whetherFollowedUp === 'true'
            ? query.not('latest_follow_up_time', 'is', null)
            : query.is('latest_follow_up_time', null);
      if (latestFollowUpPerson)
        query = query.ilike('telemarketers.name', `%${latestFollowUpPerson}%`);
      if (appName) query = query.ilike('app_name', `%${appName}%`);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: customers, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        customers?.map((customer) => ({
          id: customer.id,
          mobile: customer.mobile,
          name: customer.name,
          prevRepaymentTime: customer.prev_repayment_time,
          appName: customer.app_name,
          followUpPerson: customer.telemarketers?.name,
          whetherApply: customer.whether_apply,
          appTime: customer.app_time,
          allocationTime: customer.allocation_time,
          latestFollowUpTime: customer.latest_follow_up_time,
          followUpResults: customer.follow_up_results,
          descFollowUp: customer.desc_follow_up,
          whetherAssigned: customer.whether_assigned,
          telemarketer: customer.telemarketers?.name,
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

  async postKycValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const input: KycValidationInput = req.body;

      const result = await validationService.kycValidation(input);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async postBorrowValidation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const input: BorrowValidationInput = req.body;

      const result = await validationService.borrowValidation(input);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async postUnblockClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const input: UnblockClientInput = req.body;

      const result = await validationService.unblockClient(input);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async postBorrowCancellation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const input: BorrowCancellationInput = req.body;

      const result = await validationService.borrowCancellation(input);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }
}
