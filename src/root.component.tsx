import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, LaboratoryPictogram, PageHeader } from '@openmrs/esm-framework';
import styles from './root.scss';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import NdrExport from './extraction-dashboard.component';

const Root: React.FC = () => {
  const { t } = useTranslation();
  const [lastNDRRunDate, setLastNDRRunDate] = useState<string>('16/05/2025');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastNDRRunDate = async () => {
      try {
        // Try to fetch the last_ndr_update global property
        const response = await openmrsFetch('/ws/rest/v1/systemsetting/ndr_last_run_date');

        if (response.data?.value) {
          setLastNDRRunDate(response.data.value);
        } else {
          // Fallback if no value
          setLastNDRRunDate('16/05/2025');
        }
      } catch (error) {
        console.error('Error fetching last_ndr_update:', error);

        // Try alternative endpoint structure
        try {
          const response = await openmrsFetch('/ws/rest/v1/systemsetting?q=ndr_last_run_date');

          if (response.data?.results?.length > 0) {
            const property = response.data.results[0];
            setLastNDRRunDate(property.value || '16/05/2025');
          } else {
            setLastNDRRunDate('16/05/2025');
          }
        } catch (error2) {
          console.error('Alternative fetch also failed:', error2);
          setLastNDRRunDate('16/05/2025');
        }
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
            title={t('recapture', 'NDR Export')}
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
