import React from 'react';
import {
  Button,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@carbon/react';
// eslint-disable-next-line no-restricted-imports
import { Download, List, Pause, Play, Renew, TrashCan, View, WarningFilled, CloudDownload } from '@carbon/icons-react';
import { type FileListProps, type NDRFile } from '../types';
import { convertToDownloadUrl } from '../utils/pathUtils';

const FileList: React.FC<FileListProps> = ({
  files,
  onDelete,
  onRestart,
  onResume,
  onPause,
  onViewBatches,
  onViewErrorLogs,
}) => {
  const headers = [
    { key: 'owner', header: 'Created By' },
    { key: 'name', header: 'File Name' },
    { key: 'dateStarted', header: 'Date Started' },
    { key: 'dateEnded', header: 'Date Completed' },
    { key: 'total', header: 'Total No. of Patients' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  // Helper function to get status color
  const getStatusTag = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('completed')) {
      if (statusLower.includes('error')) {
        return <Tag type="orange">{status}</Tag>; // Completed with errors
      }
      return <Tag type="green">{status}</Tag>; // Completed successfully
    }

    switch (statusLower) {
      case 'failed':
        return <Tag type="red">{status}</Tag>;
      case 'processing':
        return <Tag type="blue">{status}</Tag>;
      case 'paused':
        return <Tag type="orange">{status}</Tag>;
      default:
        return <Tag type="gray">{status}</Tag>;
    }
  };

  // Helper function to render processing status with progress
  const renderProgressBar = (file: NDRFile) => {
    const processed = file.processed || 0;
    const total = file.total || 0;
    const percentage = total > 0 ? ((processed / total) * 100).toFixed(2) : '0.00';

    return (
      <div
        style={{
          fontSize: '12px',
          color: '#6f6f6f',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: '8px',
        }}
      >
        <span>{percentage}%</span>
        <div
          style={{
            width: '80px',
            height: '4px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: '#0f62fe',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    );
  };

  const renderFileActions = (file: NDRFile) => {
    const actions = [];
    const status = file.status.toLowerCase();

    // Handle different status cases
    const isCompleted = status.includes('completed');
    const hasErrors = status.includes('error') || file.hasError;

    if (isCompleted) {
      if (file.active) {
        // Download main file
        actions.push(
          <Button
            key="download"
            kind="ghost"
            renderIcon={Download}
            iconDescription="Download file"
            hasIconOnly
            size="sm"
            onClick={() => {
              window.location.href = convertToDownloadUrl(file.path);
            }}
          />,
        );

        // Download error file if exists (for completed with errors)
        if (hasErrors && file.errorPath) {
          actions.push(
            <Button
              key="errorDownload"
              kind="ghost"
              renderIcon={WarningFilled}
              iconDescription="Download error file"
              hasIconOnly
              size="sm"
              onClick={() => {
                window.location.href = convertToDownloadUrl(file.errorPath!);
              }}
            />,
          );
        }

        if (hasErrors && file.errorList) {
          actions.push(
            <Button
              key="csvDownload"
              kind="ghost"
              renderIcon={CloudDownload}
              iconDescription="Download error CSV"
              hasIconOnly
              size="sm"
              onClick={() => {
                window.location.href = convertToDownloadUrl(file.errorList);
              }}
            />,
          );
        }

        // Delete action
        actions.push(
          <Button
            key="delete"
            kind="ghost"
            renderIcon={TrashCan}
            iconDescription="Delete file"
            hasIconOnly
            size="sm"
            onClick={() => onDelete(file.number)}
          />,
        );

        // Restart action
        actions.push(
          <Button
            key="restart"
            kind="ghost"
            renderIcon={Renew}
            iconDescription="Restart file"
            hasIconOnly
            size="sm"
            onClick={() => onRestart(file.number)}
          />,
        );
      }
    } else {
      switch (status) {
        case 'failed':
          if (file.active) {
            // Restart action for failed files
            actions.push(
              <Button
                key="restart"
                kind="ghost"
                renderIcon={Renew}
                iconDescription="Restart failed file"
                hasIconOnly
                size="sm"
                onClick={() => onRestart(file.number)}
              />,
            );

            // Download action for failed files (if path exists)
            if (file.path) {
              actions.push(
                <Button
                  key="download"
                  kind="ghost"
                  renderIcon={Download}
                  iconDescription="Download file"
                  hasIconOnly
                  size="sm"
                  onClick={() => {
                    window.location.href = convertToDownloadUrl(file.path);
                  }}
                />,
              );
            }

            // Download error file if exists
            if (file.hasError && file.errorPath) {
              actions.push(
                <Button
                  key="errorDownload"
                  kind="ghost"
                  renderIcon={WarningFilled}
                  iconDescription="Download error file"
                  hasIconOnly
                  size="sm"
                  onClick={() => {
                    window.location.href = convertToDownloadUrl(file.errorPath);
                  }}
                />,
              );
            }

            // Delete action for failed files
            actions.push(
              <Button
                key="delete"
                kind="ghost"
                renderIcon={TrashCan}
                iconDescription="Delete failed file"
                hasIconOnly
                size="sm"
                onClick={() => onDelete(file.number)}
              />,
            );
          }
          break;

        case 'paused':
          // Resume action for paused files
          actions.push(
            <Button
              key="resume"
              kind="ghost"
              renderIcon={Play}
              iconDescription="Resume file"
              hasIconOnly
              size="sm"
              onClick={() => onResume(file.number)}
            />,
          );

          // Delete action for paused files
          actions.push(
            <Button
              key="delete"
              kind="ghost"
              renderIcon={TrashCan}
              iconDescription="Delete paused file"
              hasIconOnly
              size="sm"
              onClick={() => onDelete(file.number)}
            />,
          );
          break;

        case 'processing':
          // Pause action for processing files
          actions.unshift(renderProgressBar(file));

          actions.push(
            <Button
              key="pause"
              kind="ghost"
              renderIcon={Pause}
              iconDescription="Pause file"
              hasIconOnly
              size="sm"
              onClick={() => onPause(file.number)}
            />,
          );
          break;

        default:
          // For other statuses, show basic actions if active
          if (file.active) {
            actions.push(
              <Button
                key="delete"
                kind="ghost"
                renderIcon={TrashCan}
                iconDescription="Delete file"
                hasIconOnly
                size="sm"
                onClick={() => onDelete(file.number)}
              />,
            );
          }
          break;
      }
    }

    // View batches action (available for files with batch IDs)
    if (file.ndrBatchIds && file.ndrBatchIds.trim() !== '') {
      actions.push(
        <Button
          key="viewBatches"
          kind="ghost"
          renderIcon={View}
          iconDescription="View batches"
          hasIconOnly
          size="sm"
          onClick={() => onViewBatches(file.ndrBatchIds!, file.name)}
        />,
      );
    }

    // View error logs action (available when error logs are pulled)
    if (file.errorLogsPulled === 'yes') {
      actions.push(
        <Button
          key="viewLogs"
          kind="ghost"
          renderIcon={List}
          iconDescription="View error logs"
          hasIconOnly
          size="sm"
          onClick={() => onViewErrorLogs(file.number, file.name)}
        />,
      );
    }

    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {actions.length > 0 ? actions : <span>—</span>}
      </div>
    );
  };

  // Handle empty files case
  if (!files || files.length === 0) {
    return (
      <TableContainer>
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6f6f6f',
          }}
        >
          No files found
        </div>
      </TableContainer>
    );
  }

  const rows = files.map((file) => ({
    id: file.number.toString(),
    owner: file.owner,
    name: file.name,
    dateStarted: file.dateStarted,
    dateEnded: file.dateEnded || '—',
    total: file.total?.toString() || '0',
    status: getStatusTag(file.status),
    actions: renderFileActions(file),
  }));

  return (
    <TableContainer>
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
    </TableContainer>
  );
};

export default FileList;
