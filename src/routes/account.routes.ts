import express from 'express';
import accountController from '../controllers/accountController';

const router = express.Router();

router.get('/:id', accountController.get);

router.get('/', accountController.list);

router.post('/', accountController.add);

router.put('/:id', accountController.update);

router.delete('/:id', accountController.delete);

router.post('/addMoney/:id', accountController.addMoney);

router.post('/removeMoney/:id', accountController.removeMoney);

export default router;
