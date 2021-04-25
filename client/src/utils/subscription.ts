import {Platform} from 'react-native';

import {request} from './request';

const checkSubscriptionStatus = async (): Promise<boolean> => {
  const {
    data: {subscribed},
  } = await request({
    url: `/user/iap/subscription`,
    method: 'GET',
  });
  return subscribed;
};

export {checkSubscriptionStatus};
