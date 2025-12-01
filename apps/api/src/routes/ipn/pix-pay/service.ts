import { supabase } from '../../../lib';
import { SubmitInput } from './interfaces';

export const pixPayService = {
  async submit(input: SubmitInput) {
    const { error } = await supabase.from('transactions').insert(input);

    if (error) {
      console.error(input);
      throw error;
    }

    return { success: true, message: 'Transaction tracked successfully' };
  },
};
