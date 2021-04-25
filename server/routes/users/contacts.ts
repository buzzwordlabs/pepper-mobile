import express from 'express';
import { user } from '../../controllers';

const contactsRouter = express.Router();

contactsRouter.post('/', user.contacts.addContacts);

contactsRouter.post('/update', user.contacts.updateContacts);

export default contactsRouter;
