import express from 'express';
import reservePartController from '../controllers/reservePartController';

const router = express.Router();

router.get('/:id', reservePartController.get);

router.get('/', reservePartController.list);

router.post('/', reservePartController.add);

router.put('/:id', reservePartController.update);

router.delete('/:id', reservePartController.delete);

export default router;
