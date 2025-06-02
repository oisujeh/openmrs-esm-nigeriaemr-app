import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { type NDRExportProps, type NDRFile } from './types';
import AuthDialog from './components/authDialog';
import FileList from './forms/file-list.component';
import ExportForm from './forms/export-form.component';
import { WaitDialog, BatchesDialog, ErrorLogsDialog } from './components/dialogs.component';
import { Stack } from '@carbon/react';
import { buildActionUrl, buildOpenMRSActionUrl } from './utils/urlBuilder';
import { openmrsFetch } from '@openmrs/esm-framework';

const NDRExport: React.FC<NDRExportProps> = ({ lastNDRRunDate }) => {
  // State management
  const [custom, setCustom] = useState(false);
  const [customStart, setCustomStart] = useState(false);
  const [extractionOpt, setExtractionOpt] = useState<'xml' | 'json'>('xml');
  const [identifiers, setIdentifiers] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(lastNDRRunDate);
  const [fileList, setFileList] = useState<NDRFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState(0);
  const [exportTriggered, setExportTriggered] = useState(false);
  const [apiPushDone, setApiPushDone] = useState(false);
  const [totalJSONFiles, setTotalJSONFiles] = useState(0);
  const [totalPushed, setTotalPushed] = useState(0);
  const [batches, setBatches] = useState<string[]>([]);
  const [batchExport, setBatchExport] = useState(0);
  const [emptyFiles, setEmptyFiles] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showBatchesDialog, setShowBatchesDialog] = useState(false);
  const [showErrorLogsDialog, setShowErrorLogsDialog] = useState(false);
  const [showWaitDialog, setShowWaitDialog] = useState(false);
  const [credentialsProvided, setCredentialsProvided] = useState(false);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  useEffect(() => {
    setToDate(lastNDRRunDate);
  }, [lastNDRRunDate]);

  // API endpoints
  // API endpoints using buildActionUrl
  const API_ENDPOINTS = {
    getFileList: buildActionUrl('nigeriaemr', 'ndr', 'getFileList'),
    getManualFileList: buildActionUrl('nigeriaemr', 'ndr', 'getManualFileList'),
    getTotalFiles: buildActionUrl('nigeriaemr', 'ndr', 'getTotalFiles'),
    pushBatchData: buildActionUrl('nigeriaemr', 'ndr', 'pushBatchData'),
    saveNDRBatchIds: buildActionUrl('nigeriaemr', 'ndr', 'saveNDRBatchIds'),
    // Only update the file operation endpoints that need OpenMRS format
    restartFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'restartFile', true),
    resumeFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'resumeFile', true),
    deleteFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'deleteFile', true),
    pauseFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'pauseFile', true),
    viewErrorLogs: buildActionUrl('nigeriaemr', 'ndr', 'viewErrorLogs'),
    generateNDRFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'generateNDRFile', true),
    generateCustomNDRFile: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'generateCustomNDRFile', true),

    auth: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'auth', true),
    reAuth: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'reAuth', true),
    checkAuth: buildOpenMRSActionUrl('nigeriaemr', 'ndr', 'checkAuth', true),
    checkApiExportsWithPendingNdrErrorLogs: buildActionUrl(
      'nigeriaemr',
      'ndr',
      'checkApiExportsWithPendingNdrErrorLogs',
    ),
    getLogs: buildActionUrl('nigeriaemr', 'ndr', 'getLogs'),
  };

  // Check online status
  const checkOnlineStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://emr-ndrpush.phis3project.org.ng/v1/utils/ping');
      return response.status >= 200 && response.status < 300;
    } catch (err) {
      alert('You do not have an active internet connection');
      return false;
    }
  };

  // Load file list
  const loadFileList = useCallback(
    async (showProgressDialog: boolean = true) => {
      if (showProgressDialog) setShowWaitDialog(true);

      try {
        const url = custom
          ? buildActionUrl('nigeriaemr', 'ndr', 'getManualFileList')
          : buildActionUrl('nigeriaemr', 'ndr', 'getFileList');

        const response = await openmrsFetch(url);

        // Check if the data is a string that needs parsing
        let fileListData = response.data;

        if (typeof fileListData === 'string') {
          try {
            fileListData = JSON.parse(fileListData);
            // eslint-disable-next-line no-console
            console.log('Parsed JSON data:', fileListData);
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            setFileList([]);
            return;
          }
        }

        // eslint-disable-next-line no-console
        console.log('Final fileListData:', fileListData);
        // eslint-disable-next-line no-console
        console.log('Is array after parsing?', Array.isArray(fileListData));

        if (!Array.isArray(fileListData)) {
          console.error('Data is still not an array after parsing:', typeof fileListData);
          setFileList([]);
          return;
        }

        const processingFiles = fileListData.filter((file: NDRFile) => !file.active || file.status === 'Processing');

        const hasProcessing = processingFiles.length > 0;
        setProcessing(hasProcessing);
        setProcessingFile(processingFiles.length);
        setFileList(fileListData);
      } catch (error: any) {
        console.error('Error loading file list', error);

        if (error?.response?.status === 401) {
          alert('Unauthorized. Please log in again.');
        } else if (showProgressDialog) {
          alert('There was an error loading the file list');
        }
      } finally {
        setShowWaitDialog(false);
      }
    },
    [custom],
  );

  // Initial load
  useEffect(() => {
    loadFileList();
  }, [custom]);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadFileList(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [custom]);

  // Handle authentication
  const handleAuth = async (email: string, password: string) => {
    try {
      const baseUrl = credentialsProvided ? API_ENDPOINTS.reAuth : API_ENDPOINTS.auth;

      // Build URL with query parameters
      const params = new URLSearchParams({
        email: email,
        password: password,
      });

      const url = `${baseUrl}&${params.toString()}`;

      // Use GET request instead of POST
      const response = await axios.get(url);

      if (response.data.token) {
        alert('Authentication successful!');
        setShowAuthDialog(false);
      } else {
        alert(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      alert('Authentication failed. Please check your credentials.');
    }
  };

  // Handle file operations
  const handleDeleteFile = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setShowWaitDialog(true);
      try {
        // Use GET request with query parameters (matching the OpenMRS format)
        const url = `${API_ENDPOINTS.deleteFile}&id=${id}`;
        const response = await axios.get(url);

        if (response.data) {
          alert('File deleted');
          loadFileList();
        } else {
          alert('There was an error deleting file');
        }
      } catch (error) {
        alert('There was an error deleting file');
      } finally {
        setShowWaitDialog(false);
      }
    }
  };

  const handleRestartFile = async (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to restart? This will delete your previous file and restart the export from the beginning',
      )
    ) {
      setShowWaitDialog(true);
      try {
        // Use GET request with query parameters (matching the OpenMRS format)
        const url = `${API_ENDPOINTS.restartFile}&id=${id}&action=none`;
        const response = await axios.get(url);

        if (response.data) {
          alert('Restart initiated');
          loadFileList();
        } else {
          alert('There was an error restarting');
        }
      } catch (error) {
        alert('There was an error restarting');
      } finally {
        setShowWaitDialog(false);
      }
    }
  };

  const handleResumeFile = async (id: number) => {
    if (window.confirm('Are you sure you want to resume?')) {
      setExportTriggered(true);
      setApiPushDone(false);
      setProcessing(true);
      setShowWaitDialog(true);

      try {
        // Use GET request with query parameters (matching the OpenMRS format)
        const url = `${API_ENDPOINTS.resumeFile}&id=${id}`;
        const response = await axios.get(url);

        if (response.data) {
          alert('Resumed');
          loadFileList();
        } else {
          alert('There was an error resuming');
        }
      } catch (error) {
        alert('There was an error resuming');
      } finally {
        setShowWaitDialog(false);
      }
    }
  };

  const handlePauseFile = async (id: number) => {
    if (window.confirm('Are you sure you want to pause the process?')) {
      setShowWaitDialog(true);

      if (id) {
        try {
          // API_ENDPOINTS.pauseFile already includes the successUrl
          const url = `${API_ENDPOINTS.pauseFile}&id=${id}`;
          const response = await axios.get(url);

          if (response.data) {
            alert('paused');
            loadFileList();
          } else {
            alert('There was an error pausing the process');
            loadFileList();
          }
        } catch (error: any) {
          console.error('Pause file error:', error);
          alert('There was an error stopping the process');
          loadFileList();
        } finally {
          setShowWaitDialog(false);
        }
      }
    }
  };

  const handleViewBatches = (ndrBatchIds: string, fileName: string) => {
    setShowBatchesDialog(true);
    const batchIds = ndrBatchIds.split(',');
    setBatches(batchIds);
  };

  const handleViewErrorLogs = async (id: number, fileName: string) => {
    setShowWaitDialog(true);
    try {
      const response = await axios.post(API_ENDPOINTS.viewErrorLogs, { id });
      if (response.data) {
        setErrorLogs(response.data);
        setShowErrorLogsDialog(true);
      } else {
        alert('An error was encountered while trying to retrieve NDR Error logs');
      }
    } catch (error) {
      alert('There was an error fetching the error logs. Please try again later');
    } finally {
      setShowWaitDialog(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExportTriggered(true);
    setApiPushDone(false);
    setProcessingFile(0);
    setProcessing(true);
    setShowWaitDialog(true);

    try {
      const baseUrl = custom ? API_ENDPOINTS.generateCustomNDRFile : API_ENDPOINTS.generateNDRFile;

      // Build URL with query parameters
      const params = new URLSearchParams({
        identifiers: identifiers === 'comma separated patient identifiers or Ids' ? '' : identifiers,
        from: fromDate || '1990-01-01',
        opt: extractionOpt,
      });

      const url = `${baseUrl}&${params.toString()}`;

      // Use GET request instead of POST
      const response = await axios.get(url);

      if (response.data && response.data.endsWith && response.data.endsWith('.zip')) {
        window.location.href = response.data;
      } else {
        alert(response.data || 'Export completed');
      }
    } catch (error: any) {
      if (error.response?.status === 408) {
        alert("The export will take a while, the list will be updated when it's done");
      } else {
        alert('There was an error generating NDR files');
      }
    } finally {
      setShowWaitDialog(false);
      await loadFileList();
    }
  };

  // For Debugging
  const debugHandler = (handlerName: string, handler: Function) => {
    return (...args: any[]) => {
      // eslint-disable-next-line no-console
      console.log(`Calling ${handlerName} with args:`, args);
      try {
        return handler(...args);
      } catch (error) {
        console.error(`Error in ${handlerName}:`, error);
        // eslint-disable-next-line no-console
        console.log('Arguments were:', args);
        throw error;
      }
    };
  };

  return (
    <Stack gap={6}>
      <ExportForm
        custom={custom}
        customStart={customStart}
        identifiers={identifiers}
        fromDate={fromDate}
        toDate={toDate}
        extractionOpt={extractionOpt}
        onCustomChange={(e) => {
          setCustom(e.target.checked);
          if (!e.target.checked) {
            setIdentifiers('');
            setFromDate('');
            setToDate(lastNDRRunDate);
          }
        }}
        onCustomStartChange={(e) => {
          setCustomStart(e.target.checked);
          if (e.target.checked) {
            setFromDate('');
          }
        }}
        onIdentifiersChange={setIdentifiers}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onExtractionOptChange={async (value, name, event) => {
          // Carbon's RadioButtonGroup passes (value, name, event) as parameters
          const newOpt = value as 'xml' | 'json';
          setExtractionOpt(newOpt);
          if (newOpt === 'json') {
            try {
              const response = await axios.get(API_ENDPOINTS.checkAuth);
              if (response.data.code > 0 && response.data.token) {
                setShowAuthDialog(false);
              } else {
                if (response.data.credentialsProvided) {
                  setCredentialsProvided(true);
                  setShowAuthDialog(true);
                } else {
                  setShowAuthDialog(true);
                }
              }
            } catch (error) {
              setExtractionOpt('xml');
              alert('Authentication failed');
            }
          }
        }}
        onExport={handleExport}
        onClear={() => {
          setIdentifiers('');
          setFromDate('');
        }}
      />

      <FileList
        files={fileList}
        onDelete={handleDeleteFile}
        onRestart={handleRestartFile}
        onResume={handleResumeFile}
        onPause={handlePauseFile}
        onViewBatches={handleViewBatches}
        onViewErrorLogs={handleViewErrorLogs}
      />

      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuth={handleAuth}
        credentialsProvided={credentialsProvided}
      />

      <BatchesDialog open={showBatchesDialog} onClose={() => setShowBatchesDialog(false)} batches={batches} />

      <ErrorLogsDialog open={showErrorLogsDialog} onClose={() => setShowErrorLogsDialog(false)} errorLogs={errorLogs} />

      <WaitDialog open={showWaitDialog} />
    </Stack>
  );
};

export default NDRExport;
