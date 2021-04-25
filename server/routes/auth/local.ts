import express from 'express';
import { auth } from '../../controllers';

const localAuthRouter = express.Router();

localAuthRouter.post('/signup', auth.local.signup);

localAuthRouter.post('/login', auth.local.login);

export default localAuthRouter;
