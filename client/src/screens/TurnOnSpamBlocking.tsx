import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {ModalSelector, Text} from '../components';
import {sendCall, setupCallForwarding} from '../utils';
import {ForwardingModalData} from '../utils/forwarding';
import {NavigationProps} from './types';

export default function TurnOnSpamBlocking(props: NavigationProps) {
  const [state, setState] = useState<ForwardingModalData>([]);

  useEffect(() => {
    (async () => setState(await setupCallForwarding()))();
  }, []);

  return (
    <View style={{marginHorizontal: 30, flex: 1, justifyContent: 'center'}}>
      <Text style={{fontFamily: 'IBMPlexSans'}} lg>
        To set up call blocking, all you need to do is dial a special phone
        number. {'\n'}
      </Text>
      <Text lg>
        Press this button, select your carrier, and we'll get you set up. {'\n'}
      </Text>
      <Text lg>Please try again if it doesn't work the first time. {'\n'}</Text>
      <Text>
        Running into issues and need help?{' '}
        <Text onPress={() => props.navigation.push('Help')} highlight>
          We can help.
        </Text>
      </Text>
      <ModalSelector
        data={state}
        buttonStyle={{marginTop: 30}}
        buttonText="Turn On Spam Blocking"
        onChange={carrier => sendCall(carrier.value)}
      />
    </View>
  );
}

TurnOnSpamBlocking.navigationOptions = {
  title: 'Spam Blocking',
};
