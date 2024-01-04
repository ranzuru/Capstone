import ClinicVisit from '../../models/ClinicVisit.js';
import AcademicYear from '../../models/AcademicYear.js';
import numberToMonth from '../../utils/numberToMonths.js';
import _ from 'lodash';
import { median, mode, variance } from 'simple-statistics';

// Line charts
export const getVisitCount = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    let visitCounts = await ClinicVisit.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $project: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month
      },
    ]);

    visitCounts = visitCounts.map((item) => {
      return {
        ...item,
        _id: {
          ...item._id,
          month: numberToMonth(item._id.month),
        },
        count: item.count,
      };
    });

    const formattedData = visitCounts.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      visitCount: item.count,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting visit counts:', error);
    res.status(500).json({ error: 'Error getting visit counts' });
  }
};

// Pie
export const getGradeLevelDemographics = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const gradeDemographics = await ClinicVisit.aggregate([
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
        $sort: { _id: -1 },
      },
    ]);

    const formattedData = gradeDemographics.map((item) => ({
      name: item._id || 'Other',
      value: item.count,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting grade level demographics:', error);
    res.status(500).json({ error: 'Error getting grade level demographics' });
  }
};

// Bar chart
export const getMaladyDistribution = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const maladyCounts = await ClinicVisit.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: '$malady',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 }, // Optional: sort by count in descending order
      },
    ]);

    const formattedData = maladyCounts.map((item) => ({
      name: item._id || 'Unknown', // Use 'Unknown' if malady is null or undefined
      count: item.count,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting malady distribution:', error);
    res.status(500).json({ error: 'Error getting malady distribution' });
  }
};

// Summary
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

    if (academicYears.length === 0) {
      return res.status(404).json({ message: 'Academic years not found.' });
    }

    // Fetch reports for the academic years
    const academicYearIds = academicYears.map((year) => year._id);
    const reports = await fetchClinicReportsSummary(academicYearIds);

    // Check if there is data for the current school year
    const currentYearReports = reports.filter((report) =>
      report.academicYear.equals(
        academicYears.find((y) => y.schoolYear === schoolYear)._id
      )
    );

    if (currentYearReports.length === 0) {
      return res
        .status(404)
        .json({
          message: `No data available for the school year ${schoolYear}.`,
        });
    }

    // Process and structure the response if data is present
    const processedData = processComparisonData(reports, academicYears);
    const descriptiveSummary = generateComparisonSummary(processedData);

    res.json({
      data: processedData, // The raw data
      summary: descriptiveSummary, // The descriptive summary
    });
  } catch (error) {
    console.error('Error calculating comparison statistics:', error);
    return res.status(500).json({ error: 'Error in processing request' });
  }
};

const fetchClinicReportsSummary = async (academicYearIds) => {
  const aggregatedData = await ClinicVisit.aggregate([
    {
      $match: {
        academicYear: { $in: academicYearIds },
      },
    },
    {
      $group: {
        _id: {
          academicYear: '$academicYear',
          type: '$type',
          malady: '$malady',
          grade: '$grade',
          gender: '$gender',
          month: { $month: '$issueDate' },
          year: { $year: '$issueDate' },
        },
        totalVisits: { $sum: 1 },
        ageDistribution: { $push: '$age' },
      },
    },
    {
      $project: {
        academicYear: '$_id.academicYear',
        type: '$_id.type',
        malady: '$_id.malady',
        grade: '$_id.grade',
        gender: '$_id.gender',
        month: '$_id.month',
        year: '$_id.year',
        totalVisits: 1,
        averageAge: 1,
        ageDistribution: 1,
      },
    },
    {
      $sort: {
        academicYear: 1,
        malady: 1,
        grade: 1,
        gender: 1,
        month: 1,
        year: 1,
      },
    },
  ]);

  return aggregatedData;
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  academicYears.forEach((year) => {
    const yearData = reports.filter((report) =>
      report.academicYear.equals(year._id)
    );

    const monthlyVisits = yearData.reduce((acc, report) => {
      const monthYearKey = `${numberToMonth(report.month)}-${report.year}`;
      acc[monthYearKey] = (acc[monthYearKey] || 0) + 1;
      return acc;
    }, {});

    // Process data for maladies
    const maladyData = _.groupBy(yearData, 'malady');
    const maladies = _.map(maladyData, (maladyReports, malady) => {
      const ageDistribution = _.chain(maladyReports)
        .map('ageDistribution')
        .flatten()
        .filter((age) => age !== null && !isNaN(age))
        .value();

      const averageAge =
        ageDistribution.length > 0 ? _.mean(ageDistribution) : null;

      return {
        malady,
        totalVisits: _.sumBy(maladyReports, 'totalVisits'),
        averageAge,
      };
    });

    // Aggregate data by grade and gender
    const gradeCounts = _.chain(yearData)
      .map((report) => report.grade || 'Other') // Replace null/empty grades with 'Other'
      .countBy()
      .value();
    const genderCounts = _.countBy(yearData, 'gender');
    const typeCounts = _.countBy(yearData, 'type');

    // Calculate overall statistics
    const allAges = _.chain(yearData)
      .map('ageDistribution')
      .flatten()
      .filter((age) => age !== null && !isNaN(age))
      .value();

    processedData[year.schoolYear] = {
      totalVisits: _.sumBy(yearData, 'totalVisits'),
      monthlyVisits,
      maladies,
      gradeCounts,
      genderCounts,
      typeCounts,
      overallAverageAge: allAges.length > 0 ? _.mean(allAges) : null,
      ageStats:
        allAges.length > 0
          ? {
              median: median(allAges),
              mode: mode(allAges),
              variance: variance(allAges),
              standardDeviation: Math.sqrt(variance(allAges)),
            }
          : {
              median: null,
              mode: null,
              variance: null,
              standardDeviation: null,
            },
    };
  });

  return processedData;
};

const generateComparisonSummary = (data) => {
  const years = Object.keys(data).sort();
  let summary = '';

  if (years.length === 0) {
    return 'No clinic visit data available for analysis.';
  }

  if (years.length === 1) {
    const year = years[0];
    const yearData = data[year];
    const peakMonth = Object.entries(yearData.monthlyVisits).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
    summary += `In the school year ${year}, there were ${yearData.totalVisits} clinic visits. `;
    summary += `Peak months for visits was ${peakMonth}.`;
    summary += `Common maladies included ${yearData.maladies
      .slice(0, 5)
      .map((m) => m.malady)
      .join(', ')}${yearData.maladies.length > 5 ? ' (among others)' : ''}. `;
    summary += `Notable trends were seen in ${Object.keys(
      yearData.gradeCounts
    ).join(', ')}, with a gender distribution of ${
      yearData.genderCounts.Male || 0
    } males and ${yearData.genderCounts.Female || 0} females. `;
    summary += `The average age of patients was ${yearData.overallAverageAge.toFixed(
      2
    )} years. `;
    summary += `This information suggests the need for focused health initiatives in certain grades and times of the year.\n`;
  } else {
    const [prevYear, currentYear] = years;
    const prevData = data[prevYear],
      currentData = data[currentYear];
    const peakMonth = Object.entries(currentData.monthlyVisits).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];
    const maladiesList = currentData.maladies
      .slice(0, 5)
      .map((m) => m.malady)
      .join(', ');
    const prevMaladiesList = prevData.maladies
      .slice(0, 5)
      .map((m) => m.malady)
      .join(', ');

    // Comparison between years
    summary += `Comparing the school years ${prevYear} and ${currentYear}, `;
    summary += `total clinic visits ${
      currentData.totalVisits > prevData.totalVisits ? 'increased' : 'decreased'
    } from ${prevData.totalVisits} to ${currentData.totalVisits}. `;
    summary += `In ${currentYear}, prevalent maladies were ${maladiesList}${
      currentData.maladies.length > 5 ? ' (among others)' : ''
    }, `;
    summary += `while in ${prevYear}, they were ${prevMaladiesList}${
      prevData.maladies.length > 5 ? ' (among others)' : ''
    }. `;
    summary += `This suggests a shift in health concerns. `;
    summary += `The peak month in ${currentYear} was ${peakMonth}. `;
    summary += `The average age of patients in ${currentYear} was ${currentData.overallAverageAge.toFixed(
      2
    )}, compared to ${prevData.overallAverageAge.toFixed(2)} in ${prevYear}. `;
    summary += `Grade-specific and gender-based analysis can provide further insights into these changes and help tailor health interventions more effectively.`;
  }

  return summary;
};
