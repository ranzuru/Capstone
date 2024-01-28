import DengueMonitoring from '../../models/DengueMonitoring.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';
import { mean, median, mode, variance } from 'simple-statistics';
import numberToMonth from '../../utils/numberToMonths.js';

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
      { $match: { academicYear: academicYearDoc._id } },
      {
        $group: {
          _id: {
            month: { $month: '$dateOfOnset' },
            year: { $year: '$dateOfOnset' },
          },
          totalCases: { $sum: 1 },
          hospitalCases: {
            $sum: { $cond: [{ $ne: ['$dateOfAdmission', null] }, 1, 0] },
          },
          nonHospitalCases: {
            $sum: { $cond: [{ $eq: ['$dateOfAdmission', null] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          totalCases: 1,
          hospitalCases: 1,
          nonHospitalCases: 1,
        },
      },
    ]);

    // Map the results to replace the numeric month with the month name using your utility function
    casesByMonth = casesByMonth.map((item) => ({
      ...item,
      month: numberToMonth(item.month),
      year: item.year,
    }));

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

    summary += `In school year ${year}, there were ${yearData.totalCases} reported dengue cases. `;
    summary += `Hospitalizations accounted for ${yearData.hospitalizedCases} (${yearData.hospitalizationRate}%) of these, `;
    summary += `which ${
      yearData.hospitalizationRate > 50
        ? 'indicates that a slight majority'
        : yearData.hospitalizationRate === 50
          ? 'shows that exactly half'
          : yearData.hospitalizationRate >= 10 &&
              yearData.hospitalizationRate <= 50
            ? 'highlights that a substantial portion '
            : 'suggests that only a limited number '
    }`;
    summary += `of the cases ${
      yearData.hospitalizationRate > 50
        ? 'required'
        : yearData.hospitalizationRate === 50
          ? 'required'
          : yearData.hospitalizationRate > 10
            ? 'were severe enough to necessitate'
            : 'did not require'
    } hospital care. `;
    summary += `This level of hospitalization ${
      yearData.hospitalizationRate > 55
        ? 'points to a greater severity among these cases'
        : yearData.hospitalizationRate >= 45 &&
            yearData.hospitalizationRate <= 55
          ? 'suggests a moderate severity in comparison to the total cases'
          : 'may indicate a less severe impact on overall health outcomes'
    } compared to the total number of reported cases.`;
    summary += `The average age of individuals affected was ${
      yearData.ageStats.mean.toFixed(2) || 'N/A'
    } years. `;
    summary += `Gender distribution data shows ${
      yearData.genderBreakdown.Male || 0
    } male and ${yearData.genderBreakdown.Female || 0} female cases, `;
    summary += `pointing to ${
      yearData.genderBreakdown.Female > yearData.genderBreakdown.Male
        ? 'higher female susceptibility'
        : yearData.genderBreakdown.Male > yearData.genderBreakdown.Female
          ? 'higher male susceptibility'
          : 'a balanced gender impact'
    }.\n`;
  } else {
    const [firstYear, secondYear] = years;
    const firstData = data[firstYear],
      secondData = data[secondYear];

    // Comparative analysis for dengue cases
    summary += `Comparing the school years ${firstYear} and ${secondYear}, `;
    summary += `the number of dengue cases was ${
      firstData.totalCases === secondData.totalCases
        ? 'the same'
        : firstData.totalCases > secondData.totalCases
          ? 'higher'
          : 'lower'
    } in ${firstYear} with ${firstData.totalCases} cases, compared to ${
      secondData.totalCases
    } in ${secondYear}. `;

    // Comparative analysis for hospitalization rate
    const firstRate = parseFloat(firstData.hospitalizationRate);
    const secondRate = parseFloat(secondData.hospitalizationRate);
    summary += `The hospitalization rate ${
      firstRate === secondRate
        ? 'remained stable'
        : firstRate > secondRate
          ? 'decreased'
          : 'increased'
    } from ${firstData.hospitalizationRate}% to ${
      secondData.hospitalizationRate
    }%. `;
    summary += `This suggests that the cases were ${
      firstRate > secondRate ? 'more severe' : 'less severe'
    } or the healthcare response was ${
      firstRate > secondRate ? 'less effective' : 'more effective'
    } in ${secondYear}. `;

    // Comparative analysis for average age
    const firstMeanAge = firstData.ageStats.mean;
    const secondMeanAge = secondData.ageStats.mean;
    summary += `The average age of those affected ${
      firstMeanAge === secondMeanAge
        ? 'remained constant'
        : firstMeanAge > secondMeanAge
          ? 'decreased'
          : 'increased'
    } from ${firstMeanAge.toFixed(2)} to ${secondMeanAge.toFixed(2)} years. `;

    // Comparative analysis for gender distribution
    const firstYearMaleCases = firstData.genderBreakdown.Male;
    const secondYearMaleCases = secondData.genderBreakdown.Male;
    const firstYearFemaleCases = firstData.genderBreakdown.Female;
    const secondYearFemaleCases = secondData.genderBreakdown.Female;

    const maleCaseChange =
      ((secondYearMaleCases - firstYearMaleCases) / firstYearMaleCases) * 100;
    const femaleCaseChange =
      ((secondYearFemaleCases - firstYearFemaleCases) / firstYearFemaleCases) *
      100;

    summary += `Regarding gender distribution, the number of male cases was ${
      firstYearMaleCases > secondYearMaleCases ? 'higher' : 'lower'
    } in ${firstYear} (${firstYearMaleCases} cases) compared to ${secondYear} (${secondYearMaleCases} cases), `;
    summary += `a change of ${maleCaseChange.toFixed(2)}%. `;
    summary += `For female cases, the number was ${
      firstYearFemaleCases > secondYearFemaleCases ? 'higher' : 'lower'
    } in ${firstYear} (${firstYearFemaleCases} cases) compared to ${secondYear} (${secondYearFemaleCases} cases), `;
    summary += `a change of ${femaleCaseChange.toFixed(2)}%.`;
  }

  return summary;
};
