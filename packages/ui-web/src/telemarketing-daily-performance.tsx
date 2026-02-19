import { PlusIcon } from '@heroicons/react/24/outline';
import { Formik } from 'formik';
import moment from 'moment';
import React from 'react';
import z from 'zod';
import { toFormikValidate } from 'zod-formik-adapter';
import { Button } from './buttons';
import { Input, Select } from './form';
import { Modal } from './modal';
import { toastShow } from './toast';

export type TelemarketingDailyPerformanceFormValues = {
  id: number;
  date: string;
};

export type TelemarketingDailyPerformanceProps = {
  telemarketers?: Record<string, string>;
  onSubmit(
    values: TelemarketingDailyPerformanceFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function TelemarketingDailyPerformance(
  props: TelemarketingDailyPerformanceProps
) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      {props.telemarketers && (
        <TelemarketingDailyPerformanceForm
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

function TelemarketingDailyPerformanceForm(
  props: TelemarketingDailyPerformanceProps & {
    show: boolean;
    setShow: (show: boolean) => void;
  }
) {
  const initialValues: TelemarketingDailyPerformanceFormValues = {
    date: moment().format('YYYY-MM-DD'),
    id: +Object.keys(props.telemarketers || {})[0],
  };

  const Schema = React.useMemo(
    () =>
      z.object({
        id: z.number(),
        date: z.string().date(),
      }),
    []
  );

  return (
    <Modal
      show={props.show}
      setShow={props.setShow}
      title="Generate Telemarketing Daily Performance"
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

            <Input
              id="date"
              name="date"
              type="date"
              value={values.date}
              onChange={(e) => setFieldValue('date', e.target.value)}
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
