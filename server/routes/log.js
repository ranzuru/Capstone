import express from 'express';
import { getAll } from '../controller/viewLogController.js';


const router = express.Router();

router.get('/getAll', getAll);

export default router;
