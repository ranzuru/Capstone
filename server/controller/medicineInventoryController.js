import MedicineItemSchema from '../models/MedicineItem.js';
import MedicineInSchema from '../models/MedicineIn.js';
import MedicineDispenseSchema from '../models/MedicineDispense.js';
import MedicineAdjustmentSchema from '../models/MedicineAdjustment.js';
import { handleError } from '../utils/handleError.js';
import { validateItem } from '../schema/medicineItemValidation.js';
import { validateIn } from '../schema/medicineInValidation.js';
import { validateDispense } from '../schema/medicineDispenseValidation.js';
import { validateAdjustment } from '../schema/medicineAdjustmentValidation.js';

// ITEM
export const postItem = async (req, res) => {
  try {
    const { ...data } = req.body;

    // validate  data
    const { error } = validateItem({ ...data });
    if (error) return res.status(400).send(error.details[0].message);

    // create a new data with the academic year ObjectId
    const newData = new MedicineItemSchema({
      ...data,
    });

    await newData.save();
    const createdData = await MedicineItemSchema.findById(newData._id);

    const response = createdData.toObject(); // convert to a plain javascript object

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAllItem = async (req, res) => {
  try {
    const data = await MedicineItemSchema.find();
    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateItem = async (req, res) => {
  try {
    const { ...data } = req.body;

    let updateObject = data;

    const newData = await MedicineItemSchema.findOneAndUpdate(
      req.body.itemId,
      updateObject,
      { new: true }
    );

    if (!newData) return res.status(404).send('data not found');

    const response = newData.toObject(); // Convert to a plain JavaScript object

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};
// Delete
export const deleteItem = async (req, res) => {
  try {
    const data = await MedicineItemSchema.findByIdAndRemove(req.params.id);
    if (!data) return res.status(404).send('record not found');

    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};

// =================================================================
// BATCH
// read
export const getAllBatch = async (req, res) => {
  try {
    const data = await MedicineInSchema.find();

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;
        const batchId = data.batchId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Find related dispense data
        const dispenseData = await MedicineDispenseSchema.find({
          itemId,
          batchId,
        });

        // Find related addition adjustment data
        const additionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Addition',
        });

        // Find related subtraction adjustment data
        const subtractionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Subtraction',
        });

        // Calculate total quantity by summing quantities from dispense, addition, and subtraction
        const totalBatchQuantity = Math.abs(
          data.quantity +
            additionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            subtractionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            dispenseData.reduce((total, record) => total + record.quantity, 0)
        );

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          totalBatchQuantity: totalBatchQuantity || null,
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

export const getAllBatchNotExpired = async (req, res) => {
  try {
    const data = await MedicineInSchema.find({
      expirationDate: { $gt: new Date() },
    });

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;
        const batchId = data.batchId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Find related dispense data
        const dispenseData = await MedicineDispenseSchema.find({
          itemId,
          batchId,
        });

        // Find related addition adjustment data
        const additionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Addition',
        });

        // Find related subtraction adjustment data
        const subtractionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Subtraction',
        });

        // Calculate total quantity by summing quantities from dispense, addition, and subtraction
        const totalBatchQuantity = Math.abs(
          data.quantity +
            additionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            subtractionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            dispenseData.reduce((total, record) => total + record.quantity, 0)
        );

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          totalBatchQuantity: totalBatchQuantity || null,
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

// =================================================================
// IN
// create
export const postIn = async (req, res) => {
  try {
    const { ...data } = req.body;
    // validate  data
    const { error } = validateIn({ ...data });
    if (error) return res.status(400).send(error.details[0].message);

    const { itemId, batchId, quantity } = req.body;

    const existingItem = await MedicineItemSchema.findOne({ itemId });
    const existingItemBatch = await MedicineInSchema.findOne({
      itemId,
      batchId,
    });

    if (!existingItem) {
      return res.status(400).send('Item ID does not exists');
    } else if (existingItemBatch) {
      return res
        .status(400)
        .send('Both of Item ID and Batch ID already exists');
    }

    // create a new data
    const newData = new MedicineInSchema({
      ...data,
    });

    const existingItemData = await MedicineItemSchema.find({
      itemId: newData.itemId,
    });

    const existingItemQuantity = existingItemData[0].quantity; // Accessing 'quantity' from the first document

    const newQuantity = quantity + existingItemQuantity;

    await newData.save();
    const createdData = await MedicineInSchema.findById(newData._id);

    await MedicineItemSchema.updateOne(
      { itemId: newData.itemId },
      { $set: { quantity: newQuantity } }
    );

    const response = createdData.toObject(); // convert to a plain javascript object

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAllIn = async (req, res) => {
  try {
    const data = await MedicineInSchema.find();

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateIn = async (req, res) => {
  try {
    const { ...data } = req.body;

    let updateObject = data;

    const newData = await MedicineInSchema.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    );

    if (!newData) return res.status(404).send('data not found');

    const response = newData.toObject(); // Convert to a plain JavaScript object

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};
// Delete
export const deleteIn = async (req, res) => {
  try {
    const data = await MedicineInSchema.findByIdAndRemove(req.params.id);
    if (!data) return res.status(404).send('record not found');

    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};

// =================================================================
// DISPENSE
export const postDispense = async (req, res) => {
  try {
    const { ...data } = req.body;
    const { itemId, batchId, quantity } = req.body;

    // validate  data
    const { error } = validateDispense({ ...data });
    if (error) return res.status(400).send(error.details[0].message);

    const existingItem = await MedicineItemSchema.findOne({ itemId });
    const existingItemBatch = await MedicineInSchema.findOne({
      itemId,
      batchId,
    });

    if (!existingItem) {
      return res.status(400).send('Item ID does not exists');
    } else if (!existingItemBatch) {
      return res.status(400).send('Batch ID on that Item ID does not exists');
    }
    // create a new data with the academic year ObjectId
    const newData = new MedicineDispenseSchema({
      ...data,
    });

    const existingItemData = await MedicineItemSchema.find({
      itemId: newData.itemId,
    });
    const existingItemQuantity = existingItemData[0].quantity; // Accessing 'quantity' from the first document
    const existingInData = await MedicineInSchema.find({
      itemId: newData.itemId,
    });
    const existingInQuantity = existingInData[0].quantity; // Accessing 'quantity' from the first document
    const existingDispenseData = await MedicineDispenseSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
    });
    const existingAdditionAdjustmentData = await MedicineAdjustmentSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
      type: 'Addition',
    });
    const existingSubtractionAdjustmentData =
      await MedicineAdjustmentSchema.find({
        itemId: newData.itemId,
        batchId: newData.batchId,
        type: 'Subtraction',
      });

    const existingDispenseTotalQuantity = existingDispenseData.reduce(
      (acc, record) => acc + record.quantity,
      0
    );
    const existingAdditionAdjustmentTotalQuantity =
      existingAdditionAdjustmentData.reduce(
        (acc, record) => acc + record.quantity,
        0
      );
    const existingSubtractionAdjustmentTotalQuantity =
      existingSubtractionAdjustmentData.reduce(
        (acc, record) => acc + record.quantity,
        0
      );
    let existingInAdditionSubtractionTotalQuantity =
      Math.abs(
        existingInQuantity +
          existingAdditionAdjustmentTotalQuantity -
          existingSubtractionAdjustmentTotalQuantity
      ) - existingDispenseTotalQuantity;
    let newQuantity;

    if (quantity > existingInAdditionSubtractionTotalQuantity) {
      return res
        .status(400)
        .send(
          'Operation Failed: The current dispensing quantity is greater than the remaining quantity'
        );
    } else {
      newQuantity = Math.abs(quantity - existingItemQuantity);
    }
    await newData.save();

    const createdData = await MedicineDispenseSchema.findById(newData._id);

    await MedicineItemSchema.updateOne(
      { itemId: itemId },
      { $set: { quantity: newQuantity } }
    );

    const response = createdData.toObject(); // convert to a plain javascript object

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

export const postDispenseClinicVisit = async (req, res) => {
  try {
    const { clinicVisitId, medicine, quantity } = req.body;

    const inData = await MedicineInSchema.findById(medicine);

    const itemId = inData.itemId;
    const batchId = inData.batchId;

    const existingItem = await MedicineItemSchema.findOne({ itemId });
    const existingItemBatch = await MedicineInSchema.findOne({
      itemId,
      batchId,
    });

    if (!existingItem) {
      return res.status(400).send('Item ID does not exists');
    } else if (!existingItemBatch) {
      return res.status(400).send('Batch ID on that Item ID does not exists');
    }
    // create a new data with the academic year ObjectId
    const newData = new MedicineDispenseSchema({
      itemId: itemId,
      batchId: batchId,
      quantity: quantity,
      reason: `Clinic Visit Record ID: ${clinicVisitId}`,
      status: 'Active',
    });

    const existingItemData = await MedicineItemSchema.find({
      itemId: newData.itemId,
    });
    const existingItemQuantity = existingItemData[0].quantity; // Accessing 'quantity' from the first document
    const existingInData = await MedicineInSchema.find({
      itemId: newData.itemId,
    });
    const existingInQuantity = existingInData[0].quantity; // Accessing 'quantity' from the first document
    const existingDispenseData = await MedicineDispenseSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
    });
    const existingAdditionAdjustmentData = await MedicineAdjustmentSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
      type: 'Addition',
    });
    const existingSubtractionAdjustmentData =
      await MedicineAdjustmentSchema.find({
        itemId: newData.itemId,
        batchId: newData.batchId,
        type: 'Subtraction',
      });

    const existingDispenseTotalQuantity = existingDispenseData.reduce(
      (acc, record) => acc + record.quantity,
      0
    );
    const existingAdditionAdjustmentTotalQuantity =
      existingAdditionAdjustmentData.reduce(
        (acc, record) => acc + record.quantity,
        0
      );
    const existingSubtractionAdjustmentTotalQuantity =
      existingSubtractionAdjustmentData.reduce(
        (acc, record) => acc + record.quantity,
        0
      );
    let existingInAdditionSubtractionTotalQuantity =
      Math.abs(
        existingInQuantity +
          existingAdditionAdjustmentTotalQuantity -
          existingSubtractionAdjustmentTotalQuantity
      ) - existingDispenseTotalQuantity;
    let newQuantity;

    if (quantity > existingInAdditionSubtractionTotalQuantity) {
      return res
        .status(400)
        .send(
          'Operation Failed: The current dispensing quantity is greater than the remaining quantity'
        );
    } else {
      newQuantity = Math.abs(quantity - existingItemQuantity);
    }
    await newData.save();

    const createdData = await MedicineDispenseSchema.findById(newData._id);

    await MedicineItemSchema.updateOne(
      { itemId: itemId },
      { $set: { quantity: newQuantity } }
    );

    const response = createdData.toObject(); // convert to a plain javascript object

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAllDispense = async (req, res) => {
  try {
    const data = await MedicineDispenseSchema.find();

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateDispense = async (req, res) => {
  try {
    const { ...data } = req.body;

    let updateObject = data;

    const newData = await MedicineDispenseSchema.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    );

    if (!newData) return res.status(404).send('data not found');

    const response = newData.toObject(); // Convert to a plain JavaScript object

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};
// Delete
export const deleteDispense = async (req, res) => {
  try {
    const data = await MedicineDispenseSchema.findByIdAndRemove(req.params.id);
    if (!data) return res.status(404).send('record not found');

    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};

// =================================================================
// ADJUSTMENT
export const postAdjustment = async (req, res) => {
  try {
    const { ...data } = req.body;

    // validate  data
    const { error } = validateAdjustment({ ...data });
    if (error) return res.status(400).send(error.details[0].message);

    const { itemId, batchId, quantity, type } = req.body;

    const existingItem = await MedicineItemSchema.findOne({ itemId });
    const existingItemBatch = await MedicineInSchema.findOne({
      itemId,
      batchId,
    });

    if (!existingItem) {
      return res.status(400).send('Item ID does not exists');
    } else if (!existingItemBatch) {
      return res.status(400).send('Batch ID on that Item ID does not exists');
    }

    // create a new data with the academic year ObjectId
    const newData = new MedicineAdjustmentSchema({
      ...data,
    });

    const existingItemData = await MedicineItemSchema.find({
      itemId: newData.itemId,
    });
    const existingItemQuantity = existingItemData[0].quantity; // Accessing 'quantity' from the first document
    const existingInData = await MedicineInSchema.find({
      itemId: newData.itemId,
    });
    const existingInQuantity = existingInData[0].quantity; // Accessing 'quantity' from the first document
    const existingDispenseData = await MedicineDispenseSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
    });
    const existingAdditionAdjustmentData = await MedicineAdjustmentSchema.find({
      itemId: newData.itemId,
      batchId: newData.batchId,
      type: 'Addition',
    });
    const existingSubtractionAdjustmentData =
      await MedicineAdjustmentSchema.find({
        itemId: newData.itemId,
        batchId: newData.batchId,
        type: 'Subtraction',
      });

    let newQuantity;

    if (type === 'Addition') {
      newQuantity = quantity + existingItemQuantity;
    } else if (type === 'Subtraction') {
      const existingDispenseTotalQuantity = existingDispenseData.reduce(
        (acc, record) => acc + record.quantity,
        0
      );
      const existingAdditionAdjustmentTotalQuantity =
        existingAdditionAdjustmentData.reduce(
          (acc, record) => acc + record.quantity,
          0
        );
      const existingSubtractionAdjustmentTotalQuantity =
        existingSubtractionAdjustmentData.reduce(
          (acc, record) => acc + record.quantity,
          0
        );

      let existingInAdditionSubtractionTotalQuantity =
        Math.abs(
          existingInQuantity +
            existingAdditionAdjustmentTotalQuantity -
            existingSubtractionAdjustmentTotalQuantity
        ) - existingDispenseTotalQuantity;

      if (quantity > existingInAdditionSubtractionTotalQuantity) {
        return res
          .status(400)
          .send(
            'Operation Failed: The current dispensing quantity is greater than the remaining quantity'
          );
      } else {
        newQuantity = Math.abs(quantity - existingItemQuantity);
      }
    } else {
      return res
        .status(400)
        .send(
          'Operation Failed: Addition and Subtraction are the only choices for adjusting quantity'
        );
    }

    await newData.save();
    const createdData = await MedicineAdjustmentSchema.findById(newData._id);

    await MedicineItemSchema.updateOne(
      { itemId: newData.itemId },
      { $set: { quantity: newQuantity } }
    );

    const response = createdData.toObject(); // convert to a plain javascript object

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAllAdjustment = async (req, res) => {
  try {
    const data = await MedicineAdjustmentSchema.find();

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateAdjustment = async (req, res) => {
  try {
    const { ...data } = req.body;

    let updateObject = data;

    const newData = await MedicineAdjustmentSchema.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    );

    if (!newData) return res.status(404).send('data not found');

    const response = newData.toObject(); // Convert to a plain JavaScript object

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};
// Delete
export const deleteAdjustment = async (req, res) => {
  try {
    const data = await MedicineAdjustmentSchema.findByIdAndRemove(
      req.params.id
    );
    if (!data) return res.status(404).send('record not found');

    res.send(data);
  } catch (err) {
    handleError(res, err);
  }
};
