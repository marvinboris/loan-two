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

export type CollectionDailyPerformanceFormValues = {
  id: number;
  date: string;
};

export type CollectionDailyPerformanceProps = {
  collectors?: Record<string, string>;
  onSubmit(
    values: CollectionDailyPerformanceFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function CollectionDailyPerformance(
  props: CollectionDailyPerformanceProps
) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      {props.collectors && (
        <CollectionDailyPerformanceForm
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

function CollectionDailyPerformanceForm(
  props: CollectionDailyPerformanceProps & {
    show: boolean;
    setShow: (show: boolean) => void;
  }
) {
  const initialValues: CollectionDailyPerformanceFormValues = {
    date: moment().format('YYYY-MM-DD'),
    id: +Object.keys(props.collectors || {})[0],
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
      title="Generate Collection Daily Performance"
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
              options={props.collectors || {}}
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
