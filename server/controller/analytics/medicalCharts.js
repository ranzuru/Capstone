import StudentMedical from '../../models/StudentMedical.js';

export const getScreeningStatsBar = async (req, res) => {
  try {
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

export const getHistogramData = async (req, res) => {
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
          category: '$_id',
          count: 1,
        },
      },
    ]);

    res.json(aggregationResults);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
