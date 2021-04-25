import express from 'express';
import { user } from '../../controllers';

const robocallsRouter = express.Router();

robocallsRouter.get('/', user.robocalls.getRecentRobocalls);

export default robocallsRouter;
