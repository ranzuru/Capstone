import pdfMake from 'pdfmake/build/pdfmake';
const pdfFonts = require('pdfmake/build/vfs_fonts');
import PropTypes from 'prop-types';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const buildTableBody = (data, columns) => {
  const body = [];

  // Inserting headers
  body.push(
    columns.map((column) => ({ text: column.title, style: 'tableHeader' }))
  );

  // Inserting rows
  data.forEach((row) => {
    const dataRow = [];

    columns.forEach((column) => {
      dataRow.push(row[column.key].toString());
    });

    body.push(dataRow);
  });

  return body;
};

const generateTable = (data, columns, widths) => {
  const columnWidths = widths || columns.map(() => '*');
  return {
    table: {
      headerRows: 1,
      widths: columnWidths,
      body: buildTableBody(data, columns),
    },
    layout: 'noBorders',
  };
};

const generateHealthCardPDF = (studentData, title) => {
  const tableColumns = [
    { title: 'Attribute', key: 'attribute' },
    { title: 'Value', key: 'value' },
  ];

  const studentDetails = [
    { attribute: 'Name', value: studentData.name },
    { attribute: 'LRN', value: studentData.lrn },
    { attribute: 'Sex', value: studentData.gender },
    { attribute: 'Date of Birth', value: studentData.dateOfBirth },
    { attribute: 'Grade/Section', value: studentData.gradeAndSection },
  ];

  const docDefinition = {
    content: [
      {
        text: title,
        fontSize: 16,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      generateTable(studentDetails, tableColumns),
      // ... any additional sections ...
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 12,
        margin: [0, 5, 0, 5],
        alignment: 'left',
      },
      // ... any additional styles ...
    },
    defaultStyle: {
      columnGap: 20,
    },
  };

  pdfMake.createPdf(docDefinition).download(`${title.replace(/ /g, '_')}.pdf`);
};

generateHealthCardPDF.propTypes = {
  studentData: PropTypes.shape({
    formattedName: PropTypes.string.isRequired,
    lrn: PropTypes.string.isRequired,
    formattedDateOfBirth: PropTypes.string.isRequired,
    // ... define PropTypes for additional fields as needed ...
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default generateHealthCardPDF;
