import express from 'express';

import { auth } from '../../controllers';

const passwordResetRouter = express.Router();

passwordResetRouter.post('/', auth.passwordReset.passwordResetEmail);

passwordResetRouter.post('/token', auth.passwordReset.passwordResetToken);

passwordResetRouter.post('/reset', auth.passwordReset.passwordReset);

export default passwordResetRouter;
