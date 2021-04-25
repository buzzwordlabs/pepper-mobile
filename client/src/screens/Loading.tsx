import React, {useEffect} from 'react';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import {NavigationStackProp} from 'react-navigation-stack';

import {readCacheMulti, writeCache} from '../utils';

interface Props {
  navigation: NavigationStackProp;
}

export default function Loading(props: Props): any {
  useEffect((): void => {
    (async (): Promise<void> => {
      const {
        onboardingStep,
        authToken,
      }: {
        onboardingStep: number;
        authToken: string | undefined;
      } = await readCacheMulti(['onboardingStep', 'authToken']);
      if (authToken) {
        if (onboardingStep === 0) props.navigation.navigate('App');
        else if (onboardingStep > 0) props.navigation.navigate('Onboarding');
        else {
          // Onboarding step may have been lost
          // Have user login again just to be safe
          props.navigation.navigate('Auth');
        }
      } else props.navigation.navigate('Auth');
    })();
  }, [props.navigation]);

  return (
    <View>
      <StatusBar barStyle="dark-content" />
      <ActivityIndicator size="small" animating />
    </View>
  );
}
