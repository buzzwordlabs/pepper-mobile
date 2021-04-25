import express from 'express';
import { faq } from '../controllers';

const faqRouter = express.Router();

faqRouter.get('/all', faq.getFaqs);

export default faqRouter;
