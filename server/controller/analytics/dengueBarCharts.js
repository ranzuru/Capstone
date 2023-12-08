import DengueMonitoring from '../../models/DengueMonitoring.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';
import {
  mean,
  median,
  mode,
  max,
  min,
  standardDeviation,
} from 'simple-statistics';
import { analyzeTextForCommonWords } from '../../utils/textAnalysis.js'; // Adjust path as needed

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

// ANALYTICS SECTION

const fetchDengueReports = async () => {
  return DengueMonitoring.aggregate([
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

const processReportData = (reports) => {
  return reports.map((report) => {
    const remarks = report.allRemarks ?? [];
    const filteredRemarks = remarks.filter(
      (remark) => remark && remark.trim().length > 0
    );

    const ages = report.details.map((detail) => detail.age);
    return {
      academicYear: report.academicYear,
      totalCases: report.totalCases,
      hospitalizationRate: report.hospitalizationRate
        ? report.hospitalizationRate.toFixed(2)
        : null,
      genderBreakdown: _.countBy(report.details, 'gender'),
      ageStats: ages.length ? calculateAgeStats(ages) : null,
      caseDurationAverage: report.caseDurationAverage
        ? Math.round(report.caseDurationAverage)
        : null,
      remarksAnalysis: analyzeTextForCommonWords(filteredRemarks),
    };
  });
};

const calculateAgeStats = (ages) => {
  return {
    mean: mean(ages),
    median: median(ages),
    mode: mode(ages),
    range: max(ages) - min(ages),
    standardDeviation: standardDeviation(ages),
  };
};

export const calculateStatisticsByAcademicYear = async (req, res) => {
  try {
    const reports = await fetchDengueReports();
    const processedData = processReportData(reports);
    res.json(processedData);
  } catch (error) {
    console.error('Error calculating statistics:', error.message);
    res.status(500).send('Error in processing request');
  }
};
