import React from 'react';
import {StatusBar, View} from 'react-native';
import Toast from 'react-native-root-toast';
import codePush from 'react-native-code-push';

import IncallUI from './components/InCallUI';
import {GlobalContext, GlobalContextProvider} from './global/GlobalContext';
import AppNavigator from './navigation/AppNavigator';
import {toastOptions} from './utils';

function Root() {
  return (
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  );
}

class App extends React.Component {
  static contextType = GlobalContext;

  render() {
    const {
      persistentToastText,
      persistentToastVisible,
      permissionsGranted,
      isLoggedIn,
      onboardingStep,
    } = this.context.state;

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Toast visible={persistentToastVisible} {...toastOptions}>
          {persistentToastText}
        </Toast>
        <AppNavigator screenProps={this.context} />
        {onboardingStep === 0 && isLoggedIn && permissionsGranted && (
          <IncallUI />
        )}
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }
}

export default codePush(undefined)(Root);
