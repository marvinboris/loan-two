import { useTitle } from '@cfafrica/hooks';
import { Section, Typography } from '@cfafrica/ui';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

export default function Page() {
  const { t } = useTranslation();

  useTitle(t('privacy_policy.title'));

  return (
    <ScrollView>
      <Section borderless={false}>
        <Typography>{t('privacy_policy.content')}</Typography>
      </Section>
    </ScrollView>
  );
}
