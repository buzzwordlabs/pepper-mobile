import React from 'react';
import {View} from 'react-native';
import {Text, ModalSelector} from '../components';
import {sendCall, turnOffCallForwarding} from '../utils';
import {NavigationProps} from './types';

export default function TurnOffCallBlocking(props: NavigationProps) {
  const data = turnOffCallForwarding();
  return (
    <View style={{marginHorizontal: 30, flex: 1, justifyContent: 'center'}}>
      <Text lg>
        To turn off call blocking, all you need to do is dial a special phone
        number. {'\n'}
      </Text>
      <Text lg>
        Press this button, select your carrier, and we'll turn Pepper off for
        you.{'\n'}
      </Text>
      <Text>
        Running into issues and need help?{' '}
        <Text onPress={() => props.navigation.push('Help')} highlight>
          We can help.
        </Text>
      </Text>
      <ModalSelector
        data={data}
        buttonStyle={{marginTop: 30}}
        buttonText="Turn Off Blocking"
        onChange={carrier => sendCall(carrier.value)}
      />
    </View>
  );
}

TurnOffCallBlocking.navigationOptions = {
  title: 'Spam Blocking',
};
