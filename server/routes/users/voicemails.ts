import express from 'express';
import { user } from '../../controllers';

const voicemailRouter = express.Router();

voicemailRouter.get('/', user.voicemails.getVoicemails);

voicemailRouter.put('/delete-one', user.voicemails.deleteVoicemail);

export default voicemailRouter;
