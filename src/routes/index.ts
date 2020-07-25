import { Router } from 'express';
import investimentRouter from './investment.routes';
import reservePartRouter from './reservePart.routes';
import accountRouter from './account.routes';
import reserveRouter from './reserve.routes';

const rootRouter = Router();
rootRouter.use('/investments', investimentRouter);
rootRouter.use('/reserveparts', reservePartRouter);
rootRouter.use('/accounts', accountRouter);
rootRouter.use('/reserves', reserveRouter);
export default rootRouter;
