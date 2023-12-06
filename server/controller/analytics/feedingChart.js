import FeedingProgram from '../../models/FeedingProgram.js';
import AcademicYear from '../../models/AcademicYear.js';

// LineChart
export const getBmiClassificationCountsByYear = async (req, res) => {
  try {
    // Fetch the active academic year and top 4 additional years
    const activeYear = await AcademicYear.findOne({ status: 'Active' });
    const topAdditionalYears = await AcademicYear.find({
      _id: { $ne: activeYear?._id },
    })
      .sort({ schoolYear: -1 })
      .limit(4)
      .select('_id');

    let academicYearIds = [
      activeYear?._id,
      ...topAdditionalYears.map((year) => year._id),
    ];

    // Fetch measurementType from request query
    const measurementType = req.query.measurementType;

    // Adjust the match condition based on the measurementType
    let matchCondition = { academicYear: { $in: academicYearIds } };
    if (measurementType && measurementType !== 'ALL') {
      matchCondition.measurementType = measurementType;
    }

    const bmiData = await FeedingProgram.aggregate([
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'academicyears',
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
            schoolYear: '$academicYearDetails.schoolYear',
            bmiClassification: '$bmiClassification',
            measurementType:
              measurementType === 'ALL' ? 'ALL' : '$measurementType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.schoolYear': 1,
          '_id.bmiClassification': 1,
          '_id.measurementType': 1,
        },
      },
    ]);

    // Transform data for the line chart
    const transformedData = {};
    bmiData.forEach((item) => {
      const { schoolYear, bmiClassification, measurementType } = item._id;
      const yearTypeKey =
        measurementType === 'ALL'
          ? `${schoolYear}`
          : `${schoolYear} (${measurementType})`;
      if (!transformedData[yearTypeKey]) {
        transformedData[yearTypeKey] = {
          schoolYear: yearTypeKey,
          'Severely Wasted': 0,
          Wasted: 0,
          Normal: 0,
          Overweight: 0,
          Obese: 0,
        };
      }
      transformedData[yearTypeKey][bmiClassification] = item.count;
    });

    res.status(200).json(Object.values(transformedData));
  } catch (error) {
    res.status(500).send(error);
  }
};

// Bar

export const getPrePostComparison = async (req, res) => {
  try {
    const comparisonData = await FeedingProgram.aggregate([
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
    const beneficiariesPerGrade = await FeedingProgram.aggregate([
      {
        $match: { beneficiaryOfSBFP: true }, // Filter to include only SBFP beneficiaries
      },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }, // Count the number of beneficiaries in each grade
        },
      },
      {
        $sort: { _id: 1 }, // Optionally sort by grade
      },
    ]);

    const formattedData = beneficiariesPerGrade.map((item) => ({
      name: item._id, // 'name' is a more descriptive key for Recharts
      value: item.count, // 'value' is used in Recharts for the actual value
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching SBFP beneficiaries per grade:', error);
    res.status(500).send('Internal Server Error');
  }
};
