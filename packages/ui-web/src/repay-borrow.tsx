import { Formik } from 'formik';
import React from 'react';
import { Button } from './buttons';
import { Card } from './card';
import { Input } from './form';
import { Modal } from './modal';
import { toastShow } from './toast';

export type RepayBorrowFormValues = {
  id: number;
  amount: number;
  ref: string;
};

export type RepayBorrowProps = {
  values: {
    id: number;

    mobile: string;
    name: string;
    amount: number;
  };
  onSubmit(
    values: RepayBorrowFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function RepayBorrow({ values, onSubmit }: RepayBorrowProps) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <RepayBorrowForm
        values={values}
        show={show}
        setShow={setShow}
        onSubmit={onSubmit}
      />

      <Button onClick={() => setShow(true)}>Repay borrow</Button>
    </>
  );
}

function RepayBorrowForm({
  show,
  setShow,
  values,
  onSubmit,
}: RepayBorrowProps & {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const initialValues: RepayBorrowFormValues = {
    id: values.id,
    amount: 0,
    ref: '',
  };

  return (
    <Modal show={show} setShow={setShow} title="RepayBorrow validation form">
      <Card className="mb-2.5">
        <div className="*:flex *:justify-between *:*:*:last:font-bold">
          <div>
            <div>Name</div>
            <div>
              <span>{values.name}</span>
            </div>
          </div>

          <div>
            <div>Mobile</div>
            <div>
              <span>{values.mobile}</span>
            </div>
          </div>

          <div>
            <div>Remaining amount</div>
            <div>
              <span>{values.amount} XAF</span>
            </div>
          </div>
        </div>
      </Card>

      <Formik
        initialValues={initialValues}
        onSubmit={async (data) => {
          const result = await onSubmit(data);
          if (result.success) {
            toastShow({ type: 'success', text: result.message });
            setShow(false);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, isSubmitting }) => (
          <form
            className="flex flex-col gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input type="hidden" value={values.id} />

            <Input
              type="number"
              name="amount"
              label="Amount"
              value={values.amount}
              onChange={handleChange('amount')}
            />

            <Input
              name="ref"
              value={values.ref}
              label="Transaction ID"
              onChange={handleChange('ref')}
            />

            <Button loading={isSubmitting}>Submit</Button>
          </form>
        )}
      </Formik>
    </Modal>
  );
}
