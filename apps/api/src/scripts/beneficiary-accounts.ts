import { supabase } from '../lib';

export async function beneficiaryAccounts() {
  const { data: customers, error: fetchError } = await supabase
    .from('customers')
    .select();

  if (fetchError) {
    console.error('Erreur lors de la récupération des données:', fetchError);
    return;
  }

  if (!customers || customers.length === 0) {
    console.log('Aucun client trouvé.');
    return;
  }

  const format = (mobile: string) => {
    return '237 ' + mobile.replace('+', '').substring(3);
  };

  const { error: upsertError } = await supabase.from('customers').upsert(
    customers.map((customer) => ({
      ...customer,
      account: format(customer.mobile),
    }))
  );

  if (upsertError) {
    console.error('Erreur lors de la mise a jour des donnees:', upsertError);
    return;
  }

  console.log('Mise a jour des comptes beneficiaires reussie.');
}
