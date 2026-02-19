import moment from 'moment';
import { supabase } from '../../../../lib';
import { LoanStatus } from '../../../../types';
import {
  DistributionInput,
  GenerateDailyPerformanceInput,
  GenerateMonthlyPerformanceInput,
} from './interfaces';

export const collectionService = {
  async generateMonthlyPerformance(input: GenerateMonthlyPerformanceInput) {
    const range = new Date();
    range.setFullYear(input.year);
    range.setMonth(input.month);

    const startOfMonth = moment(range).startOf('month');

    const endOfMonth = moment(range).endOf('month');

    const dateRange = `${startOfMonth.format(
      'YYYY-MM-DD'
    )} - ${endOfMonth.format('YYYY-MM-DD')}`;

    const totalAssignedQty =
      (
        await supabase
          .from('loans')
          .select(`id`, { count: 'exact' })
          .eq('collector_id', input.id)
      ).count || 0;

    const newAssignedNum =
      (
        await supabase
          .from('loans')
          .select(`id`, { count: 'exact' })
          .eq('collector_id', input.id)
          .gte('created_at', startOfMonth.toISOString()) // ✅ gte sur start
          .lte('created_at', endOfMonth.toISOString())
      ).count || 0; // ✅ lte sur end

    const numOfApps =
      (
        await supabase
          .from('loans')
          .select('id, collector_id', { count: 'exact' })
          .eq('collector_id', input.id)
      ).count || 0;

    const approvedApps = await supabase
      .from('loans')
      .select('*', { count: 'exact' })
      .eq('collector_id', input.id)
      .in('loan_status', [LoanStatus.ACCEPTED, LoanStatus.REPAID]);

    const numOfApprovedApps = approvedApps.count || 0;

    const appRate = numOfApps ? (numOfApprovedApps * 100) / numOfApps : 0;

    const targetNum = (approvedApps.data || []).reduce(
      (a, b) => a + b.loan_amount,
      0
    );

    const targetRepayRate = targetNum
      ? ((approvedApps.data || []).reduce((a, b) => a + b.amount_repaid, 0) *
          100) /
        targetNum
      : 0;

    const { error } = await supabase.from('performances').insert({
      app_rate: appRate,
      bonus: 0,
      date: moment().format('YYYY-MM-DD'),
      group_name: '',
      handle_num: 0,
      new_assigned_num: newAssignedNum,
      num_of_approved_apps: numOfApprovedApps,
      num_of_apps: numOfApps,
      status: '',
      target_num: targetNum,
      target_repay_rate: targetRepayRate,
      total_assigned_qty: totalAssignedQty,
      type: 'collector_monthly',
      case_coverage: 0,
      date_range: dateRange,
      days_of_employment: 0,
      num_of_calls: 0,
      num_of_connections: 0,
      phone_connection_rate: 0,
      user_id: input.id,
    });

    if (error)
      return { success: false, message: 'Monthly performance not generated' };

    return { success: true, message: 'Monthly performance generated' };
  },

  async generateDailyPerformance(input: GenerateDailyPerformanceInput) {
    const range = new Date(input.date);

    const startOfDay = moment(range).startOf('day');

    const endOfDay = moment(range).endOf('day');

    const dateRange = input.date;

    const totalAssignedQty =
      (
        await supabase
          .from('loans')
          .select(`id`, { count: 'exact' })
          .eq('collector_id', input.id)
      ).count || 0;

    const newAssignedNum =
      (
        await supabase
          .from('loans')
          .select(`id`, { count: 'exact' })
          .eq('collector_id', input.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
      ).count || 0;

    const numOfApps =
      (
        await supabase
          .from('loans')
          .select('id, collector_id', { count: 'exact' })
          .eq('collector_id', input.id)
      ).count || 0;

    const approvedApps = await supabase
      .from('loans')
      .select('*', { count: 'exact' })
      .eq('collector_id', input.id)
      .in('loan_status', [LoanStatus.ACCEPTED, LoanStatus.REPAID]);

    const numOfApprovedApps = approvedApps.count || 0;

    const appRate = numOfApps ? (numOfApprovedApps * 100) / numOfApps : 0;

    const targetNum = (approvedApps.data || []).reduce(
      (a, b) => a + b.loan_amount,
      0
    );

    const targetRepayRate = targetNum
      ? ((approvedApps.data || []).reduce((a, b) => a + b.amount_repaid, 0) *
          100) /
        targetNum
      : 0;

    const { error } = await supabase.from('performances').insert({
      app_rate: appRate,
      bonus: 0,
      date: input.date,
      group_name: '',
      handle_num: 0,
      new_assigned_num: newAssignedNum,
      num_of_approved_apps: numOfApprovedApps,
      num_of_apps: numOfApps,
      status: '',
      target_num: targetNum,
      target_repay_rate: targetRepayRate,
      total_assigned_qty: totalAssignedQty,
      type: 'collector_daily',
      case_coverage: 0,
      date_range: dateRange,
      days_of_employment: 0,
      num_of_calls: 0,
      num_of_connections: 0,
      phone_connection_rate: 0,
      user_id: input.id,
    });

    if (error)
      return { success: false, message: 'Daily performance not generated' };

    return { success: true, message: 'Daily performance generated' };
  },

  async distribution(input: DistributionInput) {
    const { error } = await supabase
      .from('loans')
      .update({
        collector_id: input.id,
      })
      .in('id', input.selected)
      .select();

    if (error) return { success: false, message: 'Distribution failed' };

    return { success: true, message: 'Distribution done successfully' };
  },
};
