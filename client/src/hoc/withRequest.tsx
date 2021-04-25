import hoistNonReactStatics from 'hoist-non-react-statics';
import React, {useContext} from 'react';
import {NavigationContext} from 'react-navigation';

import {Text} from '../components';
import {notify, request as requestMethod} from '../utils';
import {PepperAxiosResponse, RequestParams} from '../utils/request';

const withRequest = (RC: any) => {
  const MutatedClass = () => {
    const navigation = useContext(NavigationContext);
    const request = async ({
      url,
      method,
      body,
      optionalHeaders,
    }: RequestParams) => {
      const response = await requestMethod({
        url,
        method,
        body,
        optionalHeaders,
      });
      if (response.ok) return response;
      else {
        if (response.status === 401) {
          navigation.navigate('Intro');
          notify(
            <Text semibold error>
              Please login.
            </Text>,
          );
        }
        return response;
      }
    };
    return <RC request={request} navigation={navigation} />;
  };
  hoistNonReactStatics(MutatedClass, RC);
  return MutatedClass;
};

export interface WithRequest {
  request: ({
    url,
    method,
    body,
    optionalHeaders,
  }: RequestParams) => Promise<PepperAxiosResponse>;
}

export {withRequest};
