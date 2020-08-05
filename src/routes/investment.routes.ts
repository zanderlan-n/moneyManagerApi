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

export default router;
