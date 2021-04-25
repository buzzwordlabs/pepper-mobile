import express from 'express';
import { web } from '../controllers';

const webRouter = express.Router();

webRouter.get('/', web.refVisitor);

export default webRouter;
