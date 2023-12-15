import StudentMedical from '../../models/StudentMedical.js';

export const getScreeningStatsBar = async (req, res) => {
  try {
    const requestedGrade = req.params.grade;
    const matchGrade = requestedGrade ? { grade: requestedGrade } : {};

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
        { $match: matchGrade },
        {
          $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            issue: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Structure the results to include 'Normal' and specific issues
      let normalCount = 0;
      const issues = {};

      aggregateResult.forEach((result) => {
        if (result.issue === 'Normal') {
          normalCount = result.count;
        } else {
          issues[result.issue] = result.count;
        }
      });

      // Create a stats object for each screening field
      const statsForField = {
        name: fieldNameMapping[field] || field,
        Normal: normalCount,
        ...issues, // Spread operator to include all other issues
      };

      formattedStats.push(statsForField);
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
    const requestedGrade = req.params.grade;
    const matchGrade = requestedGrade ? { grade: requestedGrade } : {};

    const pipeline = [
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
