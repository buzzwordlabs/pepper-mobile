import React, {useState} from 'react';
import {View} from 'react-native';
import {NavigationStackProp} from 'react-navigation-stack';

import {Button, Text, TextInput} from '../components';
import {topOffset} from '../constants';
import {notify, request} from '../utils';

interface Props {
  navigation: NavigationStackProp;
}

export default function PasswordReset(props: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View
      style={{
        marginHorizontal: 30,
        justifyContent: 'center',
        flex: 1,
        marginBottom: topOffset,
      }}>
      <TextInput
        onChangeText={changedEmail => setEmail(changedEmail)}
        value={email}
        placeholder="Email address"
        keyboardType="email-address"
      />
      <Text linebreak>
        We'll email you a 6 digit code to reset your password.
      </Text>
      <Button
        loading={isLoading}
        title="Send"
        onPress={async () => {
          if (!email || !email.includes('@')) {
            return notify(
              <Text semibold error>
                This is not a valid email.
              </Text>,
            );
          }
          setIsLoading(true);
          const response = await request({
            url: '/auth/password-reset/',
            method: 'POST',
            body: {email},
          });
          setIsLoading(false);
          if (response.ok) {
            return props.navigation.push('PasswordResetCode', {email});
          }

          if (response.status === 401) {
            return (
              <Text error semibold>
                No account associated with that email.
              </Text>
            );
          }
          return (
            <Text error semibold>
              An error occurred.
            </Text>
          );
        }}
      />
    </View>
  );
}

PasswordReset.navigationOptions = {
  title: 'Password Reset',
};
