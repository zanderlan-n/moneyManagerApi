import { Router } from 'express';
import investimentRouter from './investments.routes';

const rootRouter = Router();
rootRouter.use('/investments', investimentRouter);
export default rootRouter;
