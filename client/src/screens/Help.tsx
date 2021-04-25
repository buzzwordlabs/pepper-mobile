import React from 'react';
import {
  EmitterSubscription,
  Keyboard,
  ScrollView,
  View,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NavigationStackProp} from 'react-navigation-stack';

import {Button, Text, TextInput} from '../components';
import {notify, request, popup, getUserMetadata} from '../utils';
import {GlobalContext} from '../global/GlobalContext';

interface Props {
  navigation: NavigationStackProp;
}

interface State {
  message: string;
  inputBoxHeight: number;
  isLoading: boolean;
}

export default class Help extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Help',
  };

  static contextType = GlobalContext;

  state = {message: '', inputBoxHeight: 275, isLoading: false};

  submitForm = async ({message, reason}: {message: string; reason: string}) => {
    if (message.trim().length < 2) {
      return notify(
        <Text semibold error>
          Your message cannot be empty.
        </Text>,
      );
    }
    this.setState({isLoading: true});
    const response = await request({
      url: '/contact',
      method: 'POST',
      body: {
        message,
        reason,
        platform: Platform.OS,
        ...(await getUserMetadata()),
      },
    });
    this.setState({isLoading: false});
    if (response.ok) {
      notify(
        <Text success semibold>
          Your help request was successfully sent.
        </Text>,
      );
      this.props.navigation.goBack();
    }
  };

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  };

  componentWillUnmount = () => {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  };

  _keyboardDidShow = () => {
    this.setState({inputBoxHeight: 275});
  };

  _keyboardDidHide = () => {
    this.setState({inputBoxHeight: 450});
  };

  keyboardDidShowListener!: EmitterSubscription;
  keyboardDidHideListener!: EmitterSubscription;

  render() {
    const {message, isLoading} = this.state;
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{flex: 1}}
        extraScrollHeight={-10}>
        <View
          style={{
            marginHorizontal: 30,
            marginTop: 30,
            flex: 1,
          }}>
          <Text semibold xl>
            We're here to help
          </Text>
          <Text style={{marginVertical: 10}} sm muted>
            Please don't provide any sensitive or personal info (e.g., credit
            card numbers)
          </Text>
          <ScrollView contentContainerStyle={{flex: 1}}>
            <TextInput
              placeholder="Write a message"
              value={message}
              textInputStyle={{height: '70%', paddingHorizontal: 10}}
              onChangeText={changedMessage =>
                this.setState({message: changedMessage})
              }
              textbox
            />
            <Text sm linebreak>
              Too much to explain?{' '}
              <Text
                highlight
                sm
                onPress={() => {
                  popup({
                    title: 'Help Request',
                    description:
                      "How would you like us to contact you? We'll contact you ASAP to help you out.",
                    buttonOptions:
                      this.context.state.onboardingStep > 1
                        ? [
                            {
                              text: 'Email',
                              onPress: () =>
                                this.submitForm({
                                  message: 'Please contact me via email.',
                                  reason: 'Emergency Help',
                                }),
                            },
                            {
                              text: 'Text',
                              onPress: () =>
                                this.submitForm({
                                  message:
                                    'Please contact me via text message.',
                                  reason: 'Emergency Help',
                                }),
                            },
                            {
                              text: 'Call',
                              onPress: () =>
                                this.submitForm({
                                  message: 'Please contact me via phone call.',
                                  reason: 'Emergency Help',
                                }),
                            },
                            {text: 'Cancel', onPress: () => {}},
                          ]
                        : [
                            {text: 'Cancel', onPress: () => {}},
                            {
                              text: 'Email',
                              onPress: () =>
                                this.submitForm({
                                  message: 'Please contact me via email.',
                                  reason: 'Emergency Help',
                                }),
                            },
                          ],
                  });
                }}>
                Press me
              </Text>{' '}
              and we'll contact you.
            </Text>
          </ScrollView>
          <Button
            style={{alignSelf: 'center', marginBottom: 30}}
            title="Send Message"
            onPress={() =>
              this.submitForm({
                message: this.state.message,
                reason: 'Help Request',
              })
            }
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
