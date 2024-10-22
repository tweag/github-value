import { Router } from 'express';
import SurveyController from '../controllers/survery.controller';

const router = Router();

router.get('/', (req, res) => res.send('🎉 Welcome to the Survey API! 🚀✨'));

router.get('/get-survey', SurveyController.getAllSurveys);
router.post('/create-survey', SurveyController.createSurvey);
router.get('/get-survey/:id', SurveyController.getSurveyById);
router.put('/update-survey/:id', SurveyController.updateSurvey);
router.delete('/delete-survey/:id', SurveyController.deleteSurvey);

export const webUrl = process.env.WEB_URL || 'http://localhost';

export default router;