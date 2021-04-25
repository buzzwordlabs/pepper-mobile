import asyncHandler from 'express-async-handler';
import { Voicemails } from '../../database/entities';
import { save, find, findById, repositories } from '../../database/helpers';
import { UNKNOWN_NUMBERS } from '../../config';

const getVoicemails = asyncHandler(async (req, res, next) => {
  const [voicemailRepo, voicemails]: [repositories, Voicemails[]] = await find(
    Voicemails,
    {
      select: ['id', 'url', 'caller', 'createdAt', 'duration'],
      where: { userId: req.session.id!, isDeleted: false },
      order: {
        createdAt: 'DESC'
      }
    }
  );
  voicemails.map(
    voicemail =>
      (voicemail.caller = UNKNOWN_NUMBERS[voicemail.caller] || voicemail.caller)
  );
  return res.status(200).json({ voicemails });
});

const deleteVoicemail = asyncHandler(async (req, res, next) => {
  if (!req.body.deletedVoicemail) return res.sendStatus(400);
  const [voicemailRepo, voicemail]: [repositories, Voicemails] = await findById(
    Voicemails,
    req.body.deletedVoicemail
  );
  voicemail.isDeleted = true;
  await save(voicemailRepo, voicemail);
  return res.sendStatus(200);
});

export { getVoicemails, deleteVoicemail };
