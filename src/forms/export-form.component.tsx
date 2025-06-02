import React from 'react';
import {
  Form,
  FormGroup,
  Checkbox,
  TextInput,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Button,
  Stack,
  Tile,
} from '@carbon/react';
import { type ExportFormProps } from '../types';
import styles from './export-form.scss';

const ExportForm: React.FC<ExportFormProps> = ({
  custom,
  customStart,
  identifiers,
  fromDate,
  toDate,
  extractionOpt,
  onCustomChange,
  onCustomStartChange,
  onIdentifiersChange,
  onFromDateChange,
  onToDateChange,
  onExtractionOptChange,
  onExport,
  onClear,
}) => {
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    // Extract just the date part: "2025-05-26" from "2025-05-26 09:22:48"
    const datePart = dateTimeString.split(' ')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  console.log('Original toDate:', toDate);

  return (
    <div className={styles.container}>
      <Tile style={{ backgroundColor: '#00463f', color: 'white', maxWidth: '50%', margin: '0 auto', padding: '2rem' }}>
        <Form>
          <FormGroup legendText="">
            <Checkbox id="custom-checkbox" labelText="Custom" checked={custom} onChange={onCustomChange} />
          </FormGroup>

          {custom && (
            <div className={styles.container}>
              <FormGroup>
                <TextInput
                  id="identifiers"
                  labelText="Patient Identifiers"
                  value={identifiers}
                  onChange={(e) => onIdentifiersChange(e.target.value)}
                  placeholder="comma separated patient identifiers or Ids"
                  style={{ backgroundColor: '#E8F0FE' }}
                />
              </FormGroup>

              <FormGroup>
                <Checkbox
                  id="custom-start-checkbox"
                  labelText="Export from Inception"
                  checked={customStart}
                  onChange={onCustomStartChange}
                  className="custom-white-checkbox"
                />
              </FormGroup>

              {!customStart && (
                <div className={styles.dateRangeContainer}>
                  <FormGroup>
                    <DatePicker
                      dateFormat="d/m/Y"
                      datePickerType="single"
                      defaultValue={fromDate ? [fromDate] : []} // Use defaultValue instead of value
                      onChange={(dates: Array<string | Date>) => {
                        const date = dates[0];
                        if (date) {
                          const isoDate = formatDateToISO(date);
                          onFromDateChange(isoDate);
                        }
                      }}
                    >
                      <DatePickerInput
                        id="from-date"
                        labelText="Start Date"
                        placeholder="dd/mm/yyyy"
                        style={{ backgroundColor: '#E8F0FE' }}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </DatePicker>
                  </FormGroup>

                  <FormGroup>
                    <DatePicker
                      dateFormat="d/m/Y"
                      datePickerType="single"
                      value={toDate ? [parseDateTime(toDate)] : []}
                      onChange={() => {}}
                      disabled
                    >
                      <DatePickerInput
                        id="to-date"
                        labelText="End Date"
                        placeholder="dd/mm/yyyy"
                        style={{ backgroundColor: '#E8F0FE' }}
                        className="custom-datepicker-label"
                        disabled
                      />
                    </DatePicker>
                  </FormGroup>
                </div>
              )}
            </div>
          )}

          <Stack gap={4} orientation="horizontal" style={{ marginTop: '1rem' }}>
            <Button kind="primary" onClick={onExport} style={{ flex: 1 }}>
              Export
            </Button>
            {custom && (
              <Button kind="secondary" onClick={onClear} style={{ flex: 1 }}>
                Clear
              </Button>
            )}
          </Stack>
        </Form>
      </Tile>

      <Stack
        gap={4}
        orientation="horizontal"
        style={{
          marginTop: '1rem',
          justifyContent: 'center',
          borderTop: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          padding: '1rem 0',
        }}
      >
        <FormGroup legendText="">
          <RadioButtonGroup
            name="extraction-format"
            valueSelected={extractionOpt}
            onChange={onExtractionOptChange}
            orientation="horizontal"
          >
            <RadioButton id="xml-option" labelText="Extract as XML" value="xml" />
            <RadioButton id="json-option" labelText="Extract as JSON" value="json" />
          </RadioButtonGroup>
        </FormGroup>
      </Stack>
    </div>
  );
};

export default ExportForm;
