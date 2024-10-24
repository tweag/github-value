import { Router } from 'express';
import SurveyController from '../controllers/survery.controller';
import metricsController from '../controllers/metrics.controller';

const router = Router();

router.get('/', (req, res) => res.send('🎉 Welcome to the Survey API! 🚀✨'));

router.get('/survey', SurveyController.getAllSurveys);
router.post('/survey', SurveyController.createSurvey);
router.get('/survey/:id', SurveyController.getSurveyById);
router.put('/survey/:id', SurveyController.updateSurvey);
router.delete('/survey/:id', SurveyController.deleteSurvey);

router.get('/metrics', metricsController.getAllMetrics);
router.get('/metrics/:day', metricsController.getMetricsByDay);

export default router;