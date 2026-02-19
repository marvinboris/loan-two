import { useApi, usePaginatedApi } from '@cfafrica/hooks';
import {
  CollectionMonthlyPerformance,
  Filter,
  Pagination,
  Table,
  useBreadcrumb,
} from '@cfafrica/ui-web';
import React from 'react';
import { collectionService } from '../../../../services';

type Item = {
  dateRange: string;
  groupRange: string;
  ranking: string;
  collectorsName: string;
  totalAssignedQty: string;
  newAssignedNum: string;
  targetRepayRate: string;
  targetNum: string;
  numOfApps: string;
  appRate: string;
  numOfApprovedApps: string;
  handleNum: string;
  bonus: string;
  status: string;
  daysOfEmployment: string;
  updateTime: string;
};

export function CollectionMonthlyReport() {
  useBreadcrumb([
    'Collection',
    'Performance management',
    'Collector stats monthly',
  ]);

  const { data, error, loading, refetch } = usePaginatedApi<Item>(
    '/collection/performance-management/monthly'
  );

  const { data: collectors } = useApi<Record<string, string>>(
    '/admin/collection/collectors'
  );

  return (
    <>
      <Filter
        exportable
        refetch={refetch}
        className="grid-cols-2"
        fields={[
          {
            type: 'select',
            key: 'group',
            label: 'Collection Group',
            options: { '': 'Select a group' },
          },
          {
            type: 'date',
            key: 'date',
            label: 'Date',
          },
          {
            type: 'select',
            key: 'status',
            label: 'Status',
            options: { '': 'Select a status' },
          },
        ]}
      />

      <div className="flex gap-2.5">
        <CollectionMonthlyPerformance
          collectors={collectors}
          onSubmit={async (data) => {
            const result = await collectionService.generateMonthlyPerformance(
              data
            );
            if (result.success) {
              refetch();
            }
            return result;
          }}
        />
      </div>

      <Table
        error={error}
        loading={loading}
        data={data?.items || []}
        fields={[
          { label: 'DATE RANGE', key: 'dateRange', width: 180 },
          { label: 'GROUP RANGE', key: 'groupRange' },
          { label: 'RANKING', key: 'ranking' },
          { label: "COLLECTOR'S NAME", key: 'collectorsName' },
          { label: 'TOTAL ASSIGNED QUANTITY', key: 'totalAssignedQty' },
          { label: 'NEW ASSIGNED NUM', key: 'newAssignedNum' },
          { label: 'TARGET REPAY RATE%', key: 'targetRepayRate' },
          { label: 'TARGET NUM', key: 'targetNum' },
          { label: 'NUMBER OF APPLICATIONS', key: 'numOfApps' },
          { label: 'APPLICATION RATE', key: 'appRate' },
          {
            label: 'NUMBER OF APPROVED APPLICATIONS',
            key: 'numOfApprovedApps',
          },
          { label: 'HANDLE NUM', key: 'handleNum' },
          { label: 'BONUS', key: 'bonus' },
          { label: 'STATUS', key: 'status' },
          { label: 'DAYS OF EMPLOYMENT', key: 'daysOfEmployment' },
          { label: 'UPDATE TIME', key: 'updateTime' },
        ]}
      />

      <Pagination total={data?.total} />
    </>
  );
}
