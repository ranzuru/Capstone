import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import pdfMake from 'pdfmake/build/pdfmake';
import PropTypes from 'prop-types';
pdfMake.vfs = pdfFonts;

const buildTableBody = (data, columns) => {
  const body = [];

  // Inserting headers
  body.push(
    columns.map((column) => ({ text: column.title, style: 'tableHeader' }))
  );

  // Inserting rows
  data.forEach((row) => {
    const dataRow = columns.map((column) => {
      const cellValue = row[column.key];
      return cellValue !== undefined ? cellValue.toString() : ''; // Safeguard against undefined
    });

    body.push(dataRow);
  });

  return body;
};

const generateTable = (data, columns, widths) => {
  const columnWidths = widths || columns.map(() => 'auto');
  return {
    table: {
      headerRows: 1,
      widths: columnWidths,
      body: buildTableBody(data, columns),
    },
  };
};

const generateVerticalHeaderTable = (headers, data) => {
  const body = headers.map((header, index) => {
    return [
      { text: header, style: 'tableHeader', fillColor: '#eeeeee' },
      { text: data[index] || '' },
    ];
  });

  return {
    table: {
      body: body,
    },
    layout: 'noBorders',
  };
};

const generatePDF = (
  title,
  headerLeft,
  headerRight,
  sections,
  orientation = 'portrait'
) => {
  const docDefinition = {
    pageSize: {
      width: 8.5 * 72, // width in points
      height: 13 * 72, // height in points
    },
    styles: {
      tableHeader: {
        bold: true,
      },
    },
    pageOrientation: orientation,
    content: [
      {
        text: title,
        fontSize: 16,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          headerLeft.map((item) => ({ text: item, fontSize: 10 })),
          headerRight.map((item) => ({ text: item, fontSize: 10 })),
        ],
        columnGap: 10,
      },

      ...sections.map((section) => {
        const sectionContent = [
          {
            text: section.header,
            fontSize: 8,
            bold: true,
            margin: [0, 10, 0, 10],
          },
        ];

        section.content.forEach((contentItem) => {
          switch (contentItem.type) {
            case 'text':
              sectionContent.push({
                text: contentItem.text,
                fontSize: 8,
                margin: [0, 0, 0, 5],
              });
              break;
            case 'table':
              sectionContent.push(
                generateTable(
                  contentItem.data,
                  contentItem.columns,
                  contentItem.widths
                )
              );
              break;
            case 'verticalTable':
              sectionContent.push(
                generateVerticalHeaderTable(
                  contentItem.headers,
                  contentItem.data
                )
              );
              break;
            default:
              sectionContent.push({});
          }
        });

        return sectionContent;
      }),
    ],
  };

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
};

// PropTypes definitions
generatePDF.propTypes = {
  title: PropTypes.string.isRequired,
  headerLeft: PropTypes.arrayOf(PropTypes.string),
  headerRight: PropTypes.arrayOf(PropTypes.string),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string,
      content: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.shape({
            type: PropTypes.oneOf(['text', 'table', 'verticalTable']),
            text: PropTypes.string,
            data: PropTypes.arrayOf(PropTypes.object),
            columns: PropTypes.arrayOf(
              PropTypes.shape({
                title: PropTypes.string.isRequired,
                key: PropTypes.string.isRequired,
              })
            ),
            headers: PropTypes.arrayOf(PropTypes.string),
          }),
        ])
      ),
    })
  ).isRequired,
  orientation: PropTypes.oneOf(['portrait', 'landscape']),
};

export default generatePDF;
