import express from 'express';

import { user } from '../../controllers';

const deviceRouter = express.Router();

deviceRouter.post('/token', user.device.deviceToken);

deviceRouter.post('/sync-user-metadata', user.device.syncUserMetadata);

export default deviceRouter;
