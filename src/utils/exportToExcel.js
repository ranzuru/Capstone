import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

const exportDataToExcel = (
  data,
  headers,
  fileName = 'ExportedData',
  options = {}
) => {
  const { dateFields = [], excludeColumns = [], booleanFields = [] } = options;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  const filteredHeaders = headers.filter(
    (header) => !excludeColumns.includes(header.key)
  );

  // Define columns with headers and key
  worksheet.columns = filteredHeaders.map((header) => ({
    header: header.title,
    key: header.key,
    style: header.style || {},
  }));

  // Add rows to the worksheet
  data.forEach((record) => {
    const formattedRecord = { ...record };
    // Format the date fields
    dateFields.forEach((field) => {
      if (formattedRecord[field]) {
        const date = new Date(formattedRecord[field]);
        formattedRecord[field] = format(date, 'yyyy-MM-dd');
      }
    });

    // Convert boolean fields to 'Yes' or 'No'
    booleanFields.forEach((field) => {
      if (typeof formattedRecord[field] === 'boolean') {
        formattedRecord[field] = formattedRecord[field] ? 'Yes' : 'No';
      }
    });

    // Exclude the specified columns from the record
    excludeColumns.forEach((col) => delete formattedRecord[col]);

    worksheet.addRow(formattedRecord);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxColumnLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let columnLength = cell.value ? cell.value.toString().length : 0;
      maxColumnLength = Math.max(maxColumnLength, columnLength);
    });
    column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
  });

  // Write to a buffer and trigger download
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}.xlsx`);
  });
};

export default exportDataToExcel;
