import React from 'react';
import {ScrollView, View, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NavigationStackProp} from 'react-navigation-stack';

import {Button, Text, TextInput} from '../components';
import {notify, request, getUserMetadata} from '../utils';

interface Props {
  navigation: NavigationStackProp;
}

export default class Feedback extends React.Component<Props> {
  static navigationOptions = {
    title: 'Feedback',
  };

  state = {message: '', inputBoxHeight: 250, isLoading: false};

  submitForm = async () => {
    const {message} = this.state;
    if (message.trim().length < 2) {
      return notify(
        <Text error semibold>
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
        reason: 'Feedback',
        platform: Platform.OS,
        ...(await getUserMetadata()),
      },
    });
    this.setState({isLoading: false});
    if (response.ok) {
      notify(
        <Text success semibold>
          Your feedback was successfully sent.
        </Text>,
      );
      this.props.navigation.goBack();
    }
  };

  render() {
    const {message, isLoading} = this.state;
    return (
      <KeyboardAwareScrollView contentContainerStyle={{flex: 1}}>
        <View
          style={{
            marginHorizontal: 30,
            marginTop: 30,
            flex: 1,
          }}>
          {this.props.navigation.getParam('referrer', '') === 'Unsubscribe' ? (
            <>
              <Text semibold xl>
                What do you wish we did differently?
              </Text>
              <Text style={{marginTop: 10}} sm muted>
                Pepper isn't meant for everyone, but we would really appreciate
                some honest feedback.{'\n'}
              </Text>
            </>
          ) : (
            <>
              <Text semibold xl>
                Thank you for providing feedback!
              </Text>
              <Text style={{marginVertical: 10}} sm muted>
                We're constantly trying to make Pepper better. Your feedback
                makes it 10x easier!
              </Text>
            </>
          )}
          <Text xs muted linebreak>
            Please don't provide any sensitive or personal info.
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
          </ScrollView>
          <Button
            style={{alignSelf: 'center'}}
            title="Send Message"
            onPress={this.submitForm}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
