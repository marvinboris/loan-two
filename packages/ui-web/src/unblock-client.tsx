import { Formik } from 'formik';
import React from 'react';
import { Button } from './buttons';
import { Card } from './card';
import { Modal } from './modal';
import { toastShow } from './toast';

export type UnblockClientFormValues = {
  id: number;
};

export type UnblockClientProps = {
  values: {
    id: number;

    mobile: string;
    name: string;
  };
  onSubmit(
    values: UnblockClientFormValues
  ): Promise<{ message: string; success: boolean }>;
};

export function UnblockClient({ values, onSubmit }: UnblockClientProps) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <UnblockClientForm
        values={values}
        show={show}
        setShow={setShow}
        onSubmit={onSubmit}
      />

      <Button onClick={() => setShow(true)}>Unblock</Button>
    </>
  );
}

function UnblockClientForm({
  show,
  setShow,
  values,
  onSubmit,
}: UnblockClientProps & {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const initialValues: UnblockClientFormValues = {
    id: values.id,
  };

  return (
    <Modal show={show} setShow={setShow} title="UnblockClient validation form">
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
        {({ handleSubmit, values, isSubmitting }) => (
          <form
            className="flex flex-col gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input type="hidden" value={values.id} />

            <Button loading={isSubmitting}>Submit</Button>
          </form>
        )}
      </Formik>
    </Modal>
  );
}
