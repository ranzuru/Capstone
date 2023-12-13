import StudentMedical from '../../models/StudentMedical.js';
import AcademicYear from '../../models/AcademicYear.js';

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
