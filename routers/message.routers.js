import express from 'express';
import * as messagesController from '../controllers/messages.controllers.js';

const router = express.Router();

//anexando essas rotas na rota da aplicação
router.post('/messages', messagesController.create);
router.get('/messages', messagesController.list);

export default router;
