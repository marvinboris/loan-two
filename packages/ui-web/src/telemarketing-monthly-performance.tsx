import { PlusIcon } from '@heroicons/react/24/outline';
import { Formik } from 'formik';
import React from 'react';
import z from 'zod';
import { toFormikValidate } from 'zod-formik-adapter';
import { Button } from './buttons';
import { Select } from './form';
import { Modal } from './modal';
import { toastShow } from './toast';

export type TelemarketingMonthlyPerformanceFormValues = {
  id: number;
  year: number;
  month: number;
};

export type TelemarketingMonthlyPerformanceProps = {
  telemarketers?: Record<string, string>;
  onSubmit(
    values: TelemarketingMonthlyPerformanceFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function TelemarketingMonthlyPerformance(
  props: TelemarketingMonthlyPerformanceProps
) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      {props.telemarketers && (
        <TelemarketingMonthlyPerformanceForm
          {...props}
          show={show}
          setShow={setShow}
        />
      )}

      <Button icon={PlusIcon} onClick={() => setShow(true)}>
        Generate
      </Button>
    </>
  );
}

function TelemarketingMonthlyPerformanceForm(
  props: TelemarketingMonthlyPerformanceProps & {
    show: boolean;
    setShow: (show: boolean) => void;
  }
) {
  const initialValues: TelemarketingMonthlyPerformanceFormValues = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    id: +Object.keys(props.telemarketers || {})[0],
  };

  const Schema = React.useMemo(
    () =>
      z.object({
        id: z.number(),
        year: z.number(),
        month: z.number(),
      }),
    []
  );

  const years = React.useMemo(() => {
    const result: Record<string, string> = {};

    for (let index = 2020; index < 2100; index++) {
      result[index.toString()] = index.toString();
    }

    return result;
  }, []);

  const months = React.useMemo(() => {
    const result: Record<string, string> = {
      1: 'January',
      2: 'February',
      3: 'March',
      4: 'April',
      5: 'May',
      6: 'June',
      7: 'July',
      8: 'August',
      9: 'September',
      10: 'October',
      11: 'November',
      12: 'December',
    };

    return result;
  }, []);

  return (
    <Modal
      show={props.show}
      setShow={props.setShow}
      title="Generate Telemarketing Monthly Performance"
    >
      <Formik
        initialValues={initialValues}
        validate={toFormikValidate(Schema)}
        onSubmit={async (values) => {
          console.log({ values });
          const result = await props.onSubmit(values);
          if (result.success) {
            toastShow({ type: 'success', text: result.message });
            props.setShow(false);
          }
        }}
      >
        {({ handleSubmit, setFieldValue, values, isValid, isSubmitting }) => (
          <form
            className="flex flex-col gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Select
              id="id"
              name="id"
              value={values.id}
              options={props.telemarketers || {}}
              onChange={(e) => setFieldValue('id', +e.target.value)}
            />

            <Select
              id="year"
              name="year"
              value={values.year}
              options={years}
              onChange={(e) => setFieldValue('year', +e.target.value)}
            />

            <Select
              id="month"
              name="month"
              value={values.month}
              options={months}
              onChange={(e) => setFieldValue('month', +e.target.value)}
            />

            <Button disabled={!isValid} loading={isSubmitting}>
              Submit
            </Button>
          </form>
        )}
      </Formik>
    </Modal>
  );
}
