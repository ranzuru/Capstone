import StudentMedical from '../../models/StudentMedical.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';
import { median, mode, variance } from 'simple-statistics';

export const getDewormingStats = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const stats = await StudentMedical.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: {
            grade: '$grade',
            gender: '$gender',
            is4p: '$is4p',
          },
          dewormedCount: {
            $sum: {
              $cond: ['$deworming', 1, 0],
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.grade',
          dewormedBoys4Ps: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.gender', 'Male'] },
                    { $eq: ['$_id.is4p', true] },
                  ],
                },
                '$dewormedCount',
                0,
              ],
            },
          },
          dewormedGirls4Ps: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.gender', 'Female'] },
                    { $eq: ['$_id.is4p', true] },
                  ],
                },
                '$dewormedCount',
                0,
              ],
            },
          },
          dewormedBoysNon4Ps: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.gender', 'Male'] },
                    { $eq: ['$_id.is4p', false] },
                  ],
                },
                '$dewormedCount',
                0,
              ],
            },
          },
          dewormedGirlsNon4Ps: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$_id.gender', 'Female'] },
                    { $eq: ['$_id.is4p', false] },
                  ],
                },
                '$dewormedCount',
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          grade: '$_id',
          dewormedBoys4Ps: 1,
          dewormedGirls4Ps: 1,
          dewormedBoysNon4Ps: 1,
          dewormedGirlsNon4Ps: 1,
        },
      },
      {
        $sort: { grade: 1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).send(error);
  }
};

// PieChart

export const getPieChartData = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const aggregation = await StudentMedical.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: null,
          totalEnrolled: { $sum: 1 },
          total4Ps: {
            $sum: {
              $cond: ['$is4p', 1, 0],
            },
          },
          dewormed4Ps: {
            $sum: {
              $cond: [{ $and: ['$is4p', '$deworming'] }, 1, 0],
            },
          },
          dewormedNot4Ps: {
            $sum: {
              $cond: [{ $and: [{ $not: '$is4p' }, '$deworming'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalEnrolled: 1,
          total4Ps: 1,
          totalNot4Ps: { $subtract: ['$totalEnrolled', '$total4Ps'] },
          dewormed4Ps: 1,
          dewormedNot4Ps: 1,
        },
      },
    ]);

    const pieChartData = aggregation[0] || {
      totalEnrolled: 0,
      total4Ps: 0,
      totalNot4Ps: 0,
      dewormed4Ps: 0,
      dewormedNot4Ps: 0,
    };

    res.json(pieChartData);
  } catch (error) {
    res.status(500).send(error);
  }
};

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
    const reports = await fetchDewormedReportsSummary(academicYearIds);

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

const fetchDewormedReportsSummary = async (academicYearIds) => {
  return StudentMedical.aggregate([
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
      $group: {
        _id: {
          academicYear: '$academicYearDetails.schoolYear',
          is4p: '$is4p',
          grade: '$grade',
          gender: '$gender', // Grouping by gender now
        },
        totalStudents: { $sum: 1 },
        totalDewormed: { $sum: { $cond: ['$deworming', 1, 0] } },
        averageAge: { $avg: '$age' }, // Calculating the average age
        ageDistribution: { $push: '$age' }, // Collecting ages for distribution
        // You can include more fields as needed
      },
    },
    {
      $project: {
        _id: 0,
        academicYear: '$_id.academicYear',
        is4p: '$_id.is4p',
        grade: '$_id.grade',
        gender: '$_id.gender',
        totalStudents: 1,
        totalDewormed: 1,
        averageAge: 1,
        ageDistribution: 1, // Including the age distribution in the output
        dewormingRate: {
          $multiply: [{ $divide: ['$totalDewormed', '$totalStudents'] }, 100],
        }, // Calculating deworming rate
      },
    },
    { $sort: { academicYear: 1, grade: 1, gender: 1 } }, // Sorting the results
  ]);
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  academicYears.forEach((academicYear) => {
    const yearReports = reports.filter(
      (report) => report.academicYear === academicYear.schoolYear
    );

    const totalStudents = yearReports.reduce(
      (sum, report) => sum + report.totalStudents,
      0
    );
    const totalDewormed = yearReports.reduce(
      (sum, report) => sum + report.totalDewormed,
      0
    );
    const dewormingRate =
      totalStudents > 0 ? (totalDewormed / totalStudents) * 100 : 0;

    const ageData = yearReports.flatMap((report) => report.ageDistribution);

    // New approach for gender breakdown
    let genderBreakdown = yearReports.reduce((acc, report) => {
      acc[report.gender] = (acc[report.gender] || 0) + report.totalStudents;
      return acc;
    }, {});

    const ageStats = getStatistics(ageData);

    processedData[academicYear.schoolYear] = {
      totalStudents,
      totalDewormed,
      dewormingRate: dewormingRate.toFixed(2),
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
    mean: _.mean(data),
    median: median(data),
    mode: mode(data),
    range: _.max(data) - _.min(data),
    standardDeviation: Math.sqrt(variance(data)),
  };
};

const generateComparisonSummary = (data) => {
  const years = Object.keys(data).sort();
  let summary = '';

  if (years.length === 0) {
    return 'No academic year data available for deworming analysis.';
  } else if (years.length === 1) {
    const year = years[0];
    const yearData = data[year];
    summary += `For the school year ${year}, ${yearData.totalStudents} students were assessed for deworming. `;
    summary += `Out of these, ${yearData.totalDewormed} students were dewormed, which is a rate of ${yearData.dewormingRate}%. `;
    summary += `This suggests that ${
      yearData.dewormingRate > 10 ? 'a significant' : 'a small'
    } portion of the student population gets deworm. `;
    summary += `The average age of the students was ${yearData.ageStats.mean.toFixed(
      2
    )} years. `;
    summary += `In terms of gender, ${yearData.genderBreakdown.Male} male and ${yearData.genderBreakdown.Female} female students were dewormed. `;
    summary += `This indicates ${
      yearData.genderBreakdown.Male > yearData.genderBreakdown.Female
        ? 'a higher prevalence among males'
        : yearData.genderBreakdown.Male < yearData.genderBreakdown.Female
          ? 'a higher prevalence among females'
          : 'an equal distribution between genders'
    }.\n`;
  } else {
    const [firstYear, secondYear] = years;
    const firstData = data[firstYear],
      secondData = data[secondYear];

    summary += `Comparing the school years ${firstYear} and ${secondYear}, `;
    summary += `the number of dewormed students was ${
      firstData.totalDewormed > secondData.totalDewormed
        ? 'higher'
        : firstData.totalDewormed < secondData.totalDewormed
          ? 'lower'
          : 'the same'
    } in ${firstYear} with ${firstData.totalDewormed} students, compared to ${
      secondData.totalDewormed
    } in ${secondYear}. `;
    summary += `The deworming rate ${
      parseFloat(firstData.dewormingRate) > parseFloat(secondData.dewormingRate)
        ? 'increased'
        : parseFloat(firstData.dewormingRate) <
            parseFloat(secondData.dewormingRate)
          ? 'decreased'
          : 'remained the same'
    } from ${firstData.dewormingRate}% to ${secondData.dewormingRate}%. `;
    summary += `The average age of students ${
      firstData.ageStats.mean > secondData.ageStats.mean
        ? 'decreased'
        : firstData.ageStats.mean < secondData.ageStats.mean
          ? 'increased'
          : 'stayed consistent'
    } from ${firstData.ageStats.mean.toFixed(
      2
    )} to ${secondData.ageStats.mean.toFixed(2)} years. `;
    summary += `Regarding gender distribution, in ${firstYear} there were ${firstData.genderBreakdown.Male} male and ${firstData.genderBreakdown.Female} female students dewormed, `;
    summary += `compared to ${secondData.genderBreakdown.Male} male and ${secondData.genderBreakdown.Female} female students in ${secondYear}, `;
    summary += `indicating ${
      firstData.genderBreakdown.Male - secondData.genderBreakdown.Male > 0
        ? 'a decrease'
        : firstData.genderBreakdown.Male - secondData.genderBreakdown.Male < 0
          ? 'an increase'
          : 'no significant change'
    } in male deworming, and ${
      firstData.genderBreakdown.Female - secondData.genderBreakdown.Female > 0
        ? 'a decrease'
        : firstData.genderBreakdown.Female - secondData.genderBreakdown.Female <
            0
          ? 'an increase'
          : 'no significant change'
    } in female deworming between the two years.`;
  }

  return summary;
};
