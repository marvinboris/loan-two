import moment from 'moment';
import { Loan } from '../types';

export function calculatePenalty(loan: Loan) {
  let penalty: number;
  if (moment(loan.due_date).isBefore()) {
    const daysOverdue = Math.ceil(
      (Date.now() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    penalty = daysOverdue * loan.loan_amount * 0.1;
  } else penalty = 0;

  return penalty;
}
