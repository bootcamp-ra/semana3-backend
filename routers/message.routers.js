import express from 'express';
import authorizationMiddleware from '../middlewares/authorization.middleware.js';
import * as messagesController from '../controllers/messages.controllers.js';

const router = express.Router();

//anexo o middleware nessas rotas
router.use(authorizationMiddleware); //Express injeta 3 params: req, res, next

//anexando essas rotas na rota da aplicação
router.post('/messages', messagesController.create);
router.get('/messages', messagesController.list);

export default router;
