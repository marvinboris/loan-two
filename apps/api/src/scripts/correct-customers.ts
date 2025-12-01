import { supabase } from '../lib';

export async function correctCustomers() {
  // Récupérer tous les numéros de mobile de la table customers
  const { data: customers, error: fetchError } = await supabase
    .from('customers')
    .select('id, mobile');

  if (fetchError) {
    console.error('Erreur lors de la récupération des données:', fetchError);
    return;
  }

  if (!customers || customers.length === 0) {
    console.log('Aucun client trouvé.');
    return;
  }

  for (const customer of customers) {
    const { id, mobile } = customer;

    // Vérifier si le numéro commence par "237"
    if (mobile && !mobile.startsWith('237') && !mobile.startsWith('+237')) {
      const formattedMobile = `237${mobile}`;

      // Vérifier l'existence d'un doublon avec le format "237" + mobile
      const { data: duplicate, error: duplicateError } = await supabase
        .from('customers')
        .select('id')
        .eq('mobile', formattedMobile)
        .maybeSingle();

      if (duplicateError) {
        console.error(
          `Erreur lors de la vérification du doublon pour ${mobile}:`,
          duplicateError
        );
        continue;
      }

      if (duplicate) {
        // Supprimer l'entrée actuelle sans "237"
        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error(
            `Erreur lors de la suppression du client ${id}:`,
            deleteError
          );
        } else {
          console.log(
            `Client ${id} supprimé (doublon avec ${formattedMobile} existant).`
          );
        }
      } else {
        // Mettre à jour le numéro pour ajouter "237"
        const { error: updateError } = await supabase
          .from('customers')
          .update({ mobile: formattedMobile })
          .eq('id', id);

        if (updateError) {
          console.error(
            `Erreur lors de la mise à jour du client ${id}:`,
            updateError
          );
        } else {
          console.log(
            `Client ${id} mis à jour: ${mobile} -> ${formattedMobile}`
          );
        }
      }
    } else if (mobile.startsWith('237237+237')) {
      const formattedMobile = mobile.replace('237237+237', '+237');

      // Mettre à jour le numéro pour ajouter "237"
      const { error: updateError } = await supabase
        .from('customers')
        .update({ mobile: formattedMobile })
        .eq('id', id);

      if (updateError) {
        console.error(
          `Erreur lors de la mise à jour du client ${id}:`,
          updateError
        );
      } else {
        console.log(`Client ${id} mis à jour: ${mobile} -> ${formattedMobile}`);
      }
    }
  }
}
