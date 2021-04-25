import asyncHandler from 'express-async-handler';
import { getRepository } from 'typeorm';
import iap, { Config } from 'in-app-purchase';
import assert from 'assert';
import moment from 'moment';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  NODE_ENV,
  ANDROID_PACKAGE_NAME,
  APPLE_SHARED_SECRET,
  IS_PRODUCTION,
  TRELLO_TECHNICAL_ISSUE_LIST_ID
} from '../../config';
import { Subscriptions, Users } from '../../database/entities';
import {
  create,
  findOne,
  save,
  findById,
  repositories,
  find
} from '../../database/helpers';
import { sendEmail } from '../contact';
import { logger, trello } from '../../utils';

const iapTestMode = NODE_ENV !== 'production';

google.options({
  auth: new JWT(
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/androidpublisher']
  )
});

const androidGoogleApi = google.androidpublisher({ version: 'v3' });

// https://www.appypie.com/faqs/how-can-i-get-shared-secret-key-for-in-app-purchase
const iapConfig = {
  // If you want to exclude old transaction, set this to true. Default is false:
  appleExcludeOldTransactions: true,
  // this comes from iTunes Connect (You need this to valiate subscriptions):
  applePassword: APPLE_SHARED_SECRET,

  googleServiceAccount: {
    clientEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    privateKey: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!
  },

  /* Configurations all platforms */
  test: iapTestMode // For Apple and Google Play to force Sandbox validation only
  // verbose: true, // Output debug logs to stdout stream
};

iap.config(iapConfig);

async function updateSubscription({
  platform,
  environment,
  origTxId,
  userId,
  validationResponse,
  latestReceipt,
  startDate,
  endDate,
  productId,
  isCancelled
}: {
  platform: string;
  environment: string;
  origTxId: string;
  userId: string;
  validationResponse: string;
  latestReceipt: string;
  startDate: Date;
  endDate: Date;
  productId: string;
  isCancelled: boolean;
}) {
  const data: any = {
    platform,
    environment,
    userId,
    origTxId,
    validationResponse: JSON.stringify(validationResponse),
    latestReceipt,
    startDate,
    endDate,
    productId,
    isCancelled
  };
  try {
    await create(Subscriptions, data);
    const [userRepo, user]: [repositories, Users] = await findById(
      Users,
      userId
    );
    await sendEmail({
      subject: `New User Subscription`,
      html: `
        User ${user.firstName} ${user.lastName} just subscribed!<br></br>
        UserId: ${user.id}<br></br>
        Platform: ${platform}
      `
    });
  } catch (err) {
    const POSTGRES_DUP_ENTRY_ERROR_CODE = '23505';
    if (err.code !== POSTGRES_DUP_ENTRY_ERROR_CODE) throw err;
    const [subRepo, foundSub] = await findOne(Subscriptions, {
      userId
    });
    Object.keys(data).forEach(key => {
      foundSub[key] = data[key];
    });
    await save(subRepo, foundSub);
  }
}

async function getUserSubscription(userId: string) {
  const [
    subRepo,
    { startDate, endDate, productId, isCancelled, platform, latestReceipt }
  ]: [repositories, Subscriptions] = await findOne(Subscriptions, {
    userId
  });

  return {
    startDate,
    endDate,
    productId,
    isCancelled: !!isCancelled,
    type: 'iap',
    platform,
    latestReceipt
  };
}

async function processPurchase(platform: string, userId: string, receipt: any) {
  await iap.setup();
  const validationResponse: any = await iap.validate(receipt);

  // Sanity check
  assert(
    (platform === 'android' && validationResponse.service === 'google') ||
      (platform === 'ios' && validationResponse.service === 'apple')
  );

  const purchaseData = iap.getPurchaseData(validationResponse);
  if (!purchaseData) return new Error('Purchase Data Not Found');
  const firstPurchaseItem: any = purchaseData[0];

  const isCancelled = iap.isCanceled(firstPurchaseItem);
  const isExpired = iap.isExpired(firstPurchaseItem);
  const { productId } = firstPurchaseItem;
  const origTxId =
    platform === 'ios'
      ? firstPurchaseItem.originalTransactionId
      : firstPurchaseItem.transactionId;
  const latestReceipt =
    platform === 'ios'
      ? validationResponse.latest_receipt
      : JSON.stringify(receipt);
  const startDate =
    platform === 'ios'
      ? new Date(firstPurchaseItem.originalPurchaseDateMs)
      : new Date(parseInt(firstPurchaseItem.startTimeMillis, 10));
  const endDate =
    platform === 'ios'
      ? new Date(firstPurchaseItem.expiresDateMs)
      : new Date(parseInt(firstPurchaseItem.expiryTimeMillis, 10));

  let environment = '';
  // validationResponse contains sandbox: true/false for Apple and Amazon
  // Android we don't know if it was a sandbox account
  if (platform === 'ios') {
    environment = validationResponse.sandbox ? 'sandbox' : 'production';
  }

  await updateSubscription({
    userId,
    platform,
    environment,
    productId,
    origTxId,
    latestReceipt,
    validationResponse,
    startDate,
    endDate,
    isCancelled
  });

  // From https://developer.android.com/google/play/billing/billing_library_overview:
  // You must acknowledge all purchases within three days.
  // Failure to properly acknowledge purchases results in those purchases being refunded.
  if (platform === 'android' && validationResponse.acknowledgementState === 0) {
    await androidGoogleApi.purchases.subscriptions.acknowledge({
      packageName: ANDROID_PACKAGE_NAME,
      subscriptionId: productId,
      token: receipt.purchaseToken
    });
  }
  return !isExpired;
}

async function validateSubscription(userId: string) {
  try {
    const [subscriptionRepo, subscription]: [
      repositories,
      Subscriptions
    ] = await findOne(Subscriptions, {
      userId
    });
    if (subscription) {
      return processPurchase(
        subscription.platform,
        subscription.userId,
        subscription.platform === 'ios'
          ? subscription.latestReceipt
          : JSON.parse(subscription.latestReceipt)
      );
    }
    return false;
  } catch (err) {
    return false;
  }
}

interface SubData {
  userId: string;
  latestReceipt: string;
  platform: string;
}

async function validateMultipleSubscriptions(userIds: string[]) {
  try {
    const subs = await getRepository(Subscriptions).query(`
      SELECT platform, "userId", "latestReceipt"
      FROM subscriptions
      WHERE "userId" IN (${userIds})
    `);
    let sum = 0;
    if (subs.length > 0) {
      await Promise.all(
        subs.map(async (sub: SubData) => {
          const subscribed = await processPurchase(
            sub.platform,
            sub.userId,
            sub.platform === 'ios'
              ? sub.latestReceipt
              : JSON.parse(sub.latestReceipt)
          );
          subscribed && sum++;
        })
      );
      return sum;
    }
    return sum;
  } catch (err) {
    return err;
  }
}

async function validateAllActiveSubscriptions() {
  const [subRepo, subscriptions]: [repositories, Subscriptions[]] = await find(
    Subscriptions,
    {
      select: ['platform', 'userId', 'latestReceipt', 'startDate', 'endDate']
    }
  );
  const now = new Date();
  // check all subscriptions that expired within the past two days
  const filterSubs = subscriptions.filter(
    sub =>
      moment(sub.endDate)
        .add(2, 'd')
        .isAfter(now) &&
      moment(now)
        .add(2, 'd')
        .isAfter(sub.endDate)
  );
  return Promise.all(
    filterSubs.map(async ({ platform, userId, latestReceipt }) => {
      return processPurchase(
        platform,
        userId,
        platform === 'ios' ? latestReceipt : JSON.parse(latestReceipt)
      );
    })
  );
}

async function checkIfHasSubscription(subscription: any) {
  if (!subscription) return false;
  if (subscription.isCancelled) return false;
  const now = new Date();
  return (
    moment(subscription.startDate).isBefore(now) &&
    moment(subscription.endDate).isAfter(now)
  );
}

async function checkUserSubscription(userId: string) {
  if (!userId) return false;
  const subscription = await getUserSubscription(userId);
  return checkIfHasSubscription(subscription);
}

async function checkUserSubscriptionOnGracePeriod(
  userId: string | null | undefined,
  notSubscribedGracePeriod: Date | null | undefined
) {
  if (!userId) return [false, false];
  try {
    const subscription = await getUserSubscription(userId);
    // just checking if subscription exists - it's faster than checking the whole object
    if (!subscription.endDate) return [false, false];
    const now = new Date();
    const isSubscribed =
      moment(subscription.startDate).isBefore(now) &&
      moment(subscription.endDate).isAfter(now);
    let gracePeriodOld;
    let isOnGracePeriod;
    // if there is a grace period set for the user already
    if (notSubscribedGracePeriod) {
      // make sure it's not a grace period from a previous month
      if (moment(subscription.endDate).isAfter(notSubscribedGracePeriod)) {
        gracePeriodOld = true;
        isOnGracePeriod = true;
      } else {
        // check whether they're on the grace period
        gracePeriodOld = false;
        isOnGracePeriod = notSubscribedGracePeriod
          ? moment(subscription.startDate).isBefore(now) &&
            moment(notSubscribedGracePeriod)
              .add(1, 'd')
              .isAfter(now)
          : false;
      }
    } else {
      // if no grace period, start one
      gracePeriodOld = false;
      isOnGracePeriod = true;
    }
    // check if subscription expired within past two days - we have a cron job that updates nightly
    const twoDaySubExp =
      moment(subscription.endDate)
        .add(2, 'd')
        .isAfter(now) && moment(now).isAfter(subscription.endDate);

    // if expired, validate subscription instead of only checking
    if (!isSubscribed && twoDaySubExp) {
      await processPurchase(
        subscription.platform,
        userId,
        subscription.platform === 'ios'
          ? subscription.latestReceipt
          : JSON.parse(subscription.latestReceipt)
      );
      const updatedSub = await getUserSubscription(userId);
      const isSubscribedNew =
        moment(updatedSub.startDate).isBefore(now) &&
        moment(updatedSub.endDate).isAfter(now);
      if (isSubscribedNew) {
        const [userRepo, user] = await findById(Users, userId);
        user.notSubscribedGracePeriod = null;
        await save(userRepo, user);
      }
      // if they aren't subscribed and there isn't a current grace period, start one
      if (!isSubscribedNew && (!notSubscribedGracePeriod || gracePeriodOld)) {
        const [userRepo, user] = await findById(Users, userId);
        user.notSubscribedGracePeriod = new Date();
        await save(userRepo, user);
      }
      return [isSubscribedNew, isOnGracePeriod];
    }
    return [isSubscribed, isOnGracePeriod];
  } catch (err) {
    logger.error(err);
    await createTrelloErrorCard(err);
    return [false, false];
  }
}

// When user tries to subscribe
const saveReceipt = asyncHandler(async (req, res, next) => {
  const { id } = req.session;
  const { platform, purchase } = req.body;

  assert(['ios', 'android'].includes(platform));

  const receipt =
    platform === 'ios'
      ? purchase.transactionReceipt
      : {
          packageName: ANDROID_PACKAGE_NAME,
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          subscription: true
        };

  await processPurchase(platform, id!, receipt);
  const [userRepo, user] = await findById(Users, id!);
  user.notSubscribedGracePeriod = null;
  await save(userRepo, user);
  return res.sendStatus(200);
});

const checkSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.session;
  const subscription = await getUserSubscription(id!);
  const isSubscribed = await checkIfHasSubscription(subscription);
  return res.status(200).json({ subscribed: isSubscribed });
});

const createTrelloErrorCard = async (err: Error) => {
  if (IS_PRODUCTION) {
    return trello.card.create({
      name: 'Express Server Subscription Error Handler',
      desc: `${err.stack || err.message || err}`,
      pos: 'top',
      idList: TRELLO_TECHNICAL_ISSUE_LIST_ID
    });
  }
};

export {
  saveReceipt,
  checkSubscription,
  validateSubscription,
  validateMultipleSubscriptions,
  validateAllActiveSubscriptions,
  checkUserSubscription,
  checkUserSubscriptionOnGracePeriod
};
