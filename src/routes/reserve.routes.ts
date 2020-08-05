import express from 'express';
import reserveController from '../controllers/reserveController';

const router = express.Router();

router.get('/:id', reserveController.get);

router.get('/', reserveController.list);

router.post('/', reserveController.add);

router.put('/:id', reserveController.update);

router.delete('/:id', reserveController.delete);

router.post('/addmoney', reserveController.addMoney);

router.post('/withdrawMoney', reserveController.withdrawMoney);

router.post('/updategoal', reserveController.updateGoal);

router.post('/transferMoney', reserveController.transferMoney);

export default router;
