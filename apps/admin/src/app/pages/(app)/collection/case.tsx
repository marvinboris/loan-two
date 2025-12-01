import { usePaginatedApi } from '@cfafrica/hooks';
import { LoanStatus } from '@cfafrica/types';
import { Filter, Pagination, Table, useBreadcrumb } from '@cfafrica/ui-web';
import { cn } from '@cfafrica/utils';
import React from 'react';

type Item = {
  mobile: string;
  name: string;
  loanNum: string;
  loanStatus: LoanStatus;
  loanOrderNum: string;
  stage: string;
  collector: string;
  product: string;
  loanTenure: string;
  loanAmt: string;
  dueDate: string;
  loanType: string;
  result: string;
  appName: string;
  dailyTimes: string;
  times: string;
  log: string;
  logUpdateTime: string;
  lendingTime: string;
  paymentTime: string;
  totalRepayment: string;
  appStatus: string;
};

export function CollectionCase() {
  useBreadcrumb(['Collection', 'Collection case']);

  const { data, error, loading, refetch } =
    usePaginatedApi<Item>('/collection/case');

  return (
    <>
      <Filter
        refetch={refetch}
        className="grid-cols-3"
        fields={[
          {
            type: 'text',
            key: 'mobile',
            label: 'Mobile',
          },
          {
            type: 'text',
            key: 'name',
            label: 'Name',
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
            key: 'stage',
            label: 'Collection stage',
          },
          {
            type: 'text',
            key: 'collector',
            label: 'Collector',
          },
          {
            type: 'text',
            key: 'product',
            label: 'Product name',
          },
          {
            type: 'text',
            key: 'loanTenure',
            label: 'Loan tenure',
          },
          {
            type: 'number',
            key: 'loanAmt',
            label: 'Loan amount',
          },
          {
            type: 'select',
            key: 'appVersion',
            label: 'App version',
            options: {
              '': 'Select a version',
            },
          },
          {
            type: 'date',
            key: 'dueDate',
            label: 'Due date',
          },
          {
            type: 'select',
            key: 'loanStatus',
            label: 'Loan status',
            options: {
              '': 'Select a status',
              pending: 'Pending',
              accepted: 'Accepted',
              denied: 'Denied',
              repaid: 'Repaid',
            },
          },
          {
            type: 'text',
            key: 'tag',
            label: 'Tag',
          },
          {
            type: 'select',
            key: 'repeatedBorrowing',
            label: 'Is it repeated borrowing',
            options: {
              '': 'Select a choice',
              true: 'Yes',
              false: 'No'
            },
          },
          {
            type: 'text',
            key: 'loanType',
            label: 'Loan type',
          },
          {
            type: 'text',
            key: 'result',
            label: 'Collection result',
          },
          {
            type: 'select',
            key: 'followUpDay',
            label: 'Did you follow-up on the day',
            options: {
              '': 'Select a choice',
            },
          },
          {
            type: 'text',
            key: 'appName',
            label: 'App name',
          },
          {
            span: 2,
            type: 'number',
            key: 'proportion',
            label:
              'The proportion of the amount to be repaid without penalty interest is less than',
          },
        ]}
      />

      <Table
        error={error}
        loading={loading}
        data={(data?.items || []).map((item) => ({
          ...item,
          loanStatus: (
            <div
              className={cn(
                'capitalize',
                {
                  pending: 'text-yellow-600',
                  accepted: 'text-blue-600',
                  repaid: 'text-green-600',
                  denied: 'text-red-600',
                }[item.loanStatus]
              )}
            >
              {item.loanStatus}
            </div>
          ),
        }))}
        fields={[
          { label: 'LOAN NUMBER', key: 'loanNum' },
          { label: 'LOAN ORDER NUMBER', key: 'loanOrderNum' },
          { label: 'LOAN STATUS', key: 'loanStatus' },
          { label: 'APP NAME', key: 'appName' },
          { label: 'NAME', key: 'name' },
          { label: 'MOBILE', key: 'mobile' },
          { label: 'DUE DATE', key: 'dueDate' },
          { label: 'PRODUCT NAME', key: 'product' },
          { label: "COLLECTOR'S NAME", key: 'collector' },
          { label: 'COLLECTION STAGE', key: 'stage' },
          { label: 'DAILY COLLECTION TIMES', key: 'dailyTimes' },
          { label: 'COLLECTION TIMES', key: 'times' },
          { label: 'COLLECTOR LOG', key: 'log' },
          { label: 'COLLECTION RESULT', key: 'result' },
          { label: 'LOG UPDATE TIME', key: 'logUpdateTime' },
          { label: 'LENDING TIME', key: 'lendingTime' },
          { label: 'PAYMENT TIME', key: 'paymentTime' },
          { label: 'TOTAL REPAYMENT', key: 'totalRepayment' },
          { label: 'LOAN AMOUNT', key: 'loanAmt' },
          { label: 'LOAN TENURE', key: 'loanTenure' },
          { label: 'LOAN TYPE', key: 'loanType' },
          { label: 'APP STATUS', key: 'appStatus' },
        ]}
      />

      <Pagination total={data?.total} />
    </>
  );
}
