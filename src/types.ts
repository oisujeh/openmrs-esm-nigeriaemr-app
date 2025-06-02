import type React from 'react';

export interface NDRFile {
  owner: string;
  name: string;
  dateStarted: string;
  dateEnded: string;
  total: number;
  status: string;
  path: string;
  errorPath?: string;
  processed?: number;
  errorList?: string;
  number: number;
  active: boolean;
  hasError?: boolean;
  ndrBatchIds?: string;
  errorLogsPulled?: string;
  progress?: string;
}

export interface NDRExportProps {
  lastNDRRunDate: string;
}

export interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuth: (email: string, password: string) => Promise<void>;
  credentialsProvided: boolean;
}

export interface FileListProps {
  files: NDRFile[];
  onDelete: (id: number) => Promise<void>;
  onRestart: (id: number) => Promise<void>;
  onResume: (id: number) => Promise<void>;
  onPause: (id: number) => Promise<void>;
  onViewBatches: (ndrBatchIds: string, fileName: string) => void;
  onViewErrorLogs: (id: number, fileName: string) => Promise<void>;
}

export interface ExportFormProps {
  custom: boolean;
  customStart: boolean;
  identifiers: string;
  fromDate: string;
  toDate: string;
  extractionOpt: 'xml' | 'json';
  onCustomChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomStartChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIdentifiersChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onExtractionOptChange: (value: string, name?: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => Promise<void>;
  onClear: () => void;
}

export interface WaitDialogProps {
  open: boolean;
}

export interface BatchesDialogProps {
  open: boolean;
  onClose: () => void;
  batches: string[];
}

export interface ErrorLogsDialogProps {
  open: boolean;
  onClose: () => void;
  errorLogs: any[]; // Replace with proper error log type
}
