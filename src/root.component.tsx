import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, LaboratoryPictogram, PageHeader } from '@openmrs/esm-framework';
import styles from './root.scss';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import NdrExport from './extraction-dashboard.component';

const Root: React.FC = () => {
  const { t } = useTranslation();
  const [lastNDRRunDate, setLastNDRRunDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastNDRRunDate = async () => {
      try {
        const response = await openmrsFetch('/ws/rest/v1/systemsetting/ndr_last_run_date');
        if (response.data?.value) {
          setLastNDRRunDate(response.data.value);
        } else {
          // No value returned
          setLastNDRRunDate(null);
        }
      } catch (error) {
        console.error('Error fetching ndr_last_run_date:', error);
        setLastNDRRunDate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLastNDRRunDate();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div>Loading NDR configuration...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SWRConfig>
        <div>
          <PageHeader
            illustration={<LaboratoryPictogram />}
            title={t('ndrExport', 'NDR Export')}
            className={styles.pageHeader}
          />
          <div className={styles.container}>
            <NdrExport lastNDRRunDate={lastNDRRunDate} />
          </div>
        </div>
      </SWRConfig>
    </BrowserRouter>
  );
};

export default Root;
