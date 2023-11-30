import StudentProfile from '../models/StudentProfile.js';
import StudentMedical from '../models/StudentMedical.js';

// Function to fetch and format data for the datagrid
export const fetchDataForDataGrid = async (req, res) => {
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
        const enrolledCounts = await countStudentsInProfile(grade);
        const dewormedCounts = await countDewormedStudents(grade);
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

const countStudentsInProfile = async (grade) => {
  try {
    const counts = await StudentProfile.aggregate([
      { $match: { grade: grade, status: 'Active' } },
      { $group: { _id: '$is4p', count: { $sum: 1 } } },
    ]);

    // Transform the aggregation result into a more readable format
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
    return { is4p: 0, not4p: 0 }; // Return 0 counts in case of error
  }
};

const countDewormedStudents = async (grade) => {
  try {
    const counts = await StudentMedical.aggregate([
      { $match: { grade: grade, deworming: true, status: 'Active' } },
      { $group: { _id: '$is4p', count: { $sum: 1 } } },
    ]);

    // Transform the aggregation result into a more readable format
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
    return { is4p: 0, not4p: 0 }; // Return 0 counts in case of error
  }
};
