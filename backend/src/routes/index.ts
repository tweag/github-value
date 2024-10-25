import { Router, Request, Response } from 'express';
import SurveyController from '../controllers/survery.controller';
import metricsController from '../controllers/metrics.controller';
import settingsController from '../controllers/settings.controller';
import setupController from '../controllers/setup.controller';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

router.get('/survey', SurveyController.getAllSurveys);
router.post('/survey', SurveyController.createSurvey);
router.get('/survey/:id', SurveyController.getSurveyById);
router.put('/survey/:id', SurveyController.updateSurvey);
router.delete('/survey/:id', SurveyController.deleteSurvey);

router.get('/metrics', metricsController.getAllMetrics);
router.get('/metrics/:day', metricsController.getMetricsByDay);

router.get('/settings', settingsController.getAllSettings);
router.post('/settings', settingsController.createSettings);
router.get('/settings/:name', settingsController.getSettingsByName);
router.put('/settings/:name', settingsController.updateSettings);
router.delete('/settings/:name', settingsController.deleteSettings);

router.get('/setup/redirect', setupController.setup);
router.get('/setup/install', setupController.install);
router.get('/setup/status', setupController.isSetup);
router.get('/setup/manifest', setupController.getManifest);

router.get

export default router;