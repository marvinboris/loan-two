import moment from 'moment';
import xlsx from 'xlsx';
import { config } from '../../../../config';
import { supabase } from '../../../../lib';
import {
  CreateCustomerInput,
  CustomerType,
  KycStatus,
  LoanStatus,
} from '../../../../types';
import { payCustomer, sendSms } from '../../../../utils';
import {
  BorrowCancellationInput,
  BorrowValidationInput,
  GenerateDailyPerformanceInput,
  GenerateMonthlyPerformanceInput,
  KycValidationInput,
  ManualAssignmentInput,
  ReleaseInput,
} from './interfaces';

export const telemarketingService = {
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
          .from('customers')
          .select(`id`, { count: 'exact' })
          .eq('telemarketer_id', input.id)
      ).count || 0;

    const newAssignedNum =
      (
        await supabase
          .from('customers')
          .select(`id`, { count: 'exact' })
          .eq('telemarketer_id', input.id)
          .gte('allocation_time', startOfMonth.toISOString())
          .lte('allocation_time', endOfMonth.toISOString())
      ).count || 0;

    const numOfApps =
      (
        await supabase
          .from('loans')
          .select('id, customers:customer_id', { count: 'exact' })
          .eq('customers.telemarketer_id', input.id)
      ).count || 0;

    const approvedApps = await supabase
      .from('loans')
      .select('*, customers:customer_id', { count: 'exact' })
      .eq('customers.telemarketer_id', input.id)
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
      type: 'telemarketer_monthly',
      case_coverage: 0,
      date_range: dateRange,
      days_of_employment: 0,
      num_of_calls: 0,
      num_of_connections: 0,
      phone_connection_rate: 0,
      user_id: input.id,
    });

    if (error) throw error;

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
          .from('customers')
          .select(`id`, { count: 'exact' })
          .eq('telemarketer_id', input.id)
      ).count || 0;

    const newAssignedNum =
      (
        await supabase
          .from('customers')
          .select(`id`, { count: 'exact' })
          .eq('telemarketer_id', input.id)
          .gte('allocation_time', startOfDay.toISOString())
          .lte('allocation_time', endOfDay.toISOString())
      ).count || 0;

    const numOfApps =
      (
        await supabase
          .from('loans')
          .select('id, customers:customer_id', { count: 'exact' })
          .eq('customers.telemarketer_id', input.id)
      ).count || 0;

    const approvedApps = await supabase
      .from('loans')
      .select('*, customers:customer_id', { count: 'exact' })
      .eq('customers.telemarketer_id', input.id)
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
      type: 'telemarketer_daily',
      case_coverage: 0,
      date_range: dateRange,
      days_of_employment: 0,
      num_of_calls: 0,
      num_of_connections: 0,
      phone_connection_rate: 0,
      user_id: input.id,
    });

    if (error) throw error;

    if (error)
      return { success: false, message: 'Daily performance not generated' };

    return { success: true, message: 'Daily performance generated' };
  },

  async importCustomers(type: CustomerType, buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return {
        success: false,
        message: 'The file contains no sheet',
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows: object[] = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return { success: false, message: 'File is empty or wrong formatted' };
    }

    const report = await processCustomers(type)(rows);

    return {
      success: true,
      message: `Imported ${report.success} customers. ${report.duplicates} duplicates skipped, ${report.invalid} invalid.`,
      report,
    };
  },

  async kycValidation(input: KycValidationInput) {
    const { data: kyc, error } = await supabase
      .from('kyc')
      .update({
        status: input.validated ? KycStatus.SUCCESS : KycStatus.FAILED,
      })
      .eq('id', input.id)
      .select(
        `
        *,
        customers:customer_id (mobile)
        `
      )
      .single();

    if (input.validated)
      await supabase
        .from('customers')
        .update({
          app_name: config.appName,
          name: [kyc.first_name, kyc.last_name].filter(Boolean).join(' '),
        })
        .eq('id', kyc.customer_id);

    if (error)
      return {
        success: false,
        message: 'KYC validation response not submitted',
      };

    let message: string;
    if (input.validated) message = 'Your KYC request has been validated.';
    else
      message =
        [
          'Your KYC application has been denied',
          input.reason
            ? 'for the following reason: ' + input.reason
            : undefined,
        ]
          .filter(Boolean)
          .join(' ') + '.';

    await sendSms(kyc.customers.mobile, message);

    return {
      success: true,
      message: 'KYC validation response submitted successfully',
    };
  },

  async borrowValidation(input: BorrowValidationInput) {
    const { data: loan, error } = await supabase
      .from('loans')
      .update({
        loan_status: input.validated ? LoanStatus.ACCEPTED : LoanStatus.DENIED,
      })
      .eq('id', input.id)
      .select(
        `
        *,
        customers:customer_id (mobile, account)
        `
      )
      .single();

    if (input.validated) {
      const customerPaid = await payCustomer(
        loan.customers.account,
        loan.loan_amount
      );
      console.log(customerPaid ? 'Customer paid' : 'Customer not paid');
    }

    if (error)
      return {
        success: false,
        message: 'Borrow validation response not submitted',
      };

    let message: string;
    if (input.validated) message = 'Your borrow request has been validated.';
    else
      message =
        [
          'Your borrow application has been denied',
          input.reason
            ? 'for the following reason: ' + input.reason
            : undefined,
        ]
          .filter(Boolean)
          .join(' ') + '.';

    await sendSms(loan.customers.mobile, message);

    return {
      success: true,
      message: 'Borrow validation response submitted successfully',
    };
  },

  async borrowCancellation(input: BorrowCancellationInput) {
    const { error } = await supabase
      .from('loans')
      .update({
        loan_status: LoanStatus.REPAID,
      })
      .eq('id', input.id);

    if (error)
      return {
        success: false,
        message: 'Borrow cancellation response not submitted',
      };

    return {
      success: true,
      message: 'Borrow cancellation response submitted successfully',
    };
  },

  async manualAssignment(input: ManualAssignmentInput) {
    const { error } = await supabase
      .from('customers')
      .update({
        telemarketer_id: input.id,
        allocation_time: new Date().toISOString(),
      })
      .in('id', input.selected);

    if (error) return { success: false, message: 'Manual assignment failed' };

    return { success: true, message: 'Manual assignment done successfully' };
  },

  async release(input: ReleaseInput) {
    const { error } = await supabase
      .from('customers')
      .update({
        telemarketer_id: null,
      })
      .in('id', input.selected)
      .select();

    if (error) return { success: false, message: 'Release failed' };

    return { success: true, message: 'Release done successfully' };
  },
};

function processCustomers(type: CustomerType) {
  return async function (rows: object[]) {
    const report = {
      total: rows.length,
      success: 0,
      duplicates: 0,
      invalid: 0,
      errors: 0,
      details: [] as any[],
    };

    const dataToInsert: Record<string, CreateCustomerInput> = {};

    const isFirstColClientName = isNaN(+Object.values(rows[0])[0]);
    const clientNameIdx = isFirstColClientName ? 0 : 1;
    const clientPhoneNumberIdx = isFirstColClientName ? 1 : 0;

    let index = 0;
    for (const obj of rows) {
      const values = Object.values(obj);

      const clientName = values[clientNameIdx];
      const clientPhoneNumber = values[clientPhoneNumberIdx];

      const lineNumber = index + 1; // +1 car Excel commence à 1
      const rowData = {
        name: clientName?.toString().trim(),
        mobile: clientPhoneNumber?.toString().trim(),
      };

      // Validation des données
      if (!rowData.mobile) {
        report.invalid++;
        report.details.push({
          line: lineNumber,
          status: 'invalid',
          message: 'Mobile is missing',
        });
        continue;
      }

      // Création du client
      dataToInsert[rowData.mobile] = {
        name: rowData.name,
        mobile: rowData.mobile,
        account: '237 ' + rowData.mobile.replace('+', '').substring(3),
        type, // Valeur par défaut
        app_name: config.appName,
        whether_apply: false,
        whether_assigned: false,
      };

      index++;
    }

    const allCustomersMobile = await supabase
      .from('customers')
      .select('mobile');

    if (allCustomersMobile.error) throw allCustomersMobile.error;

    const duplicateCount = allCustomersMobile.data.filter(
      (item) => item.mobile in dataToInsert
    ).length;
    report.duplicates = duplicateCount;

    allCustomersMobile.data.forEach((item) => {
      if (item.mobile in dataToInsert) delete dataToInsert[item.mobile];
    });

    const { error } = await supabase
      .from('customers')
      .insert(Object.values(dataToInsert));

    if (error) {
      report.errors++;
      throw error;
    }

    report.success = Object.keys(dataToInsert).length;

    return report;
  };
}
