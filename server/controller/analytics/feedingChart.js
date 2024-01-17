import FeedingProgram from '../../models/FeedingProgram.js';
import AcademicYear from '../../models/AcademicYear.js';

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
        from: AcademicYear.collection.name,
        localField: 'academicYear',
        foreignField: '_id',
        as: 'academicYearDetails',
      },
    },
    {
      $unwind: '$academicYearDetails',
    },
    {
      $group: {
        _id: {
          academicYear: '$academicYearDetails.schoolYear',
          measurementType: '$measurementType',
          bmiClassification: '$bmiClassification',
        },
        count: { $sum: 1 },
        totalBeneficiaries: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$measurementType', 'PRE'] },
                  '$beneficiaryOfSBFP',
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          academicYear: '$_id.academicYear',
          measurementType: '$_id.measurementType',
        },
        totalStudents: { $sum: '$count' },
        totalBeneficiaries: { $sum: '$totalBeneficiaries' },
        bmiClassificationCounts: {
          $push: {
            k: '$_id.bmiClassification',
            v: '$count',
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        academicYear: '$_id.academicYear',
        measurementType: '$_id.measurementType',
        totalStudents: 1,
        totalBeneficiaries: 1,
        bmiClassificationCount: { $arrayToObject: '$bmiClassificationCounts' },
      },
    },
  ]);
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  academicYears.forEach((academicYear) => {
    const yearReports = reports.filter(
      (report) => report.academicYear === academicYear.schoolYear
    );

    // Initialize the structure for each report type
    const metrics = {
      PRE: {
        totalStudents: 0,
        totalBeneficiaries: 0,
        bmiClassification: {},
      },
      POST: {
        totalStudents: 0,
        totalBeneficiaries: 0,
        bmiClassification: {},
      },
    };

    yearReports.forEach((report) => {
      const type = report.measurementType; // PRE or POST
      metrics[type].totalStudents += report.totalStudents; // Summing up the students
      metrics[type].totalBeneficiaries += report.totalBeneficiaries; // Summing up the beneficiaries
      metrics[type].bmiClassification = report.bmiClassificationCount; // Assuming this is directly mapped
    });

    // Assign calculated metrics to processedData
    processedData[academicYear.schoolYear] = {};
    ['PRE', 'POST'].forEach((type) => {
      processedData[academicYear.schoolYear][type] = {
        totalStudents: metrics[type].totalStudents,
        totalBeneficiaries: metrics[type].totalBeneficiaries,
        bmiClassificationCount: metrics[type].bmiClassification,
      };
    });
  });

  return processedData;
};

const generateComparisonSummary = (data) => {
  const years = Object.keys(data).sort();
  let summary = '';

  if (years.length === 0) {
    return 'No academic year data available for feeding program analysis.';
  } else if (years.length === 1) {
    // Handle single year summary
    const year = years[0];
    const yearData = data[year];
    summary += `In the school year ${year}, `;
    summary += `${yearData.PRE.totalStudents} students were assessed before the feeding program (PRE), `;
    summary += `with ${yearData.PRE.totalBeneficiaries} students participating as beneficiaries. `;
    summary += `Following the feeding program, the POST measurement showed `;
    summary += `that ${yearData.POST.totalStudents} students were reassessed. `;
    summary += `The effectiveness of the feeding program can be gauged by analyzing changes in BMI classifications. `;
    summary += `Initially, the distribution was as follows: ${Object.entries(
      yearData.PRE.bmiClassificationCount
    )
      .map(([classification, count]) => `${classification}: ${count}`)
      .join(', ')}. `;
    summary += `Post intervention, the distribution was: ${Object.entries(
      yearData.POST.bmiClassificationCount
    )
      .map(([classification, count]) => `${classification}: ${count}`)
      .join(', ')}.`;
  } else {
    // Handle comparative summary between two years
    const [firstYear, secondYear] = years;
    const firstData = data[firstYear],
      secondData = data[secondYear];

    const compareCounts = (firstCount, secondCount) => {
      const difference = secondCount - firstCount;
      const percentageChange = (difference / firstCount) * 100;
      const direction =
        difference > 0
          ? 'increase'
          : difference < 0
            ? 'decrease'
            : 'remain the same';
      return `${difference} (${percentageChange.toFixed(2)}%) ${direction}`;
    };

    summary += `Comparative Summary for School Years ${firstYear} vs ${secondYear}:\n`;
    summary += `In ${firstYear}, the number of beneficiaries for PRE measurement was ${firstData.PRE.totalBeneficiaries}, `;
    summary += `while in ${secondYear} it is ${secondData.PRE.totalBeneficiaries}, `;
    summary += `${compareCounts(
      firstData.PRE.totalBeneficiaries,
      secondData.PRE.totalBeneficiaries
    )}.\n`;

    Object.keys(firstData.PRE.bmiClassificationCount).forEach(
      (classification) => {
        const firstYearCount =
          firstData.PRE.bmiClassificationCount[classification];
        const secondYearCount =
          secondData.PRE.bmiClassificationCount[classification] || 0;
        summary += `In ${firstYear}, '${classification}' students were ${firstYearCount}, `;
        summary += `while in ${secondYear} there are ${secondYearCount}, `;
        summary += `${compareCounts(firstYearCount, secondYearCount)}.\n`;
      }
    );

    summary += `\nPost-intervention comparison:\n`;

    Object.keys(firstData.POST.bmiClassificationCount).forEach(
      (classification) => {
        const firstYearCount =
          firstData.POST.bmiClassificationCount[classification];
        const secondYearCount =
          secondData.POST.bmiClassificationCount[classification] || 0;
        summary += `In ${firstYear}, post-intervention, '${classification}' students were ${firstYearCount}, `;
        summary += `while in ${secondYear} there are ${secondYearCount}, `;
        summary += `${compareCounts(firstYearCount, secondYearCount)}.\n`;
      }
    );
  }

  return summary;
};
