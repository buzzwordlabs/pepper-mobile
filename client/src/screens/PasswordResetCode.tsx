import React, {useState} from 'react';
import {View} from 'react-native';

import {Button, Text, TextInput} from '../components';
import {notify, request} from '../utils';
import {NavigationProps} from './types';

export default function PasswordResetCode(props: NavigationProps) {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View style={{marginHorizontal: 30, justifyContent: 'center', flex: 1}}>
      <TextInput
        onChangeText={newToken => setToken(newToken)}
        value={token}
        placeholder="Submit Code"
        keyboardType="numeric"
        maxLength={6}
      />
      <Text linebreak>
        You should receive an email with the 6 digit reset code shortly.
      </Text>
      <Button
        loading={isLoading}
        title="Submit Code"
        onPress={async () => {
          if (token.length !== 6) {
            return notify(
              <Text semibold error>
                Your code must be exactly 6 digits.
              </Text>,
            );
          }
          setIsLoading(true);
          const response = await request({
            url: '/auth/password-reset/token',
            method: 'POST',
            body: {
              token,
            },
          });
          setIsLoading(false);
          if (response.ok) {
            return props.navigation.push('PasswordResetNew', {token});
          }
          if (response.status === 401) {
            return notify(
              <Text error semibold>
                Your code was either incorrect or expired.
              </Text>,
            );
          }
          return notify(
            <Text error semibold>
              An error occurred.
            </Text>,
          );
        }}
      />
    </View>
  );
}

PasswordResetCode.navigationOptions = {
  title: 'Password Reset',
};
