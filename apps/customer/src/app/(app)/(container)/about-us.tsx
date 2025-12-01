import { useTitle } from '@cfafrica/hooks';
import { Section, Typography } from '@cfafrica/ui';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

export default function Page() {
  const { t } = useTranslation();

  useTitle(t('about_us.title'));

  return (
    <ScrollView>
      <Section>
        <Typography>{t('about_us.content')}</Typography>
      </Section>
    </ScrollView>
  );
}
