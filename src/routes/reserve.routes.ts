import express from 'express';
import reserveController from '../controllers/reserveController';

const router = express.Router();

router.get('/:id', reserveController.get);

router.get('/', reserveController.list);

router.post('/', reserveController.add);

router.put('/:id', reserveController.update);

router.delete('/:id', reserveController.delete);

router.post('/addmoney/', reserveController.addMoney);

router.post('/removemoney/', reserveController.removeMoney);

router.post('/updategoal', reserveController.updateGoal);

export default router;
