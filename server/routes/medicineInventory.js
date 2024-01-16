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
    deleteAdjustment
} from '../controller/medicineInventoryController.js';

const router = express.Router();

// ITEM
router.post('/postItem', postItem);
router.get('/getAllItem', getAllItem);
router.put('/updateItem/:id', updateItem);
router.delete('/deleteItem/:id', deleteItem);
// BATCH
router.get('/getAllBatch', getAllBatch);
router.get('/getAllBatchNotExpired', getAllBatchNotExpired);
// IN
router.post('/postIn', postIn);
router.get('/getAllIn', getAllIn);
router.get('/getAllInAutoComplete', getAllInAutoComplete);
router.put('/updateIn/:id', updateIn);
router.delete('/deleteIn/:id', deleteIn);
// DISPENSE
router.post('/postDispense', postDispense);
router.post('/postDispenseClinicVisit', postDispenseClinicVisit);
router.get('/getAllDispense', getAllDispense);
router.put('/updateDispense/:id', updateDispense);
router.delete('/deleteDispense/:id', deleteDispense);
// ADJUSTMENT
router.post('/postAdjustment', postAdjustment);
router.get('/getAllAdjustment', getAllAdjustment);
router.put('/updateAdjustment/:id', updateAdjustment);
router.delete('/deleteAdjustment/:id', deleteAdjustment);

export default router;
