import ClinicVisitSchema from '../models/ClinicVisit.js';
import MedicineItemSchema from '../models/MedicineItem.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validate } from '../schema/clinicVisitValidation.js';

// create
export const post = async (req, res) => {
  try {
    const { schoolYear, ...data } = req.body;

    // validate data
    const { error } = validate({ schoolYear, ...data });
    if (error) return res.status(400).send(error.details[0].message);

    // find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // create a new data with the academic year ObjectId
    const newData = new ClinicVisitSchema({
      ...data,
      academicYear: academicYear._id,
    });

    await newData.save();
    const createdData = await ClinicVisitSchema.findById(newData._id).populate(
      'academicYear'
    );

    // modify the response to include the schoolYear string instead of the ObjectId
    const response = createdData.toObject(); // convert to a plain javascript object
    response.schoolYear = academicYear.schoolYear; // add the schoolYear string

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAll = async (req, res) => {
  try {
    const { schoolYear } = req.query;

    // First, find the matching AcademicYear IDs
    let academicYearIds = [];
    if (schoolYear) {
      const academicYears = await AcademicYear.find({ schoolYear });
      academicYearIds = academicYears.map((ay) => ay._id);
    }

    // Then, find clinic visits that match these AcademicYear IDs
    const query = schoolYear ? { academicYear: { $in: academicYearIds } } : {};
    const data = await ClinicVisitSchema.find(query)
      .populate('academicYear')
      .populate('medicine');

    // The rest of your logic remains the same
    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.medicine.itemId;
        const itemData = await MedicineItemSchema.find({ itemId });
        const product = itemData.map((item) => item.product);

        return {
          ...data.toObject(),
          itemData: product,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const update = async (req, res) => {
  try {
    const { schoolYear, ...data } = req.body;

    let updateObject = data;

    // Update academicYear if schoolYear is provided
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const newData = await ClinicVisitSchema.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    if (!newData) return res.status(404).send('data not found');

    const response = newData.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = newData.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};
// Delete
export const deleteData = async (req, res) => {
  try {
    const data = await ClinicVisitSchema.findByIdAndRemove(req.params.id);
    if (!data) return res.status(404).send('record not found');

    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};
