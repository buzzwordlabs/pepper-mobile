import express from 'express';
import local from './local';
import passwordReset from './passwordreset';

const authRouter = express.Router();

authRouter.use('/local', local);
authRouter.use('/password-reset', passwordReset);

export default authRouter;
