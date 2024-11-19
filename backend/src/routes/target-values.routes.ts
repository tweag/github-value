import { Router } from 'express';
import TargetValuesController from '../controllers/target-values.controller.js';

const router = Router();

router.get('/', TargetValuesController.getTargetValues);
router.put('/', TargetValuesController.updateTargetValues);

export default router;
