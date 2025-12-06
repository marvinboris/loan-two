import { useConfig } from '@cfafrica/hooks';
import { Loan as LoanType, LoanStatus } from '@cfafrica/types';
import { Formik } from 'formik';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AmountLine } from '../amount-line';
import { Card } from '../card';
import { Form } from '../form';
import { Modal } from '../modal';
import { toastShow } from '../toast';
import { Typography } from '../typography';

export type LoanFormValues = {
  id: number;

  amount: number;
  // mode: 'app' | 'merchant-code';
};

export type LoanProps = LoanType & {
  penalty?: number;
  onSubmit(
    values: LoanFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function Loan({ onSubmit, ...item }: LoanProps) {
  const { theme } = useConfig();
  const [show, setShow] = React.useState(false);

  return (
    <>
      <LoanForm
        values={item}
        onSubmit={onSubmit}
        show={show}
        setShow={setShow}
      />

      <Pressable
        onPress={
          item.loan_status === LoanStatus.ACCEPTED
            ? () => setShow(true)
            : undefined
        }
        style={({ pressed }) => [
          {
            gap: 4,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginHorizontal: -16,
          },
          pressed && { backgroundColor: theme.primary + '22' },
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography
            color={
              item.loan_status === LoanStatus.REPAID
                ? 'success'
                : item.loan_status === LoanStatus.DENIED
                ? 'error'
                : item.loan_status === LoanStatus.ACCEPTED
                ? 'secondary'
                : 'warning'
            }
          >
            {item.loan_amount} XAF
          </Typography>

          <Typography color="black">
            +{item.total_repayment - item.loan_amount + (item.penalty || 0)}
          </Typography>
        </View>

        <Typography color="grey0">{moment(item.due_date).fromNow()}</Typography>
      </Pressable>
    </>
  );
}

function LoanForm({
  show,
  setShow,
  values,
  onSubmit,
}: {
  values: LoanType & {
    penalty?: number;
  };
  onSubmit: LoanProps['onSubmit'];
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();

  const initialValues: LoanFormValues = {
    id: values.id,
    amount: 0,
    // mode: 'app',
  };

  const maxAmount = React.useMemo(
    () =>
      values.total_repayment -
      (values.amount_repaid || 0) +
      (values.penalty || 0),
    [values]
  );

  return (
    <Modal show={show} setShow={setShow} title={t('ui.loan.repayment_time')}>
      <Card size="sm" style={{ marginBottom: 8 }}>
        <AmountLine amount={maxAmount} label={t('ui.loan.repayment_amount')} />
      </Card>

      <Formik
        initialValues={initialValues}
        onSubmit={async (data) => {
          const result = await onSubmit(data);
          if (result.success)
            toastShow({ type: 'success', text: result.message });
        }}
      >
        {({
          handleChange,
          handleSubmit,
          setFieldValue,
          values,
          dirty,
          isValid,
          isSubmitting,
        }) => (
          <Form>
            {/* <Select
              id="mode"
              name="mode"
              value={values.mode}
              label={t('ui.loan.mode')}
              onChange={handleChange('mode')}
              placeholder={t('ui.loan.mode')}
              options={{
                app: 'App',
                'merchant-code': t('ui.loan.merchant_code'),
              }}
            /> */}

            {/* {values.mode === 'merchant-code' ? ( */}
            <View>
              <Typography>{t('ui.loan.merchant_mode')}:</Typography>
              <View>
                <Typography>
                  - (Orange){' '}
                  <Typography family="SEMIBOLD" color="primary">
                    #150*14*293486*659426218*{t('ui.loan.amount')}#
                  </Typography>{' '}
                  - ETS Rabiatou
                </Typography>
              </View>
              <View>
                <Typography>
                  - (MTN){' '}
                  <Typography family="SEMIBOLD" color="primary">
                    *126# - 1 - 1 - 651402523 - {t('ui.loan.amount')} - ref
                  </Typography>{' '}
                  - ALBERTINE BLANCHE MAMERT
                </Typography>
              </View>
            </View>
            {/* ) : (
              <>
                <NumberInput
                  min={0}
                  step={1000}
                  id="amount"
                  name="amount"
                  max={maxAmount}
                  value={values.amount}
                  onChange={(value) => setFieldValue('amount', value)}
                />

                <Button
                  loading={isSubmitting}
                  title={t('ui.loan.repay')}
                  disabled={!(dirty && isValid)}
                  onPress={() => handleSubmit()}
                />
              </>
            )} */}
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
