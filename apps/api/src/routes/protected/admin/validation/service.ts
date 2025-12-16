import {
  CustomerType,
  KycStatus,
  Loan,
  LoanStatus,
  TradingStatus,
} from '../../../../types';
import {
  BorrowCancellationInput,
  BorrowRepaymentInput,
  BorrowValidationInput,
  KycValidationInput,
  UnblockClientInput,
} from './interfaces';
import moment from 'moment';
import { config } from '../../../../config';
import { supabase } from '../../../../lib';
import { calculatePenalty, payCustomer, sendSms } from '../../../../utils';

export const validationService = {
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

    let message;
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
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select(
        `
      *,
      customers:customer_id (mobile, account)
      `
      )
      .eq('id', input.id)
      .eq('loan_status', LoanStatus.PENDING)
      .single();

    if (loanError)
      return {
        success: false,
        message: 'Borrow request not found or not pending',
      };

    const security = await supabase
      .from('loans')
      .select()
      .eq('loan_status', LoanStatus.ACCEPTED)
      .eq('customer_id', loan.customer_id);

    if (security.error) throw security.error;

    if (security.data.length) {
      const block = await supabase
        .from('customers')
        .update({
          blocked: true,
        })
        .eq('id', loan.customer_id);

      if (block.error) throw block.error;

      const invalidating = await supabase
        .from('loans')
        .update({ loan_status: LoanStatus.DENIED })
        .eq('id', input.id);

      if (invalidating.error) throw invalidating.error;

      return {
        success: false,
        message: 'This customer already has a non repaid loan',
      };
    }

    let error;
    if (input.validated) {
      const { externalId } = input;

      // const externalId = await payCustomer(
      //   loan.customers.account,
      //   loan.loan_amount
      // );

      if (externalId) {
        const updated = await supabase
          .from('loans')
          .update({
            loan_status: LoanStatus.ACCEPTED,
            loan_order_number: externalId,
            due_date: moment().add(1, 'week').toISOString(),
          })
          .eq('id', input.id);
        error = updated.error;
      }
    } else {
      const updated = await supabase
        .from('loans')
        .update({ loan_status: LoanStatus.DENIED })
        .eq('id', input.id);
      error = updated.error;
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

  async borrowRepayment(input: BorrowRepaymentInput) {
    const loan = await supabase
      .from('loans')
      .select('*')
      .eq('id', input.id)
      .single();
    const customerId = loan.data.customer_id;

    if (loan.error || !loan.data)
      return { success: false, message: 'Borrow not found' };

    const customer = await supabase
      .from('customers')
      .select()
      .eq('id', customerId)
      .single();

    if (customer.error || !customer.data)
      return { success: false, message: 'Borrow customer not found' };

    const { count: total } = await supabase
      .from('repayments')
      .select('id', { count: 'exact' });

    const { data, error } = await supabase
      .from('repayments')
      .insert({
        creation_time: new Date().toISOString(),
        loan_id: input.id,
        repayment_amount: input.amount,
        repayment_number: 'REP' + total,
        trading_status: TradingStatus.SUCCESS,
        real_amount: input.amount,
        payment_channel: 'Mobile',
        payment_company_serial_number: input.ref,
      })
      .select()
      .single();

    if (error)
      return {
        success: false,
        message: 'Borrow repayment response not submitted',
      };

    const penalty = calculatePenalty(loan.data as Loan);

    const amountRepaid = (loan.data.amount_repaid || 0) + input.amount;

    const fullyRepaid = loan.data.total_repayment + penalty === amountRepaid;

    await supabase
      .from('loans')
      .update({
        amount_repaid: amountRepaid,
        ...(fullyRepaid
          ? {
              loan_status: LoanStatus.REPAID,
            }
          : {}),
      })
      .eq('id', input.id);

    await supabase
      .from('customers')
      .update({
        prev_repayment_time: new Date().toISOString(),
        ...(fullyRepaid && customer.data.type === 'new'
          ? {
              type: CustomerType.OLD,
            }
          : {}),
      })
      .eq('id', customerId);

    return {
      success: true,
      message: 'Borrow cancellation response submitted successfully',
    };
  },

  async unblockClient(input: UnblockClientInput) {
    const { error } = await supabase
      .from('customers')
      .update({
        blocked: false,
      })
      .eq('id', input.id);

    if (error)
      return {
        success: false,
        message: 'Unblock client response not submitted',
      };

    return {
      success: true,
      message: 'Client unblocked successfully',
    };
  },
};
