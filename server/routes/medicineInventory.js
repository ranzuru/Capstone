import express from 'express';
import {
  postItem,
  getAllItem,
  updateItem,
  deleteItem,
  getAllBatch,
  getAllBatchNotExpired,
  postIn,
  getAllIn,
  getAllInAutoComplete,
  updateIn,
  deleteIn,
  postDispense,
  postDispenseClinicVisit,
  getAllDispense,
  updateDispense,
  deleteDispense,
  postAdjustment,
  getAllAdjustment,
  updateAdjustment,
  deleteAdjustment,
} from '../controller/medicineInventoryController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
import { getAllBatchNearExpiry } from '../controller/dashboardController.js';

const router = express.Router();

router.use(authenticateUser);

// ITEM
router.post('/postItem', logActionsMiddleware, postItem);
router.get('/getAllItem', getAllItem);
router.put('/updateItem/:id', logActionsMiddleware, updateItem);
router.delete('/deleteItem/:id', logActionsMiddleware, deleteItem);
// BATCH
router.get('/getAllBatch', getAllBatch);
router.get('/getAllBatchNotExpired', getAllBatchNotExpired);
// IN
router.post('/postIn', logActionsMiddleware, postIn);
router.get('/getAllIn', getAllIn);
router.get('/getAllInAutoComplete', getAllInAutoComplete);
router.put('/updateIn/:id', logActionsMiddleware, updateIn);
router.delete('/deleteIn/:id', logActionsMiddleware, deleteIn);
// DISPENSE
router.post('/postDispense', logActionsMiddleware, postDispense);
router.post(
  '/postDispenseClinicVisit',
  logActionsMiddleware,
  postDispenseClinicVisit
);
router.get('/getAllDispense', getAllDispense);
router.put('/updateDispense/:id', logActionsMiddleware, updateDispense);
router.delete('/deleteDispense/:id', logActionsMiddleware, deleteDispense);
// ADJUSTMENT
router.post('/postAdjustment', logActionsMiddleware, postAdjustment);
router.get('/getAllAdjustment', getAllAdjustment);
router.put('/updateAdjustment/:id', logActionsMiddleware, updateAdjustment);
router.delete('/deleteAdjustment/:id', logActionsMiddleware, deleteAdjustment);
// Dashboard
router.get('/medicineDashboard', getAllBatchNearExpiry);

export default router;
