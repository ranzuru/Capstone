import ExcelJS from 'exceljs';

async function parseExcelToJson(buffer, headerMapper) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);

    let headers = {};
    let data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = headerMapper
            ? headerMapper(cell.value)
            : cell.value;
        });
      } else {
        let rowData = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        data.push(rowData);
      }
    });

    return data;
  } catch (error) {
    console.error('Error parsing Excel file', error);
    throw error; // rethrow the error after logging
  }
}

export default parseExcelToJson;
