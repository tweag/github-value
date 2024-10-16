import { Router } from 'express';
import { surveyController } from '../controllers/index';

const router = Router();

router.get('/', (req, res) => res.send('This is the API'));
// Define your routes here
router.get('/get-survey', surveyController.getAllSurveys);
router.post('/create-survey', surveyController.createSurvey);

export default router;