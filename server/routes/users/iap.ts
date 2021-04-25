import express from 'express';
import { user } from '../../controllers';

const iapRouter = express.Router();

iapRouter.post('/save-receipt', user.iap.saveReceipt);

iapRouter.get('/subscription', user.iap.checkSubscription);

export default iapRouter;
