import DengueMonitoring from '../../models/DengueMonitoring.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';
import { mean, median, mode, variance } from 'simple-statistics';

export const getGroupedDengueData = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const reports = await DengueMonitoring.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: {
            ageGroup: {
              $concat: [
                { $toString: { $subtract: ['$age', { $mod: ['$age', 3] }] } },
                '-',
                {
                  $toString: {
                    $add: [{ $subtract: ['$age', { $mod: ['$age', 3] }] }, 2],
                  },
                },
              ],
            },
            gender: '$gender',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.ageGroup',
          genders: {
            $push: {
              gender: '$_id.gender',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ageGroup: '$_id',
          genders: 1,
          startAge: {
            $toInt: { $arrayElemAt: [{ $split: ['$_id', '-'] }, 0] },
          },
        },
      },
      {
        $sort: {
          startAge: 1,
        },
      },
      {
        $project: {
          ageGroup: 1,
          genders: 1,
        },
      },
    ]);

    // Reformat the data for the frontend
    let formattedData = {};
    reports.forEach((report) => {
      if (!formattedData[report.ageGroup]) {
        formattedData[report.ageGroup] = { ageGroup: report.ageGroup };
      }
      report.genders.forEach((gender) => {
        formattedData[report.ageGroup][gender.gender] = gender.count;
      });
    });

    res.json(Object.values(formattedData));
  } catch (error) {
    console.error('Error in getting grouped Dengue data:', error);
    res.status(500).send('An error occurred while processing data.');
  }
};

// Line chart
export const getMonthlyDengueCases = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    let casesByMonth = await DengueMonitoring.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $project: {
          month: { $month: '$dateOfOnset' },
          year: { $year: '$dateOfOnset' },
        },
      },
      {
        $group: {
          _id: {
            month: '$month',
            year: '$year',
          },
          totalCases: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month number here
      },
      {
        $project: {
          _id: 0,
          month: {
            $arrayElemAt: [
              [
                '',
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ],
              '$_id.month',
            ],
          },
          year: '$_id.year',
          totalCases: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    const monthOrder = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    casesByMonth = casesByMonth.sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    res.status(200).json(casesByMonth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pie chart

export const getCasesPerGrade = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const casesPerGrade = await DengueMonitoring.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(casesPerGrade);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Analytics Comparison Detail
export const calculateComparisonStatistics = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    if (!schoolYear) {
      return res
        .status(400)
        .json({ message: 'No selected school year provided.' });
    }

    // Parsing the selected school year to find the previous year
    const [startYear, endYear] = schoolYear.split('-').map(Number);
    const previousSchoolYear = `${startYear - 1}-${endYear - 1}`;

    // Find documents for the selected and previous academic years
    const academicYears = await AcademicYear.find({
      schoolYear: { $in: [schoolYear, previousSchoolYear] },
    }).lean();

    if (!academicYears.length) {
      return res.status(404).json({ message: 'Academic years not found.' });
    }

    // Fetch reports for the academic years
    const academicYearIds = academicYears.map((year) => year._id);
    const reports = await fetchDengueReportsSummary(academicYearIds);

    // Process and structure the response
    const processedData = processComparisonData(reports, academicYears);
    // summary
    const descriptiveSummary = generateComparisonSummary(processedData);

    res.json({
      data: processedData, // The raw data
      summary: descriptiveSummary, // The descriptive summary
    });
  } catch (error) {
    console.error('Error calculating comparison statistics:', error.message);
    return res.status(500).send('Error in processing request');
  }
};

const fetchDengueReportsSummary = async (academicYearIds) => {
  return DengueMonitoring.aggregate([
    {
      $match: {
        academicYear: { $in: academicYearIds },
      },
    },
    {
      $lookup: {
        from: AcademicYear.collection.name,
        localField: 'academicYear',
        foreignField: '_id',
        as: 'academicYearDetails',
      },
    },
    {
      $unwind: {
        path: '$academicYearDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        caseDurationDays: {
          $cond: {
            if: {
              $and: [
                { $ne: ['$dateOfOnset', null] },
                { $ne: ['$dateOfDischarge', null] },
              ],
            },
            then: {
              $divide: [
                {
                  $subtract: [
                    { $toDate: '$dateOfDischarge' },
                    { $toDate: '$dateOfOnset' },
                  ],
                },
                1000 * 60 * 60 * 24,
              ],
            },
            else: null,
          },
        },
        hospitalized: {
          $cond: [
            {
              $and: [
                { $ne: ['$hospitalAdmission', null] },
                { $ne: ['$hospitalAdmission', ''] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$academicYearDetails.schoolYear',
        totalCases: { $sum: 1 },
        hospitalizedCases: { $sum: '$hospitalized' },
        totalCaseDuration: { $sum: '$caseDurationDays' },
        averageCaseDuration: { $avg: '$caseDurationDays' },
        details: {
          $push: {
            gender: '$gender',
            age: '$age',
            remarks: '$remarks',
            caseDurationDays: '$caseDurationDays',
          },
        },
        allRemarks: { $push: '$remarks' },
      },
    },
    {
      $project: {
        _id: 0,
        academicYear: '$_id',
        totalCases: 1,
        details: 1,
        hospitalizedCases: 1,
        hospitalizationRate: {
          $cond: [
            { $eq: ['$totalCases', 0] },
            0,
            {
              $multiply: [
                { $divide: ['$hospitalizedCases', '$totalCases'] },
                100,
              ],
            },
          ],
        },
        caseDurationAverage: '$averageCaseDuration',
        allRemarks: 1,
      },
    },
    { $sort: { academicYear: 1 } },
  ]);
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  academicYears.forEach((academicYear) => {
    const yearReports = reports.filter(
      (report) => report.academicYear === academicYear.schoolYear
    );

    const totalCases = yearReports.reduce(
      (sum, report) => sum + report.totalCases,
      0
    );
    const hospitalizedCases = yearReports.reduce(
      (sum, report) => sum + report.hospitalizedCases,
      0
    );
    const hospitalizationRate =
      yearReports.length > 0 ? yearReports[0].hospitalizationRate : 0;

    const ageData = yearReports.flatMap((report) =>
      report.details.map((detail) => detail.age)
    );
    const genderData = yearReports.flatMap((report) =>
      report.details.map((detail) => detail.gender)
    );

    let ageStats = getStatistics(ageData);
    const genderBreakdown = _.countBy(genderData);

    processedData[academicYear.schoolYear] = {
      totalCases,
      hospitalizedCases,
      hospitalizationRate: hospitalizationRate.toFixed(2),
      ageStats,
      genderBreakdown,
    };
  });

  return processedData;
};

// Utility function to calculate statistics
const getStatistics = (data) => {
  if (data.length === 0) {
    return {
      mean: null,
      median: null,
      mode: null,
      range: null,
      standardDeviation: null,
    };
  }
  return {
    mean: mean(data),
    median: median(data),
    mode: mode(data),
    range: _.max(data) - _.min(data),
    standardDeviation: Math.sqrt(variance(data)),
  };
};

const generateComparisonSummary = (data) => {
  const years = Object.keys(data).sort(); // Ensure chronological order
  let summary = '';

  if (years.length === 0) {
    return 'No academic year data available for analysis.';
  } else if (years.length === 1) {
    // Handling the case with data for only one year
    const year = years[0];
    const yearData = data[year];
    summary += `For the school year ${year}, there were ${yearData.totalCases} reported cases of dengue. `;
    summary += `Out of these, ${yearData.hospitalizedCases} cases required hospitalization, which is a rate of ${yearData.hospitalizationRate}%. `;
    summary += `This suggests that ${
      yearData.hospitalizationRate > 10 ? 'a significant' : 'a small'
    } number of dengue cases were severe enough to require hospital care. `;
    summary += `The average age of affected individuals was ${
      yearData.ageStats.mean !== null
        ? yearData.ageStats.mean.toFixed(2)
        : 'N/A'
    } years. `;
    summary += `Gender-wise, there were ${
      yearData.genderBreakdown.Male
    } male and ${yearData.genderBreakdown.Female} female cases, indicating ${
      yearData.genderBreakdown.Male > yearData.genderBreakdown.Female
        ? 'a higher prevalence among males'
        : 'a more balanced distribution between genders'
    }.\n`;
  } else {
    // Comparative analysis for two years
    const [firstYear, secondYear] = years;
    const firstData = data[firstYear],
      secondData = data[secondYear];

    summary += `Comparing the school years ${firstYear} and ${secondYear}, `;
    summary += `the number of dengue cases was ${
      firstData.totalCases > secondData.totalCases ? 'higher' : 'lower'
    } in ${firstYear} with ${firstData.totalCases} cases, compared to ${
      secondData.totalCases
    } in ${secondYear}. `;
    summary += `The hospitalization rate ${
      parseFloat(firstData.hospitalizationRate) >
      parseFloat(secondData.hospitalizationRate)
        ? 'decreased'
        : 'increased'
    } from ${firstData.hospitalizationRate}% to ${
      secondData.hospitalizationRate
    }%, `;
    summary += `suggesting that the cases were ${
      parseFloat(firstData.hospitalizationRate) >
      parseFloat(secondData.hospitalizationRate)
        ? 'more severe'
        : 'less severe'
    } or the healthcare response was ${
      parseFloat(firstData.hospitalizationRate) >
      parseFloat(secondData.hospitalizationRate)
        ? 'less effective'
        : 'more effective'
    } in ${secondYear}. `;
    summary += `The average age of those affected slightly ${
      firstData.ageStats.mean > secondData.ageStats.mean
        ? 'decreased'
        : 'increased'
    } from ${
      firstData.ageStats.mean !== null
        ? firstData.ageStats.mean.toFixed(2)
        : 'N/A'
    } to ${
      secondData.ageStats.mean !== null
        ? secondData.ageStats.mean.toFixed(2)
        : 'N/A'
    } years. `;
    summary += `Regarding gender distribution, the number of male cases was ${
      firstData.genderBreakdown.Male > secondData.genderBreakdown.Male
        ? 'higher'
        : 'lower'
    } in ${firstYear} compared to ${secondYear}.`;
  }

  return summary;
};
