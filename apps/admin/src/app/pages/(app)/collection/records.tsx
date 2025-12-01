import { usePaginatedApi } from '@cfafrica/hooks';
import { Filter, Pagination, Table, useBreadcrumb } from '@cfafrica/ui-web';
import React from 'react';

type Item = {
  personnel: string;
  loanNum: string;
  loanOrderNum: string;
  mobile: string;
  mark: string;
  recordContent: string;
  dailyTimes: string;
  times: string;
  contact: string;
  targetContact: string;
  connection: string;
  willingnessPay: string;
  overdueReason: string;
  result: string;
  recordTime: string;
};

export function CollectionRecords() {
  useBreadcrumb(['Collection', 'Collection records']);

  const { data, error, loading, refetch } = usePaginatedApi<Item>(
    '/collection/records'
  );

  return (
    <>
      <Filter
        exportable
        refetch={refetch}
        className="grid-cols-3"
        fields={[
          {
            type: 'text',
            key: 'personnel',
            label: 'Collection personnel',
          },
          {
            type: 'text',
            key: 'loanNum',
            label: 'Loan number',
          },
          {
            type: 'text',
            key: 'loanOrderNum',
            label: 'Loan order number',
          },
          {
            type: 'text',
            key: 'mobile',
            label: 'Mobile',
          },
          {
            type: 'text',
            key: 'mark',
            label: 'Collection mark',
          },
          {
            type: 'date',
            key: 'recordTime',
            label: 'Record time',
          },
          {
            type: 'text',
            key: 'contact',
            label: 'Contact',
          },
          {
            type: 'text',
            key: 'targetContact',
            label: 'Target contact',
          },
          {
            type: 'select',
            key: 'connection',
            label: 'Connection',
            options: {
              '': 'Select a connection',
              wrong_number: 'Wrong number',
              no_answer: 'No answer',
              connected: 'Connected',
            },
          },
          {
            type: 'select',
            key: 'willingnessPay',
            label: 'Willingness to pay',
            options: {
              '': 'Select a choice',
              high: 'Yes',
              refusal: 'No',
            },
          },
          {
            type: 'text',
            key: 'overdueReason',
            label: 'Overdue reason',
          },
          {
            type: 'text',
            key: 'result',
            label: 'Collection result',
          },
          null,
          null,
        ]}
      />

      <Table
        error={error}
        loading={loading}
        data={data?.items || []}
        fields={[
          { label: 'COLLECTION PERSONNEL', key: 'personnel' },
          { label: 'LOAN NUMBER', key: 'loanNum' },
          { label: 'LOAN ORDER NUMBER', key: 'loanOrderNum' },
          { label: 'MOBILE', key: 'mobile' },
          { label: 'COLLECTION MARK', key: 'mark' },
          { label: 'COLLECTION RECORD CONTENT', key: 'recordContent' },
          { label: 'DAILY COLLECTION TIMES', key: 'dailyTimes' },
          { label: 'COLLECTION TIMES', key: 'times' },
          { label: 'CONTACT', key: 'contact' },
          { label: 'TARGET CONTACT', key: 'targetContact' },
          { label: 'CONNECTION', key: 'connection' },
          { label: 'WILLINGNESS TO PAY', key: 'willingnessPay' },
          { label: 'OVERDUE REASON', key: 'overdueReason' },
          { label: 'COLLECTION RESULT', key: 'result' },
          { label: 'RECORD TIME', key: 'recordTime' },
        ]}
      />

      <Pagination total={data?.total} />
    </>
  );
}
