import { usePaginatedApi } from '@cfafrica/hooks';
import { Transaction } from '@cfafrica/types';
import { Filter, Pagination, Table, useBreadcrumb } from '@cfafrica/ui-web';
import React from 'react';

export function FinancialTransactions() {
  useBreadcrumb(['Financial', 'Transactions']);

  const { data, error, loading, refetch } = usePaginatedApi<Transaction>(
    '/financial/transactions'
  );

  return (
    <>
      <Filter refetch={refetch} className="grid-cols-3" fields={[]} />

      <Table
        error={error}
        loading={loading}
        data={data?.items || []}
        fields={[
          { label: 'TRANSACTION ID', key: 'transaction_id', width: 100 },
          { label: 'AMOUNT', key: 'amount', width: 100 },
          { label: 'BENEFIT', key: 'benefice' },
          { label: 'COMMISSION', key: 'comission' },
          { label: 'FEE', key: 'fee' },
          { label: 'CUSTOM DATA', key: 'custom_data' },
          { label: 'DESTINATION', key: 'destination' },
          { label: 'ERROR', key: 'error' },
          { label: 'IPN STATE', key: 'ipn_state' },
          { label: 'PIX ID', key: 'p_id' },
          { label: 'PIX LATEST WALLET AMOUNT', key: 'p_last_wallet_amount' },
          { label: 'PIX NEW WALLET AMOUNT', key: 'p_new_wallet_amount' },
          { label: 'PROVIDER ID', key: 'provider_id' },
          { label: 'RESPONSE', key: 'response' },
          { label: 'SERVICE ID', key: 'service_id' },
          { label: 'SMS LINK', key: 'sms_link' },
          { label: 'STATE', key: 'state' },
          {
            label: 'WALLET AMOUNT AFTER TRANSACTION',
            key: 'w_amount_after_transaction',
          },
          { label: 'HASH', key: 'hash' },
        ]}
      />

      <Pagination total={data?.total} />
    </>
  );
}
