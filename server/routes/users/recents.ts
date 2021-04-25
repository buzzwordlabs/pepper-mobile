import express from 'express';
import { user } from '../../controllers';

const recentsRouter = express.Router();

recentsRouter.get('/', user.recents.getRecentCalls);

recentsRouter.post('/report-problem', user.recents.reportProblem);

export default recentsRouter;
