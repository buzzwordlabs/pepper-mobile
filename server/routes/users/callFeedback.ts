import express from 'express';
import { user } from '../../controllers';

const callFeedback = express.Router();

callFeedback.post('/', user.callFeedback.addFeedback);

export default callFeedback;
