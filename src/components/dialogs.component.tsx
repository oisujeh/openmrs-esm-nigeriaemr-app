import React from 'react';
import {
  Modal,
  Loading,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Stack,
  TextArea,
} from '@carbon/react';

import { type BatchesDialogProps, type ErrorLogsDialogProps, type WaitDialogProps } from '../types';

export const WaitDialog: React.FC<WaitDialogProps> = ({ open }) => (
  <Modal open={open} passiveModal modalHeading="Processing" modalLabel="Please wait">
    <Stack gap={4} orientation="vertical">
      <Loading description="Operation in progress" withOverlay={false} />
    </Stack>
  </Modal>
);

export const BatchesDialog: React.FC<BatchesDialogProps> = ({ open, onClose, batches }) => (
  <Modal
    open={open}
    modalHeading="NDR Batch IDs"
    primaryButtonText="Close"
    onRequestClose={onClose}
    onRequestSubmit={onClose}
  >
    <TextArea labelText="Batch IDs" value={batches.join('\n')} readOnly style={{ height: '250px' }} />
  </Modal>
);

export const ErrorLogsDialog: React.FC<ErrorLogsDialogProps> = ({ open, onClose, errorLogs }) => {
  const headers = [
    { key: 'index', header: 'S/No.' },
    { key: 'filename', header: 'Filename' },
    { key: 'patientId', header: 'Patient ID' },
    { key: 'errorMessage', header: 'Error Messages' },
  ];

  const rows = errorLogs.map((log, index) => ({
    id: index.toString(),
    index: index + 1,
    filename: log.filename,
    patientId: log.patientId,
    errorMessage: log.errorMessage,
  }));

  return (
    <Modal
      open={open}
      modalHeading="NDR Error Logs"
      primaryButtonText="Close"
      onRequestClose={onClose}
      onRequestSubmit={onClose}
      size="lg"
    >
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </Modal>
  );
};
