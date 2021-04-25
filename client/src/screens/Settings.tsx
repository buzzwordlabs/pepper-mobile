import React, {useContext, useEffect, useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  ViewStyle,
  Linking,
} from 'react-native';
import {getVersion} from 'react-native-device-info';

import {Text, TouchableOpacity} from '../components';
import {tintColor} from '../constants';
import {GlobalContext} from '../global/GlobalContext';
import {WithRequest, withRequest} from '../hoc';
import {
  readCache,
  redirectPrivacyPolicy,
  redirectTOS,
  deleteCacheAllExcept,
  bugsnag,
} from '../utils';
import {NavigationProps} from './types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

interface Props extends WithRequest, NavigationProps {}

const Settings = (props: Props) => {
  const global = useContext(GlobalContext);
  const [firstName, setFirstName] = useState('');
  const [robocallPN, setRobocallPN] = useState(false);

  const toggleNotification = async (toggleState: boolean) => {
    const response = await props.request({
      url: '/user/settings/notifications',
      method: 'PUT',
      body: {robocallPN: toggleState},
    });
    if (response.ok) setRobocallPN(toggleState);
  };

  useEffect(() => {
    (async () => {
      setFirstName(await readCache('firstName'));
      setRobocallPN(global.state.settings.robocallPN);
    })();
  }, []);
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{paddingVertical: 20, paddingHorizontal: 30}}>
        <Text xl semibold>
          {firstName ? `Hello ${firstName}` : 'Hey there'}! 👋
        </Text>
        <Section>
          <Label>Call Blocking</Label>
          <TextButton
            onPress={() => props.navigation.push('TurnOnSpamBlocking')}>
            Turn on spam call blocking
          </TextButton>
          <TextButton
            onPress={() => props.navigation.push('TurnOffSpamBlocking')}>
            Turn off spam call blocking
          </TextButton>
        </Section>
        <Section>
          <Label>Voicemail</Label>
          {!!global.state.settings.voicemailGreeting && (
            <TextButton
              onPress={() =>
                Linking.openURL(global.state.settings.voicemailGreeting)
              }>
              Play current voicemail greeting
            </TextButton>
          )}
          {!!global.state.settings.voicemailGreeting ? (
            <TextButton onPress={() => props.navigation.push('RecordGreeting')}>
              Change custom voicemail greeting
            </TextButton>
          ) : (
            <TextButton onPress={() => props.navigation.push('RecordGreeting')}>
              Create custom voicemail greeting
            </TextButton>
          )}
        </Section>
        <Section>
          <Label>Subscription</Label>
          <TextButton
            onPress={() => props.navigation.push('ManageSubscription')}>
            Manage subscription
          </TextButton>
        </Section>
        {
          <Section>
            <Label>Notifications</Label>
            <View
              style={{
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: '#D8D8D8',
                height: 50,
                justifyContent: 'center',
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text lg>Blocked Robocalls</Text>
                {Platform.select({
                  android: (
                    <Switch
                      trackColor={{true: '#83b8f7', false: ''}}
                      thumbColor={robocallPN ? tintColor : 'white'}
                      onValueChange={notification =>
                        toggleNotification(notification)
                      }
                      value={robocallPN}
                    />
                  ),
                  ios: (
                    <Switch
                      trackColor={{true: tintColor, false: ''}}
                      onValueChange={notification =>
                        toggleNotification(notification)
                      }
                      value={robocallPN}
                    />
                  ),
                })}
              </View>
            </View>
          </Section>
        }
        <Section>
          <Label>Support</Label>
          <TextButton onPress={() => props.navigation.push('FAQ')}>
            FAQs
          </TextButton>
          <TextButton onPress={() => props.navigation.push('Help')}>
            Get help
          </TextButton>
          <TextButton onPress={() => props.navigation.push('Feedback')}>
            Give us feedback
          </TextButton>
        </Section>
        <Section>
          <Label>Legal</Label>
          <TextButton onPress={redirectTOS}>Terms of service</TextButton>
          <TextButton onPress={redirectPrivacyPolicy}>
            Privacy policy
          </TextButton>
        </Section>
        <Section>
          <TextButton
            onPress={async () => {
              await deleteCacheAllExcept(['tooltipData']);
              global.resetState();
              props.navigation.navigate('Auth');
              bugsnag.clearUser();
            }}
            highlight>
            Log out
          </TextButton>
        </Section>
        <Section>
          <Text center xs>
            Buzzword Labs, Inc
          </Text>
          <Text center xs>
            Version {getVersion()}
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
};

interface LabelProps {
  children: React.ReactChild;
}

const Label: React.FC<LabelProps> = props => (
  <Text sm semibold highlight>
    {props.children}
  </Text>
);
interface TextButtonProps {
  onPress: () => void;
  highlight?: boolean;
  children: React.ReactChildren | string;
}

const TextButton: React.FC<TextButtonProps> = ({
  onPress,
  children,
  highlight = false,
}) => {
  return (
    <TouchableOpacity
      style={
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: '#D8D8D8',
          height: 50,
          justifyContent: 'center',
        } as ViewStyle
      }
      onPress={onPress}>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          {
            fontFamily: 'IBMPlexSans',
          },
        ]}
        highlight={highlight}
        lg>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const Section = (props: any) => (
  <View style={{marginTop: 30}}>{props.children}</View>
);

Settings.navigationOptions = {
  title: 'Settings',
};

export default withRequest(Settings);
