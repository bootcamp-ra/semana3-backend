import express from 'express';
import * as participantController from '../controllers/participants.controller.js';

const router = express.Router();

router.post('/participants', participantController.create);
router.get('/participants', participantController.list);
router.post('/status', participantController.status);

export default router;
