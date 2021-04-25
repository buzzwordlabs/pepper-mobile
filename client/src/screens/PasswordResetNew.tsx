import React, {useState} from 'react';
import {View} from 'react-native';

import {Button, PasswordField, Text} from '../components';
import {notify, request} from '../utils';
import {NavigationProps} from './types';

const initialState = {
  password: '',
  isLoading: false,
};

export default function PasswordResetNew(props: NavigationProps) {
  const [state, setState] = useState(initialState);
  const token = props.navigation.getParam('token');
  return (
    <View style={{marginHorizontal: 30, justifyContent: 'center', flex: 1}}>
      <PasswordField
        onChangeText={(password: string) => setState({...state, password})}
        value={state.password}
        placeholder="New Password (8+ Characters)"
      />
      <Text linebreak>
        The length of your password must be greater than 8 characters but less
        than 32 characters.
      </Text>
      <Button
        loading={state.isLoading}
        title="Submit Password"
        onPress={async () => {
          const {password} = state;
          if (password.length < 8 || password.length > 32) {
            return notify(
              <Text error semibold>
                Your password is not greater than 8 characters but less than 32
                characters.
              </Text>,
            );
          }
          setState({...state, isLoading: true});
          const response = await request({
            url: '/auth/password-reset/reset',
            method: 'POST',
            body: {token, password},
          });
          setState({...state, isLoading: false});
          if (response.ok) {
            notify(
              <Text success semibold>
                Your password has been reset.
              </Text>,
            );
            return props.navigation.navigate('Login');
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

PasswordResetNew.navigationOptions = {
  title: 'Password Reset',
};
