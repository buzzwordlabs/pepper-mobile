import express from 'express';
import {
  monthlyAmounts,
  amountGrowth,
  mimo,
  balance
} from '../../controllers/retool';

const mercuryRouter = express.Router();

mercuryRouter.get('/monthlyAmounts', monthlyAmounts);

mercuryRouter.get('/amountGrowth', amountGrowth);

mercuryRouter.get('/mimo', mimo);

mercuryRouter.get('/balance', balance);

export default mercuryRouter;
