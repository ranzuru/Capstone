import StudentMedical from '../models/StudentMedical.js';
import AcademicYear from '../models/AcademicYear.js';

// Function to fetch and format data for the datagrid
export const fetchDataForDataGrid = async (req, res) => {
  const { schoolYear } = req.query;
  const grades = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
  ];

  try {
    const data = await Promise.all(
      grades.map(async (grade) => {
        const enrolledCounts = await countStudentsInProfile(grade, schoolYear);
        const dewormedCounts = await countDewormedStudents(grade, schoolYear);
        return {
          grade: grade,
          enrolled: enrolledCounts,
          dewormed: dewormedCounts,
        };
      })
    );

    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
};

const countStudentsInProfile = async (grade, schoolYear) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'academicyears', // Replace with your AcademicYear collection name
          localField: 'academicYear', // Replace with the field that references AcademicYear in StudentMedical
          foreignField: '_id',
          as: 'academicYearInfo',
        },
      },
      { $unwind: '$academicYearInfo' },
      {
        $match: {
          'academicYearInfo.schoolYear': schoolYear,
          grade: grade,
        },
      },
      {
        $group: {
          _id: '$is4p',
          count: { $sum: 1 },
        },
      },
    ];

    const counts = await StudentMedical.aggregate(pipeline);

    const result = counts.reduce(
      (acc, curr) => {
        const key = curr._id ? 'is4p' : 'not4p';
        acc[key] = curr.count;
        return acc;
      },
      { is4p: 0, not4p: 0 }
    );

    return result;
  } catch (error) {
    console.error('Error in countStudentsInProfile:', error);
    return { is4p: 0, not4p: 0 };
  }
};
const countDewormedStudents = async (grade, schoolYear) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'academicyears',
          localField: 'academicYear',
          foreignField: '_id',
          as: 'academicYearInfo',
        },
      },
      { $unwind: '$academicYearInfo' },
      {
        $match: {
          'academicYearInfo.schoolYear': schoolYear,
          grade: grade,
          deworming: true,
        },
      },
      {
        $group: {
          _id: '$is4p',
          count: { $sum: 1 },
        },
      },
    ];
    const counts = await StudentMedical.aggregate(pipeline);

    const result = counts.reduce(
      (acc, curr) => {
        const key = curr._id ? 'is4p' : 'not4p';
        acc[key] = curr.count;
        return acc;
      },
      { is4p: 0, not4p: 0 }
    );

    return result;
  } catch (error) {
    console.error('Error in countDewormedStudents:', error);
    return { is4p: 0, not4p: 0 };
  }
};

export const getDewormReport = async (req, res) => {
  try {
    const { schoolYear } = req.query;

    const academicYearDoc = await AcademicYear.findOne({ schoolYear });
    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const dewormReport = await StudentMedical.aggregate([
      {
        $match: {
          academicYear: academicYearDoc._id,
        },
      },
      {
        $group: {
          _id: { grade: '$grade', is4p: '$is4p' },
          dewormedCount: {
            $sum: {
              $cond: ['$deworming', 1, 0],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.grade',
          dewormed4Ps: {
            $sum: {
              $cond: ['$_id.is4p', '$dewormedCount', 0],
            },
          },
          enrolled4Ps: {
            $sum: {
              $cond: ['$_id.is4p', '$totalCount', 0],
            },
          },
          dewormedNon4Ps: {
            $sum: {
              $cond: [{ $not: ['$_id.is4p'] }, '$dewormedCount', 0],
            },
          },
          enrolledNon4Ps: {
            $sum: {
              $cond: [{ $not: ['$_id.is4p'] }, '$totalCount', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          grade: '$_id',
          enrolled4Ps: 1,
          dewormed4Ps: 1,
          enrolledNon4Ps: 1,
          dewormedNon4Ps: 1,
          totalEnrolled: { $add: ['$enrolled4Ps', '$enrolledNon4Ps'] },
          totalDewormed: { $add: ['$dewormed4Ps', '$dewormedNon4Ps'] },
        },
      },
      {
        $addFields: {
          dewormedPercentage: {
            $cond: [
              { $eq: ['$totalEnrolled', 0] },
              '0.00%',
              {
                $concat: [
                  {
                    $toString: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$totalDewormed', '$totalEnrolled'] },
                            100,
                          ],
                        },
                        2,
                      ],
                    },
                  },
                  '%',
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { grade: 1 },
      },
    ]);

    res.json({
      SchoolYear: academicYearDoc.schoolYear,
      DewormReport: dewormReport,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error generating deworming report: ' + error.message });
  }
};
