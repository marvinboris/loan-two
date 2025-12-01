import {
  Button,
  Contact,
  ContactInput,
  DateInput,
  Form,
  Section,
  TextInput,
} from '@cfafrica/ui';
import { kycState$ } from '@cfafrica/utils';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import z from 'zod';
import { toFormikValidate } from 'zod-formik-adapter';

export default function Page() {
  const { t } = useTranslation();

  const initialValues: {
    firstName?: string;
    lastName: string;
    location: string;
    birthdate: string;
    nid: string;
    emergencyNumber1: Contact;
    emergencyNumber2?: Contact;
  } = React.useMemo(
    () =>
      kycState$.get() || {
        lastName: '',
        location: '',
        birthdate: '',
        nid: '',
        emergencyNumber1: {
          name: '',
          mobile: '',
        },
      },
    []
  );

  const Schema = React.useMemo(
    () =>
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().nonempty(),
        location: z.string().nonempty(),
        birthdate: z.string().date(),
        nid: z.string().nonempty(),
        emergencyNumber1: z.object({
          mobile: z.string().nonempty(),
          name: z.string().optional(),
        }),
        emergencyNumber2: z
          .object({
            mobile: z.string().nonempty(),
            name: z.string().optional(),
          })
          .optional(),
      }),
    []
  );

  return (
    <Section
      titleText={t('kyc.personal_info.title')}
      subtitleText={t('kyc.personal_info.subtitle')}
    >
      <Formik
        initialValues={initialValues}
        validate={toFormikValidate(Schema)}
        onSubmit={(data) => {
          kycState$.assign(data);
          router.navigate('/kyc/1');
        }}
      >
        {({
          errors,
          handleChange,
          handleSubmit,
          setFieldValue,
          values,
          isValid,
        }) => (
          <Form>
            <TextInput
              id="firstName"
              name="firstName"
              error={errors.firstName}
              value={values.firstName}
              label={t('kyc.first_name')}
              onChange={handleChange('firstName')}
            />

            <TextInput
              required
              id="lastName"
              name="lastName"
              error={errors.lastName}
              value={values.lastName}
              label={t('kyc.last_name')}
              onChange={handleChange('lastName')}
            />

            <TextInput
              required
              id="location"
              name="location"
              error={errors.location}
              value={values.location}
              label={t('kyc.location')}
              onChange={handleChange('location')}
            />

            <DateInput
              required
              id="birthdate"
              name="birthdate"
              error={errors.birthdate}
              value={values.birthdate}
              label={t('kyc.birthdate')}
              onChange={handleChange('birthdate')}
            />

            <TextInput
              required
              id="nid"
              name="nid"
              error={errors.nid}
              value={values.nid}
              label={t('kyc.nid')}
              onChange={handleChange('nid')}
            />

            <ContactInput
              required
              id="emergencyNumber1"
              name="emergencyNumber1"
              error={errors.emergencyNumber1}
              value={values.emergencyNumber1}
              label={t('kyc.emergency_number_1')}
              onChange={(value) => setFieldValue('emergencyNumber1', value)}
            />

            <ContactInput
              id="emergencyNumber2"
              name="emergencyNumber2"
              error={errors.emergencyNumber2}
              value={values.emergencyNumber2}
              label={t('kyc.emergency_number_2')}
              onChange={(value) => setFieldValue('emergencyNumber2', value)}
            />

            <Button
              iconRight
              disabled={!isValid}
              icon={ArrowRightIcon}
              title={t('kyc.next')}
              onPress={() => handleSubmit()}
              containerStyle={{ alignItems: 'center' }}
            />
          </Form>
        )}
      </Formik>
    </Section>
  );
}
