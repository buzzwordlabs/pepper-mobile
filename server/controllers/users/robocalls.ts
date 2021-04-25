import asyncHandler from 'express-async-handler';
import { Calls } from '../../database/entities';
import { find, count, repositories } from '../../database/helpers';
import { UNKNOWN_NUMBERS } from '../../config';

const getRecentRobocalls = asyncHandler(async (req, res, next) => {
  const [callRepo, recentRobocalls]: [repositories, [Calls]] = await find(
    Calls,
    {
      select: ['callSid', 'createdAt', 'caller'],
      where: {
        userId: req.session.id,
        failedPrompt: true
      },
      order: {
        createdAt: 'DESC'
      },
      take: 30
    }
  );
  const countRobocalls = await count(Calls, {
    userId: req.session.id,
    failedPrompt: true
  });
  recentRobocalls.map(
    recentCall =>
      (recentCall.caller =
        UNKNOWN_NUMBERS[recentCall.caller] || recentCall.caller)
  );
  return res.status(200).json({ recentRobocalls, countRobocalls });
});

export { getRecentRobocalls };
