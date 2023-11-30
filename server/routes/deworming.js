import express from 'express';
import { fetchDataForDataGrid } from '../controller/dewormingController.js';

const router = express.Router();

router.get('/fetch', fetchDataForDataGrid);

export default router;
