import {
  ConnectionStatus,
  LoanStatus,
  WillingnessToPay,
} from '../../../../types';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import moment from 'moment';
import { supabase } from '../../../../lib';
import { filter } from '../../../../utils';
import { DistributionInput } from './interfaces';
import { collectionService } from './service';

export class CollectionController {
  async getMonthlyPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { group, date, status } = req.query;

      let query = supabase
        .from('performances')
        .select(
          `
          *,
          users:user_id (name)
        `,
          { count: 'exact' }
        )
        .eq('type', 'collector_monthly');

      if (group) query = query.eq('group_name', group as string);
      if (status) query = query.eq('status', status as string);
      if (date) query = query.eq('date', date as string);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: performances, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const items =
        performances?.map((perf) => ({
          id: perf.id,
          dateRange: perf.date_range,
          groupRange: perf.group_name,
          ranking: perf.ranking,
          collectorsName: perf.users?.name,
          totalAssignedQty: perf.total_assigned_qty,
          newAssignedNum: perf.new_assigned_num,
          targetRepayRate: perf.target_repay_rate,
          targetNum: perf.target_num,
          numOfApps: perf.num_of_apps,
          appRate: perf.app_rate,
          numOfApprovedApps: perf.num_of_approved_apps,
          handleNum: perf.handle_num,
          bonus: perf.bonus,
          status: perf.status,
          daysOfEmployment: perf.days_of_employment,
          updateTime: perf.updated_at,
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

  async getDailyPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { group, date, status } = req.query;

      let query = supabase
        .from('performances')
        .select(
          `
          *,
          users:user_id (name)
        `,
          { count: 'exact' }
        )
        .eq('type', 'collector_daily');

      if (group) query = query.eq('group_name', group as string);
      if (status) query = query.eq('status', status as string);
      if (date) query = query.eq('date', date as string);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: performances, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        performances?.map((perf) => ({
          id: perf.id,
          date: perf.date,
          groupName: perf.group_name,
          ranking: perf.ranking,
          collectorsName: perf.users?.name,
          totalAssignedQty: perf.total_assigned_qty,
          newAssignedNum: perf.new_assigned_num,
          targetRepayRate: perf.target_repay_rate,
          targetNum: perf.target_num,
          numOfApps: perf.num_of_apps,
          appRate: perf.app_rate,
          numOfApprovedApps: perf.num_of_approved_apps,
          handleNum: perf.handle_num,
          bonus: perf.bonus,
          numOfCalls: perf.num_of_calls,
          numOfConnections: perf.num_of_connections,
          phoneConnectionRate: perf.phone_connection_rate,
          totalCallDuration: perf.total_call_duration,
          firstCallTime: perf.first_call_time,
          latestCallTime: perf.latest_call_time,
          caseCoverage: perf.case_coverage,
          numOfSms: perf.num_of_sms,
          status: perf.status,
          daysOfEmployment: perf.days_of_employment,
          updateTime: perf.updated_at,
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

  async getTeamMonthlyPerformance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { group, status } = req.query;

      let query = supabase
        .from('performances')
        .select('*', { count: 'exact' })
        .eq('type', 'team_monthly');

      if (group) query = query.eq('group_name', group as string);
      if (status) query = query.eq('status', status as string);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: performances, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        performances?.map((perf) => ({
          id: perf.id,
          dateRange: perf.date_range,
          groupRange: perf.group_name,
          ranking: perf.ranking,
          totalAssignedQty: perf.total_assigned_qty,
          newAssignedNum: perf.new_assigned_num,
          targetRepayRate: perf.target_repay_rate,
          targetNum: perf.target_num,
          numOfApps: perf.num_of_apps,
          appRate: perf.app_rate,
          numOfApprovedApps: perf.num_of_approved_apps,
          handleNum: perf.handle_num,
          bonus: perf.bonus,
          updateTime: perf.updated_at,
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

  async getTeamDailyPerformance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { group, status } = req.query;

      let query = supabase
        .from('performances')
        .select('*', { count: 'exact' })
        .eq('type', 'team_daily');

      if (group) query = query.eq('group_name', group as string);
      if (status) query = query.eq('status', status as string);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: performances, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        performances?.map((perf) => ({
          id: perf.id,
          date: perf.date,
          groupName: perf.group_name,
          ranking: perf.ranking,
          totalAssignedQty: perf.total_assigned_qty,
          newAssignedNum: perf.new_assigned_num,
          targetRepayRate: perf.target_repay_rate,
          targetNum: perf.target_num,
          numOfApps: perf.num_of_apps,
          appRate: perf.app_rate,
          numOfApprovedApps: perf.num_of_approved_apps,
          handleNum: perf.handle_num,
          bonus: perf.bonus,
          updateTime: perf.updated_at,
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

  async getCollectionCase(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        mobile,
        name,
        loanNum,
        loanOrderNum,
        stage,
        collector,
        product,
        loanTenure,
        loanAmt,
        appVersion,
        dueDate,
        loanStatus,
        tag,
        repeatedBorrowing,
        loanType,
        result,
        followUpDay,
        appName,
        proportion,
      } = req.query;

      // Construire la requête avec des jointures
      let query = supabase.from('loans').select(
        `
          *,
          customers:customer_id!inner (*),
          collectors:collector_id${collector ? '!inner' : ''} (name),
          collection_records:collection_records${result ? '!inner' : ''} (*)
        `,
        { count: 'exact' }
      );

      // Appliquer les filtres
      if (mobile) query = query.ilike('customers.mobile', `%${mobile}%`);
      if (name) query = query.ilike('customers.name', `%${name}%`);
      if (loanNum) query = query.ilike('loan_number', `%${loanNum}%`);
      if (loanOrderNum)
        query = query.ilike('loan_order_number', `%${loanOrderNum}%`);
      if (stage) query = query.ilike('collection_stage', `%${stage}%`);
      if (collector) query = query.ilike('collectors.name', `%${collector}%`);
      if (product) query = query.ilike('product_name', `%${product}`);
      if (loanTenure) query = query.eq('loan_tenure', +(loanTenure as string));
      if (loanAmt) query = query.eq('loan_amount', +(loanAmt as string));
      if (appVersion) query = query.eq('app_version', appVersion as string);
      if (dueDate) {
        const day = new Date(dueDate as string);
        query = query
          .gte('due_date', day.toISOString())
          .lt(
            'due_date',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (loanStatus) query = query.ilike('loan_status', `%${loanStatus}%`);
      if (tag) query = query.ilike('tag', `%${tag}%`);
      if (repeatedBorrowing)
        query = query.eq('repeated_borrowing', repeatedBorrowing === 'true');
      if (loanType) query = query.ilike('loan_type', `%${loanType}%`);
      if (result)
        query = query.ilike('collection_records.result', `%${result}%`);
      if (appName) query = query.ilike('app_name', `%${appName}%`);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: loans, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        loans?.map((loan) => {
          const today = new Date().toISOString().split('T')[0];
          const dailyRecords =
            loan.collection_records?.filter((record) =>
              record.record_time?.startsWith(today)
            ) || [];

          return {
            id: loan.id,
            loanNum: loan.loan_number,
            loanOrderNum: loan.loan_order_number,
            appName: loan.app_name,
            name: loan.customers?.name,
            mobile: loan.customers?.mobile,
            dueDate: loan.due_date,
            product: loan.product_name,
            collector: loan.collectors?.name,
            stage: loan.collection_stage,
            dailyTimes: dailyRecords.length,
            times: loan.collection_records?.length || 0,
            log: loan.collection_records
              ?.map((r) => r.record_content)
              .join('\n'),
            result: loan.collection_records?.[0]?.result,
            logUpdateTime: loan.collection_records?.[0]?.record_time,
            lendingTime: loan.created_at,
            paymentTime: loan.updated_at,
            totalRepayment: loan.total_repayment,
            loanAmt: loan.loan_amount,
            loanTenure: loan.loan_tenure,
            loanType: loan.loan_type,
            loanStatus: loan.loan_status,
            appStatus: loan.app_status,
          };
        }) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCaseAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        stage,
        name,
        collector,
        product,
        userSelect,
        numLoans,
        appChannel,
        loanNum,
        loanOrderNum,
        repeatedBorrowing,
        daysOverdue,
        mobile,
        result,
        largeGroup,
        district,
        otherStates,
        appName,
        dueDate,
      } = req.query;

      let query = supabase
        .from('loans')
        .select(
          `
          *,
          customers:customer_id!inner (*),
          collectors:collector_id${collector ? '!inner' : ''} (name),
          collection_records:collection_records${result ? '!inner' : ''} (*)
        `,
          { count: 'exact' }
        )
        .eq('loan_status', LoanStatus.ACCEPTED);

      // Appliquer les filtres
      if (stage) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const in2Days = new Date(today);
        in2Days.setDate(today.getDate() + 2);

        const day7Ago = new Date(today);
        day7Ago.setDate(today.getDate() - 7);

        const day15Ago = new Date(today);
        day15Ago.setDate(today.getDate() - 15);

        const day30Ago = new Date(today);
        day30Ago.setDate(today.getDate() - 30);

        switch (stage) {
          case 'S-1':
            query = query
              .gte('due_date', tomorrow.toISOString())
              .lt('due_date', in2Days.toISOString());
            break;

          case 'S0':
            query = query
              .gte('due_date', today.toISOString())
              .lt('due_date', tomorrow.toISOString());
            break;

          case 'S1':
            query = query
              .gte('due_date', day7Ago.toISOString())
              .lt('due_date', today.toISOString());
            break;

          case 'S3':
            query = query
              .gte('due_date', day15Ago.toISOString())
              .lt('due_date', day7Ago.toISOString());
            break;

          case 'S4':
            query = query
              .gte('due_date', day30Ago.toISOString())
              .lt('due_date', day15Ago.toISOString());
            break;

          case 'S5':
            query = query.lt('due_date', day30Ago.toISOString());
            break;
        }
      }
      if (mobile) query = query.ilike('customers.mobile', `%${mobile}%`);
      if (name) query = query.ilike('customers.name', `%${name}%`);
      if (loanNum) query = query.ilike('loan_number', `%${loanNum}%`);
      if (loanOrderNum)
        query = query.ilike('loan_order_number', `%${loanOrderNum}%`);
      if (collector) query = query.ilike('collectors.name', `%${collector}%`);
      if (product) query = query.ilike('product_name', `%${product}`);
      if (userSelect)
        query = query.ilike('customers.user_label', `%${userSelect}%`);
      // if (numLoans) query = query.eq('customers.num_loans', numLoans as string);
      if (appChannel) query = query.ilike('app_channel', `%${appChannel}%`);
      if (repeatedBorrowing)
        query = query.eq('repeated_borrowing', repeatedBorrowing === 'true');
      if (daysOverdue) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const day = new Date(today);
        day.setDate(today.getDate() - +daysOverdue);
        query = query
          .gte('due_date', day.toISOString())
          .lt(
            'due_date',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (result)
        query = query.ilike('collection_records.result', `%${result}%`);
      // if (largeGroup) query = query.eq('large_group', largeGroup as string);
      // if (district) query = query.eq('customers.district', district as string);
      // if (otherStates) query = query.eq('customers.other_states', otherStates);
      if (appName) query = query.ilike('app_name', `%${appName}%`);
      if (dueDate) {
        const day = new Date(dueDate as string);
        query = query
          .gte('due_date', day.toISOString())
          .lt(
            'due_date',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: loans, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        loans?.map((loan) => {
          const today = new Date().toISOString().split('T')[0];
          const dailyRecords =
            loan.collection_records?.filter((record) =>
              record.record_time?.startsWith(today)
            ) || [];

          return {
            id: loan.id,
            loanNum: loan.loan_number,
            loanOrderNum: loan.loan_order_number,
            appName: loan.app_name,
            name: loan.customers?.name,
            district: loan.customers?.district,
            mobile: loan.customers?.mobile,
            dueDate: moment(loan.due_date).format('LL'),
            daysOverdue: moment()
              .startOf('day')
              .diff(moment(loan.due_date).startOf('day'), 'days'),
            totalRepayment: loan.total_repayment,
            dailyTimes: dailyRecords.length,
            times: loan.collection_records?.length || 0,
            log: loan.collection_records
              ?.map((r) => r.record_content)
              .join('\n'),
            result: loan.collection_records?.[0]?.result,
            logUpdateTime: loan.collection_records?.[0]?.record_time,
            product: loan.product_name,
            userLvl: loan.customers?.user_label,
            loanAmt: loan.loan_amount,
            loanTenure: loan.loan_tenure,
            loanType: loan.loan_type,
            appStatus: loan.app_status,
            appChannel: loan.app_channel,
            amtRepaid: loan.amount_repaid,
            collector: loan.collectors?.name,
          };
        }) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        personnel,
        loanNum,
        loanOrderNum,
        mobile,
        mark,
        recordTime,
        contact,
        targetContact,
        connection,
        willingnessPay,
        overdueReason,
        result,
      } = req.query;

      // Construire la requête avec jointures complexes
      let query = supabase.from('collection_records').select(
        `
          *,
          loans:loan_id!inner (
            *,
            customers:customer_id!inner (mobile)
          ),
          collectors:collector_id!inner (name)
        `,
        { count: 'exact' }
      );

      // Appliquer les filtres
      if (personnel) query = query.ilike('collectors.name', `%${personnel}%`);
      if (loanNum) query = query.ilike('loans.loan_number', `%${loanNum}%`);
      if (loanOrderNum)
        query = query.ilike('loans.loan_order_number', `%${loanOrderNum}%`);
      if (mobile) query = query.ilike('loans.customer.mobile', `%${mobile}%`);
      if (mark) query = query.ilike('mark', `%${mark}%`);
      if (recordTime) {
        const day = new Date(recordTime as string);
        query = query
          .gte('record_time', day.toISOString())
          .lt(
            'record_time',
            new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString()
          );
      }
      if (contact) query = query.ilike('contact', `%${contact}%`);
      if (targetContact)
        query = query.ilike('target_contact', `%${targetContact}%`);
      if (connection)
        query = query.eq(
          'connection',
          connection as string as ConnectionStatus
        );
      if (willingnessPay)
        query = query.eq(
          'willingness_to_pay',
          willingnessPay as string as WillingnessToPay
        );
      if (overdueReason)
        query = query.ilike('overdue_reason', `%${overdueReason}%` as string);
      if (result) query = query.ilike('result', `%${result}%` as string);

      const total = (await query).count;
      const [from, to] = filter(req.query);
      const { data: records, error } = await query
        .range(from, to)
        .order('id', { ascending: false });

      if (error) throw error;

      const items =
        records?.map((record) => {
          const recordDate = new Date(record.record_time)
            .toISOString()
            .split('T')[0];
          const dailyRecords =
            (record.loans as any)?.collection_records?.filter(
              (r) =>
                new Date(r.record_time).toISOString().split('T')[0] ===
                recordDate
            ) || [];

          return {
            id: record.id,
            personnel: record.collectors?.name,
            loanNum: record.loans?.loan_number,
            loanOrderNum: record.loans?.loan_order_number,
            mobile: record.loans?.customers?.mobile,
            mark: record.mark,
            recordContent: record.record_content,
            dailyTimes: dailyRecords.length,
            times: (record.loans as any)?.collection_records?.length || 0,
            contact: record.contact,
            targetContact: record.target_contact,
            connection: record.connection,
            willingnessPay: record.willingness_to_pay,
            overdueReason: record.overdue_reason,
            result: record.result,
            recordTime: record.record_time,
          };
        }) || [];

      res.json({
        success: true,
        items,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollectors(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('role', 'collector');

      if (error) throw error;

      const record: Record<string, string> = {};
      data.forEach((item) => {
        record[item.id] = item.name;
      });

      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async postDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const input: DistributionInput = req.body;

      const result = await collectionService.distribution(input);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }
}
