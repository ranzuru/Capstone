import FeedingProgram from '../../models/FeedingProgram.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';
import { mean, median, mode, variance } from 'simple-statistics';

// Bar

export const getPrePostComparison = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const comparisonData = await FeedingProgram.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: {
            bmiClassification: '$bmiClassification',
            measurementType: '$measurementType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          bmiClassification: '$_id.bmiClassification',
          measurementType: '$_id.measurementType',
          count: 1,
        },
      },
      {
        $sort: { bmiClassification: 1, measurementType: -1 }, // Sort by BMI classification and then by measurement type
      },
    ]);

    // Reshape the data for the horizontal bar chart
    const reshapedData = comparisonData.reduce(
      (acc, { bmiClassification, measurementType, count }) => {
        let entry = acc.find((e) => e.bmiClassification === bmiClassification);
        if (!entry) {
          entry = { bmiClassification, PRE: 0, POST: 0 };
          acc.push(entry);
        }
        entry[measurementType] = count;
        return acc;
      },
      []
    );

    res.json(reshapedData);
  } catch (error) {
    console.error('Error fetching PRE and POST comparison data:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Pie

export const getSBFPBeneficiariesPerGrade = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const beneficiariesPerGrade = await FeedingProgram.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $match: { beneficiaryOfSBFP: true },
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

    const formattedData = beneficiariesPerGrade.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching SBFP beneficiaries per grade:', error);
    res.status(500).send('Internal Server Error');
  }
};

// LineChart unused
export const getGenderHeightForAgeComparison = async (req, res) => {
  try {
    const heightGenderComparison = await FeedingProgram.aggregate([
      {
        $match: {
          heightForAge: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            heightForAge: '$heightForAge',
            gender: '$gender',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.heightForAge': 1,
          '_id.gender': 1,
        },
      },
    ]);

    const formattedData = heightGenderComparison.map(({ _id, count }) => ({
      heightForAge: _id.heightForAge,
      gender: _id.gender,
      count: count,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error(
      'Error fetching height for age and gender comparison:',
      error
    );
    res.status(500).send('Internal Server Error');
  }
};

// Bar
export const getBeneficiaryImpact = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const impactData = await FeedingProgram.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },

      {
        $group: {
          _id: '$measurementType',
          averageBMI: { $avg: '$bmi' },
          averageWeight: { $avg: '$weightKg' },
          averageHeight: { $avg: '$heightCm' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          measurementType: '$_id',
          averageBMI: { $round: ['$averageBMI', 2] },
          averageWeight: { $round: ['$averageWeight', 2] },
          averageHeight: { $round: ['$averageHeight', 2] },
          count: 1,
        },
      },
      { $sort: { measurementType: 1 } },
    ]);

    res.json(impactData);
  } catch (error) {
    console.error('Error fetching impact data:', error);
    res.status(500).send('Internal Server Error');
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

    if (!academicYears.length) {
      return res.status(404).json({ message: 'Academic years not found.' });
    }

    // Fetch reports for the academic years
    const academicYearIds = academicYears.map((year) => year._id);
    const reports = await fetchFeedingReportsSummary(academicYearIds);

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

const fetchFeedingReportsSummary = async (academicYearIds) => {
  return FeedingProgram.aggregate([
    {
      $match: {
        academicYear: { $in: academicYearIds },
      },
    },
    {
      $lookup: {
        from: AcademicYear.collection.name, // This should match your collection name
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
          measurementType: '$measurementType',
          grade: '$grade',
          gender: '$gender',
          bmiClassification: '$bmiClassification', // Grouping by BMI classification
          heightForAge: '$heightForAge', // Grouping by height for age
        },
        totalStudents: { $sum: 1 },
        totalBeneficiaries: { $sum: { $cond: ['$beneficiaryOfSBFP', 1, 0] } },
        averageBMI: { $avg: '$bmi' },
        averageHeight: { $avg: '$heightCm' },
        averageWeight: { $avg: '$weightKg' },
        averageAge: { $avg: '$age' }, // Calculating the average age
        ageDistribution: { $push: '$age' }, // Collecting ages for distribution
      },
    },
    {
      $project: {
        _id: 0,
        academicYear: '$_id.academicYear',
        measurementType: '$_id.measurementType',
        grade: '$_id.grade',
        gender: '$_id.gender',
        bmiClassification: '$_id.bmiClassification', // Including BMI classification in the projection
        heightForAge: '$_id.heightForAge', // Including height for age
        totalStudents: 1,
        totalBeneficiaries: 1,
        averageBMI: 1,
        averageHeight: 1,
        averageWeight: 1,
        averageAge: 1,
        ageDistribution: 1, // Including the age distribution in the projection
      },
    },
    {
      $sort: {
        academicYear: 1,
        grade: 1,
        gender: 1,
        measurementType: 1,
        bmiClassification: 1,
        heightForAge: 1,
      },
    }, // Sorting the results
  ]);
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  academicYears.forEach((academicYear) => {
    const yearReports = reports.filter(
      (report) => report.academicYear === academicYear.schoolYear
    );
    // Process the data for each year
    const metrics = yearReports.reduce(
      (acc, report) => {
        acc.totalStudents += report.totalStudents;
        acc.totalBeneficiaries += report.totalBeneficiaries;
        acc.averageBMI.push(report.averageBMI);
        acc.averageHeight.push(report.averageHeight);
        acc.averageWeight.push(report.averageWeight);
        acc.ageDistribution.push(...report.ageDistribution);
        acc.bmiClassification.push(report.bmiClassification); // Corrected
        acc.heightForAge.push(report.heightForAge);
        return acc;
      },
      {
        totalStudents: 0,
        totalBeneficiaries: 0,
        averageBMI: [],
        averageHeight: [],
        averageWeight: [],
        ageDistribution: [],
        bmiClassification: [],
        heightForAge: [],
      }
    );

    // Calculate aggregate statistics
    const bmiStats = getStatistics(metrics.averageBMI);
    const heightStats = getStatistics(metrics.averageHeight);
    const weightStats = getStatistics(metrics.averageWeight);
    const ageStats = getStatistics(metrics.ageDistribution);

    processedData[academicYear.schoolYear] = {
      totalStudents: metrics.totalStudents,
      totalBeneficiaries: metrics.totalBeneficiaries,
      bmiStats,
      heightStats,
      weightStats,
      ageStats,
      beneficiaryRate:
        metrics.totalStudents > 0
          ? parseFloat(
              (
                (metrics.totalBeneficiaries / metrics.totalStudents) *
                100
              ).toFixed(2)
            )
          : 0,
      bmiClassificationCount: _.countBy(metrics.bmiClassification),
      heightForAgeCount: _.countBy(metrics.heightForAge),
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
  const years = Object.keys(data).sort();
  let summary = '';

  if (years.length === 0) {
    return 'No academic year data available for feeding program analysis.';
  } else if (years.length === 1) {
    const year = years[0];
    const yearData = data[year];
    summary += `For the school year ${year}, ${yearData.totalStudents} students participated in the feeding program. `;
    summary += `Out of these, ${yearData.totalBeneficiaries} were beneficiaries, accounting for ${yearData.beneficiaryRate}% of the student population. `;
    summary += `The average BMI was ${yearData.bmiStats.mean.toFixed(2)}, `;
    summary += `with average height and weight being ${yearData.heightStats.mean.toFixed(
      2
    )} cm and ${yearData.weightStats.mean.toFixed(2)} kg, respectively. `;
    summary += `BMI classifications: ${Object.entries(
      yearData.bmiClassificationCount
    )
      .map(([classification, count]) => `${classification}: ${count}`)
      .join(', ')}. `;
    summary += `Height for age categories: ${Object.entries(
      yearData.heightForAgeCount
    )
      .map(([category, count]) => `${category}: ${count}`)
      .join(', ')}.\n`;
  } else {
    const [firstYear, secondYear] = years;
    const firstData = data[firstYear],
      secondData = data[secondYear];

    summary += `Comparing the school years ${firstYear} and ${secondYear}, `;
    summary += `the number of beneficiaries was ${
      firstData.totalBeneficiaries > secondData.totalBeneficiaries
        ? 'higher'
        : 'lower'
    } in ${firstYear} (${
      firstData.totalBeneficiaries
    } students) compared to ${secondYear} (${secondData.totalBeneficiaries}). `;
    summary += `The beneficiary rate changed from ${firstData.beneficiaryRate}% to ${secondData.beneficiaryRate}%. `;
    summary += `Average BMI altered from ${firstData.bmiStats.mean.toFixed(
      2
    )} in ${firstYear} to ${secondData.bmiStats.mean.toFixed(
      2
    )} in ${secondYear}. `;
    summary += `Average height and weight shifted from ${firstData.heightStats.mean.toFixed(
      2
    )} cm and ${firstData.weightStats.mean.toFixed(
      2
    )} kg to ${secondData.heightStats.mean.toFixed(
      2
    )} cm and ${secondData.weightStats.mean.toFixed(2)} kg, respectively.`;
    const bmiClassificationsToCompare = [
      'Normal',
      'Wasted',
      'Obese',
      'Severely Wasted',
    ];
    const bmiSummaryParts = bmiClassificationsToCompare.map(
      (classification) => {
        const firstYearCount =
          firstData.bmiClassificationCount[classification] || 0;
        const secondYearCount =
          secondData.bmiClassificationCount[classification] || 0;

        let comparisonResult;
        if (firstYearCount > secondYearCount) {
          comparisonResult = 'decreased';
        } else if (firstYearCount < secondYearCount) {
          comparisonResult = 'increased';
        } else {
          comparisonResult = 'did not change';
        }

        return `'${classification}' students ${comparisonResult} from ${firstYearCount} in ${firstYear} to ${secondYearCount} in ${secondYear}`;
      }
    );

    summary += `The count of BMI classifications ${bmiSummaryParts.join(
      '; '
    )}.`;
  }

  return summary;
};
