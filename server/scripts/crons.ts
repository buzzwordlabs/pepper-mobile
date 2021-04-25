import { CronJob } from 'cron';
import moment from 'moment';
import { getConnection } from 'typeorm';

import { logger, sendEmail, numberTurnOffForwarding, trello } from '../utils';
import { iap } from '../controllers/users';
import { TRELLO_TECHNICAL_ISSUE_LIST_ID, IS_PRODUCTION } from '../config';

const validateAllSubscriptionsCron = async () => {
  const job = new CronJob('0 7 * * *', async () => {
    try {
      logger.info('Validating subscriptions...');
      await iap.validateAllActiveSubscriptions();
      logger.info('Done validating subscriptions.');
    } catch (err) {
      logger.error(err);
      if (IS_PRODUCTION) {
        await trello.card.create({
          name: 'Pepper Subscriptions Cron Error Handler',
          desc: `${err.stack || err.message || err}`,
          pos: 'top',
          idList: TRELLO_TECHNICAL_ISSUE_LIST_ID
        });
      }
    }
  });
  job.start();
};

interface ExpiringSubUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  platform: 'ios' | 'android';
  appVersion: string;
  carrier: string;
  endDate: Date;
  countBlockedRobocalls: number;
}

const subscriptionExpiringSoonCron = async () => {
  const job = new CronJob('0 16 * * *', async () => {
    try {
      logger.info('Running subscriptionExpiringSoonCron...');
      const manager = getConnection().manager;
      const users: ExpiringSubUser[] = await manager.query(`
        SELECT
          users."id", users."firstName", users."lastName", users."email",
          users."platform", users."appVersion", users."carrier",
          subscriptions."endDate", COUNT(calls."failedPrompt" = true) as "countBlockedRobocalls"
        FROM users
        INNER JOIN subscriptions ON users."id" = subscriptions."userId"
        INNER JOIN calls ON users."id" = calls."userId"
        -- After this date
        WHERE subscriptions."isCancelled" = false
        AND subscriptions."environment" <> 'sandbox'
        AND subscriptions."endDate"::date - current_date <= 1
        AND subscriptions."endDate" > current_date
        AND DATE_PART('day', subscriptions."endDate" - subscriptions."startDate") <= 8
        GROUP BY users."id", subscriptions."endDate"
      `);
      await Promise.all(
        users.map(async (user: ExpiringSubUser) => {
          const turnOffForwarding = numberTurnOffForwarding(user.carrier);
          const turnOffForwardingNum = turnOffForwarding
            ? turnOffForwarding
            : `the number ${user.carrier} requires`;
          const turnOffForwardingText = `<a href="tel:${encodeURIComponent(
            turnOffForwardingNum
          )}">${turnOffForwardingNum}</a>`;
          await sendEmail({
            subject: 'Trial Ending Soon',
            to: user.email,
            html: `
            Hi ${user.firstName},<br/><br/>
            Just wanted to let you know that your trial is about to expire soon
            on ${moment(user.endDate).format('LL')}. Thank you for giving
            us a try!<br/><br/>

            In case you're curious, we've blocked ${user.countBlockedRobocalls}
            robocalls for you since you started using Pepper and we'd love to
            continue doing that for you.<br/><br/>

            We're just two developers trying to find a solution to the robocall
            problem and would really love your feedback on Pepper, positive
            or negative.<br/>

            <strong><em><h2>Important:</h2></em></strong>

            <strong>
            As a reminder, if you plan to stop using Pepper, be sure to turn off
            call forwarding in the Pepper app, or dial ${turnOffForwardingText} so ${
              user.carrier
            } stops sending us calls.
            Otherwise, you will stop receive phone calls altogether.<br/><br/>
            </strong>

            Let us know if you have questions. Thanks so much!<br/><br/>

            - Pepper Team
          `
          });
        })
      );
      logger.info('Done running subscriptionExpiringSoonCron.');
    } catch (err) {
      logger.error(err);
      if (IS_PRODUCTION) {
        await trello.card.create({
          name: 'Pepper Email Reminder Cron Error Handler',
          desc: `${err.stack || err.message || err}`,
          pos: 'top',
          idList: TRELLO_TECHNICAL_ISSUE_LIST_ID
        });
      }
    }
  });
  job.start();
};

export { validateAllSubscriptionsCron, subscriptionExpiringSoonCron };
