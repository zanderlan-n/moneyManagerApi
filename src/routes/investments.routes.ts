import express from 'express';
import investmentsController from '../controllers/investmentsController';

const router = express.Router();

router.get('/:id', investmentsController.get);

router.get('/', investmentsController.list);

router.post('/', investmentsController.add);

router.put('/:id', investmentsController.update);

router.delete('/:id', investmentsController.delete);

export default router;
