import express from 'express';
import investmentsController from '../controllers/investmentController';

const router = express.Router();

router.get('/:id', investmentsController.get);

router.get('/', investmentsController.list);

router.post('/', investmentsController.add);

router.put('/:id', investmentsController.update);

router.delete('/:id', investmentsController.delete);

router.post('/addmoney', investmentsController.addMoney);

router.post('/withdrawMoney', investmentsController.withdrawMoney);

router.post('/updatecurrentvalue', investmentsController.updateCurrentValue);

router.post('/profit/:id', investmentsController.getProfit);

export default router;
