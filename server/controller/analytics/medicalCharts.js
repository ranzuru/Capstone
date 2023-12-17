import StudentMedical from '../../models/StudentMedical.js';
import AcademicYear from '../../models/AcademicYear.js';
import _ from 'lodash';

export const getScreeningStatsBar = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const screeningFields = [
      'visionScreening',
      'auditoryScreening',
      'skinScreening',
      'scalpScreening',
      'eyesScreening',
      'earScreening',
      'noseScreening',
      'mouthScreening',
      'throatScreening',
      'neckScreening',
      'lungScreening',
      'heartScreening',
      'abdomen',
      'deformities',
    ];

    const fieldNameMapping = {
      visionScreening: 'Vision',
      auditoryScreening: 'Auditory',
      skinScreening: 'Skin',
      scalpScreening: 'Scalp',
      eyesScreening: 'Eye',
      earScreening: 'Ear',
      noseScreening: 'Nose',
      mouthScreening: 'Mouth',
      throatScreening: 'Throat',
      neckScreening: 'Neck',
      lungScreening: 'Lung',
      heartScreening: 'Heart',
      abdomen: 'Abdomen',
      deformities: 'Deformities',
    };

    const formattedStats = [];

    for (const field of screeningFields) {
      const aggregateResult = await StudentMedical.aggregate([
        {
          $match: {
            academicYear: academicYearDoc._id,
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: [`$${field}`, 'Normal'] },
                'Normal',
                'Other Conditions',
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
        { $sort: { category: 1 } },
      ]);

      // Format the data for each field
      const normalCount =
        aggregateResult.find((res) => res.category === 'Normal')?.count || 0;
      const otherConditionsCount =
        aggregateResult.find((res) => res.category === 'Other Conditions')
          ?.count || 0;

      formattedStats.push({
        name: fieldNameMapping[field] || field,
        Normal: normalCount,
        'Other Conditions': otherConditionsCount,
      });
    }

    res.json(formattedStats);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getData = async (req, res) => {
  const field = req.params.field;

  try {
    const aggregationResults = await StudentMedical.aggregate([
      {
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          condition: '$_id',
          count: 1,
        },
      },
      {
        $sort: { count: -1 }, // Optional: sort by count for better visualization
      },
    ]);

    // Optionally, calculate the total count for percentage calculation
    const totalCount = aggregationResults.reduce(
      (sum, item) => sum + item.count,
      0
    );

    res.json({ results: aggregationResults, totalCount });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const getGradeWiseScreeningIssues = async (req, res) => {
  try {
    const { schoolYear } = req.params;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const requestedGrade = req.params.grade;
    const matchGrade = requestedGrade ? { grade: requestedGrade } : {};

    const pipeline = [
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      { $match: matchGrade },
      { $unwind: '$grade' },
      { $project: { grade: 1, fields: { $objectToArray: '$$ROOT' } } },
      { $unwind: '$fields' },
      {
        $match: {
          'fields.k': {
            $in: [
              'visionScreening',
              'auditoryScreening',
              'skinScreening',
              'scalpScreening',
              'eyesScreening',
              'earScreening',
              'noseScreening',
              'mouthScreening',
              'throatScreening',
              'neckScreening',
              'lungScreening',
              'heartScreening',
              'abdomen',
              'deformities',
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            grade: '$grade',
            field: '$fields.k',
            issue: {
              $cond: [{ $eq: ['$fields.v', 'Normal'] }, 'Normal', '$fields.v'],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.grade': 1, '_id.field': 1, '_id.issue': 1 } },
    ];

    const results = await StudentMedical.aggregate(pipeline);

    const screeningFieldMapping = {
      visionScreening: 'Vision',
      auditoryScreening: 'Auditory',
      skinScreening: 'Skin',
      scalpScreening: 'Scalp',
      eyesScreening: 'Eye',
      earScreening: 'Ear',
      noseScreening: 'Nose',
      mouthScreening: 'Mouth',
      throatScreening: 'Throat',
      neckScreening: 'Neck',
      lungScreening: 'Lung',
      heartScreening: 'Heart',
      abdomen: 'Abdomen',
      deformities: 'Deformities',
    };

    const gradeWiseIssues = {};

    // Iterate over the results and populate the gradeWiseIssues object
    results.forEach((item) => {
      const { grade, field, issue } = item._id;
      const screeningType = screeningFieldMapping[field] || field;

      if (!gradeWiseIssues[grade]) {
        gradeWiseIssues[grade] = {};
      }
      if (!gradeWiseIssues[grade][screeningType]) {
        gradeWiseIssues[grade][screeningType] = [];
      }

      gradeWiseIssues[grade][screeningType].push({ issue, count: item.count });
    });

    Object.values(gradeWiseIssues).forEach((screenings) => {
      Object.keys(screenings).forEach((screeningType) => {
        screenings[screeningType].sort((a, b) => {
          if (a.issue === 'Normal') return -1;
          if (b.issue === 'Normal') return 1;
          return 0;
        });
      });
    });

    // Transform gradeWiseIssues into an array format suitable for the frontend
    const formattedData = Object.entries(gradeWiseIssues).flatMap(
      ([grade, screenings]) => {
        return Object.entries(screenings).map(([screeningType, issues]) => {
          const issuesObject = issues.reduce((acc, { issue, count }) => {
            acc[issue] = count;
            return acc;
          }, {});

          return {
            grade,
            screeningType,
            ...issuesObject,
          };
        });
      }
    );

    res.json(formattedData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//  Pie graph per grade na eh ihapon ang normal og dili
export const getScreeningIssuesByDynamicAgeGroup = async (req, res) => {
  try {
    // Extract the screening field from the request, with a default value
    const screeningField = req.params.screeningField;

    // Fetch the minimum and maximum ages
    const minAgeDoc = await StudentMedical.findOne().sort({ age: 1 });
    const maxAgeDoc = await StudentMedical.findOne().sort({ age: -1 });
    const minAge = minAgeDoc ? minAgeDoc.age : 0;
    const maxAge = maxAgeDoc ? maxAgeDoc.age : 0;

    // Create age groups
    const ageGroups = [];
    for (let age = minAge; age <= maxAge; age += 2) {
      ageGroups.push({ min: age, max: age + 2 });
    }

    // Construct the aggregation pipeline
    const pipeline = [
      {
        $project: {
          age: 1,
          screeningResult: `$${screeningField}`,
        },
      },
      {
        $match: {
          screeningResult: { $ne: 'Normal' },
        },
      },
      {
        $addFields: {
          ageGroup: {
            $reduce: {
              input: ageGroups,
              initialValue: 'Other',
              in: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$age', '$$this.min'] },
                      { $lt: ['$age', '$$this.max'] },
                    ],
                  },
                  '$$this',
                  '$$value',
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            ageGroup: '$ageGroup',
            issue: '$screeningResult',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.ageGroup.min': 1, count: -1 } },
    ];

    // Execute the aggregation pipeline
    const results = await StudentMedical.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Analytics

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
    const reports = await fetchMedicalReportsSummary(academicYearIds);

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

const fetchMedicalReportsSummary = async (academicYearIds) => {
  // Define the screening fields
  const screeningFields = [
    'visionScreening',
    'auditoryScreening',
    'skinScreening',
    'scalpScreening',
    'eyesScreening',
    'earScreening',
    'noseScreening',
    'mouthScreening',
    'throatScreening',
    'neckScreening',
    'lungScreening',
    'heartScreening',
    'abdomen',
    'deformities',
  ];

  // Create group stage dynamically
  const groupStage = {
    _id: '$academicYear',
    averageAge: { $avg: '$age' },
    averageTemperature: { $avg: '$temperature' },
    averageHeartRate: { $avg: '$heartRate' },
    averagePulseRate: { $avg: '$pulseRate' },
    averageRespiratoryRate: { $avg: '$respiratoryRate' },
    totalStudents: { $sum: 1 },
  };

  screeningFields.forEach((field) => {
    groupStage[`nonNormal${_.startCase(field).replace(/\s/g, '')}`] = {
      $sum: {
        $cond: [{ $ne: [`$${field}`, 'Normal'] }, 1, 0],
      },
    };
  });

  return StudentMedical.aggregate([
    { $match: { academicYear: { $in: academicYearIds } } },
    { $group: groupStage },
    {
      $project: {
        _id: 0,
        academicYear: { $toString: '$_id' },
        averageAge: 1,
        averageTemperature: 1,
        averageHeartRate: 1,
        averagePulseRate: 1,
        averageRespiratoryRate: 1,
        totalStudents: 1,
        ...screeningFields.reduce((acc, field) => {
          acc[`nonNormal${_.startCase(field).replace(/\s/g, '')}`] = 1;
          return acc;
        }, {}),
      },
    },
    { $sort: { academicYear: 1 } },
  ]);
};

const processComparisonData = (reports, academicYears) => {
  const processedData = {};

  // Create a mapping of ObjectId to schoolYear
  const academicYearMap = academicYears.reduce((acc, year) => {
    acc[year._id.toString()] = year.schoolYear;
    return acc;
  }, {});

  reports.forEach((report) => {
    // Map ObjectId to schoolYear
    const schoolYear = academicYearMap[report.academicYear];
    if (!schoolYear) {
      console.error(
        `No matching academic year found for ID: ${report.academicYear}`
      );
      return;
    }

    // Initialize screeningsSummary here before using it
    const screeningsSummary = initializeScreeningsSummary();

    // Update screeningsSummary with current report
    updateScreeningsSummary(screeningsSummary, report);

    calculatePercentages(screeningsSummary, 'totalStudents');

    const averageMetrics = calculateAverageMetrics([report]);

    processedData[schoolYear] = {
      ...screeningsSummary,
      ...averageMetrics,
    };
  });

  return processedData;
};

function initializeScreeningsSummary() {
  return {
    totalStudents: 0,
    totalNonNormalVision: 0,
    totalNonNormalAuditory: 0,
    totalNonNormalSkin: 0,
    totalNonNormalScalp: 0,
    totalNonNormalEyes: 0,
    totalNonNormalEars: 0,
    totalNonNormalNose: 0,
    totalNonNormalMouth: 0,
    totalNonNormalThroat: 0,
    totalNonNormalNeck: 0,
    totalNonNormalLung: 0,
    totalNonNormalHeart: 0,
    totalNonNormalAbdomen: 0,
    totalDeformities: 0,
  };
}

// Aggregate data for each screening type
function updateScreeningsSummary(summary, report) {
  summary.totalStudents += report.totalStudents;
  summary.totalNonNormalVision += report.nonNormalVisionScreening || 0;
  summary.totalNonNormalAuditory += report.nonNormalAuditoryScreening || 0;
  summary.totalNonNormalSkin += report.nonNormalSkinScreening || 0;
  summary.totalNonNormalScalp += report.nonNormalScalpScreening || 0;
  summary.totalNonNormalEyes += report.nonNormalEyesScreening || 0;
  summary.totalNonNormalEars += report.nonNormalEarScreening || 0;
  summary.totalNonNormalNose += report.nonNormalNoseScreening || 0;
  summary.totalNonNormalMouth += report.nonNormalMouthScreening || 0;
  summary.totalNonNormalThroat += report.nonNormalThroatScreening || 0;
  summary.totalNonNormalNeck += report.nonNormalNeckScreening || 0;
  summary.totalNonNormalLung += report.nonNormalLungScreening || 0;
  summary.totalNonNormalHeart += report.nonNormalHeartScreening || 0;
  summary.totalNonNormalAbdomen += report.nonNormalAbdomen || 0;
  summary.totalDeformities += report.nonNormalDeformities || 0;
}

function calculatePercentages(screeningsSummary, totalCountField) {
  Object.keys(screeningsSummary).forEach((key) => {
    if (key.startsWith('totalNonNormal') && key !== totalCountField) {
      const percentageKey = `percentage${key.substring(13)}`;
      const percentage =
        screeningsSummary[totalCountField] > 0
          ? (screeningsSummary[key] / screeningsSummary[totalCountField]) * 100
          : 0;
      screeningsSummary[percentageKey] = parseFloat(percentage.toFixed(2));
    }
  });
}

function calculateAverageMetrics(reports) {
  const totalEntries = _.sumBy(reports, 'totalStudents');
  return {
    averageAge:
      totalEntries > 0
        ? parseFloat(
            (
              _.sumBy(
                reports,
                (report) => report.averageAge * report.totalStudents
              ) / totalEntries
            ).toFixed(2)
          )
        : null,
    averageTemperature:
      totalEntries > 0
        ? parseFloat(
            (
              _.sumBy(
                reports,
                (report) => report.averageTemperature * report.totalStudents
              ) / totalEntries
            ).toFixed(2)
          )
        : null,
    averageHeartRate:
      totalEntries > 0
        ? parseFloat(
            (
              _.sumBy(
                reports,
                (report) => report.averageHeartRate * report.totalStudents
              ) / totalEntries
            ).toFixed(2)
          )
        : null,
    averagePulseRate:
      totalEntries > 0
        ? parseFloat(
            (
              _.sumBy(
                reports,
                (report) => report.averagePulseRate * report.totalStudents
              ) / totalEntries
            ).toFixed(2)
          )
        : null,
    averageRespiratoryRate:
      totalEntries > 0
        ? parseFloat(
            (
              _.sumBy(
                reports,
                (report) => report.averageRespiratoryRate * report.totalStudents
              ) / totalEntries
            ).toFixed(2)
          )
        : null,
  };
}

const generateComparisonSummary = (data) => {
  const years = Object.keys(data).sort();
  let summary = '';

  const formatPercentage = (value) => {
    // Check if the value is undefined
    if (value === undefined) {
      return 'data unavailable';
    }

    // Format the value to two decimal places
    return `${Number(value).toFixed(2)}%`;
  };

  const compare = (value1, value2, fieldName) => {
    // Check if either of the values is undefined
    if (value1 === undefined || value2 === undefined) {
      return `data unavailable for ${fieldName}`;
    }

    const difference = value1 - value2;
    const trend = difference > 0 ? 'an increase' : 'a decrease';
    // Limiting the difference to two decimal places
    const formattedDifference = Math.abs(difference).toFixed(2);
    return `${trend} of ${formattedDifference} in ${fieldName}`;
  };

  const findMostPrevalentCondition = (yearData) => {
    const conditions = [
      { name: 'Vision', count: yearData.totalNonNormalVision },
      { name: 'Auditory', count: yearData.totalNonNormalAuditory },
      { name: 'Skin', count: yearData.totalNonNormalSkin },
      { name: 'Scalp', count: yearData.totalNonNormalScalp },
      { name: 'Eyes', count: yearData.totalNonNormalEyes },
      { name: 'Ears', count: yearData.totalNonNormalEars },
      { name: 'Nose', count: yearData.totalNonNormalNose },
      { name: 'Mouth', count: yearData.totalNonNormalMouth },
      { name: 'Throat', count: yearData.totalNonNormalThroat },
      { name: 'Neck', count: yearData.totalNonNormalNeck },
      { name: 'Lung', count: yearData.totalNonNormalLung },
      { name: 'Heart', count: yearData.totalNonNormalHeart },
      { name: 'Abdomen', count: yearData.totalNonNormalAbdomen },
      { name: 'Deformities', count: yearData.totalNonNormalDeformities },
    ];
    const validConditions = conditions.filter(
      (condition) => condition.count > 0
    );

    if (validConditions.length === 0) {
      return { name: 'No prevalent conditions', count: 0, percentage: 0 };
    }

    const mostPrevalent = validConditions.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );

    // Calculate the percentage if totalStudents is available
    if (yearData.totalStudents) {
      mostPrevalent.percentage =
        (mostPrevalent.count / yearData.totalStudents) * 100;
    } else {
      mostPrevalent.percentage = undefined;
    }

    return mostPrevalent;
  };

  const generateDynamicSummaryForYear = (yearData, year) => {
    const mostPrevalent = findMostPrevalentCondition(yearData);
    let dynamicSummary = `For the school year ${year}, ${yearData.totalStudents} students were assessed. `;
    dynamicSummary += `The most prevalent condition was ${
      mostPrevalent.name
    } issue, affecting ${mostPrevalent.count} students (${formatPercentage(
      mostPrevalent.percentage
    )}). `;

    // Dynamically adding other conditions
    for (const key in yearData) {
      if (key.startsWith('totalNonNormal') && yearData[key] > 0) {
        const conditionName = key.replace('totalNonNormal', '').toLowerCase();
        const percentageKey = `percentagel${
          conditionName.charAt(0).toUpperCase() + conditionName.slice(1)
        }`;
        const count = yearData[key];
        const percentage = yearData[percentageKey];

        if (conditionName !== mostPrevalent.name.toLowerCase()) {
          dynamicSummary += `${
            conditionName.charAt(0).toUpperCase() + conditionName.slice(1)
          } issues were observed in ${count} students (${formatPercentage(
            percentage
          )}). `;
        }
      }
    }

    dynamicSummary += `The average age of the students was ${yearData.averageAge.toFixed(
      1
    )} years, with an average body temperature of ${yearData.averageTemperature.toFixed(
      1
    )}°C. `;
    dynamicSummary += `The average heart rate was ${yearData.averageHeartRate.toFixed(
      1
    )} bpm, and the average respiratory rate was ${yearData.averageRespiratoryRate.toFixed(
      1
    )} breaths per minute.`;

    return dynamicSummary;
  };

  const generateComparativeSummary = (
    firstData,
    secondData,
    firstYear,
    secondYear
  ) => {
    let comparativeSummary = `Comparing the school years ${firstYear} and ${secondYear}, `;

    // Dynamically comparing conditions
    const conditionKeys = Object.keys(firstData).filter(
      (key) =>
        key.startsWith('totalNonNormal') &&
        (firstData[key] > 0 || secondData[key] > 0)
    );
    conditionKeys.forEach((key) => {
      const conditionName = key.replace('totalNonNormal', '').toLowerCase();
      const readableConditionName =
        conditionName.charAt(0).toUpperCase() + conditionName.slice(1);

      const firstYearCount = firstData[key];
      const secondYearCount = secondData[key];

      comparativeSummary += `The ${readableConditionName} cases changed from ${firstYearCount} in ${firstYear} to ${secondYearCount} in ${secondYear}. `;
    });

    // Comparing average values
    comparativeSummary += `Average heart rate changed with ${compare(
      secondData.averageHeartRate,
      firstData.averageHeartRate,
      'the average heart rate'
    )}, `;
    comparativeSummary += `and respiratory rate with ${compare(
      secondData.averageRespiratoryRate,
      firstData.averageRespiratoryRate,
      'the average respiratory rate'
    )}. `;
    comparativeSummary += `Average student age altered from ${firstData.averageAge.toFixed(
      1
    )} years to ${secondData.averageAge.toFixed(1)} years. `;
    comparativeSummary += `Average body temperature changed from ${firstData.averageTemperature.toFixed(
      1
    )}°C to ${secondData.averageTemperature.toFixed(1)}°C. `;
    comparativeSummary += `Average pulse rate saw ${compare(
      secondData.averagePulseRate,
      firstData.averagePulseRate,
      'an alteration'
    )}.`;

    return comparativeSummary;
  };

  if (years.length === 0) {
    return 'No academic year data available for health analysis.';
  } else if (years.length === 1) {
    const year = years[0];
    const yearData = data[year];
    summary += generateDynamicSummaryForYear(yearData, year);
  } else {
    const [firstYear, secondYear] = years.slice(0, 2);
    const firstData = data[firstYear],
      secondData = data[secondYear];
    summary += generateComparativeSummary(
      firstData,
      secondData,
      firstYear,
      secondYear
    );
  }

  return summary;
};
