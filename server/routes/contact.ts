import express from 'express';

import { contact } from '../controllers';

const contactRouter = express.Router();

contactRouter.post('/', contact.sendContactEmailMobile);

contactRouter.post('/form', contact.sendContactEmailWeb);

contactRouter.post('/recaptcha', contact.verifyRecaptcha);

export default contactRouter;
