import React from 'react';
import {
  AppState,
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import {Text, Modal, Image} from '../components';
import RNCallKeep from 'react-native-callkeep';

import {
  addEventListeners,
  removeEventListeners,
  request,
  twilioReceiveIncoming,
  callkeepSetup,
  notify,
  popup,
  bugsnag,
} from '../utils';
import {onThePhone} from '../assets/images';
import TextInput from './TextInput';
import {window, smallIos} from '../constants';

interface State {
  showQualityFeedbackModal: boolean;
  showSelectorFeedbackModal: boolean;
  showDescriptionFeedbackModal: boolean;
  showCallInProgressModal: boolean;
  mostRecentCaller: string;
  callQuality: string;
  callQualityDescription: string;
  mostRecentCallSid: string;
  callDidOccur: boolean;
}

const styles = StyleSheet.create({
  callQualityButton: {
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  callQualitySelectorItem: {
    borderWidth: 1,
    borderColor: 'lightgray',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
});

class InCallUI extends React.Component<{}, State> {
  state = {
    showQualityFeedbackModal: false,
    showDescriptionFeedbackModal: false,
    showCallInProgressModal: false,
    showSelectorFeedbackModal: false,
    callDidOccur: false,
    mostRecentCaller: '',
    callQuality: '',
    mostRecentCallSid: '',
    callQualityDescription: '',
  };

  componentDidMount() {
    bugsnag.leaveBreadcrumb(`begin componentDidMount()`, {
      component: '<InCallUI/>',
    });
    bugsnag.leaveBreadcrumb(`run initTwilio()`, {
      component: '<InCallUI/>',
    });
    this.initTwilio();
    if (Platform.OS === 'android') {
      bugsnag.leaveBreadcrumb(`run removeEventListeners()`, {
        component: '<InCallUI/>',
      });
      removeEventListeners();
      TwilioVoice.removeEventListener(
        'connectionDidDisconnect',
        this.twilioConnectionDidDisconnect,
      );
      TwilioVoice.removeEventListener(
        'connectionDidConnect',
        this.twilioConnectionDidConnect,
      );
    }
    bugsnag.leaveBreadcrumb('run addEventListeners()', {
      component: '<InCallUI/>',
    });
    addEventListeners();
    TwilioVoice.addEventListener(
      'connectionDidDisconnect',
      this.twilioConnectionDidDisconnect,
    );
    TwilioVoice.addEventListener(
      'connectionDidConnect',
      this.twilioConnectionDidConnect,
    );
    if (Platform.OS === 'android') {
      // Add RNCallKeep Events
      AppState.addEventListener('change', this.handleAppStateChange);
    }
    bugsnag.leaveBreadcrumb(`end componentDidMount()`, {
      component: '<InCallUI/>',
    });
  }

  componentWillUnmount() {
    bugsnag.leaveBreadcrumb(`begin componentWillUnmount`, {
      component: '<InCallUI/>',
    });
    bugsnag.leaveBreadcrumb(`run removeEventListeners()`, {
      component: '<InCallUI/>',
    });
    removeEventListeners();
    TwilioVoice.removeEventListener(
      'connectionDidDisconnect',
      this.twilioConnectionDidDisconnect,
    );
    TwilioVoice.removeEventListener(
      'connectionDidConnect',
      this.twilioConnectionDidConnect,
    );
    if (Platform.OS === 'android') {
      AppState.removeEventListener('change', this.handleAppStateChange);
    }
    bugsnag.leaveBreadcrumb(`end componentWillUnmount`, {
      component: '<InCallUI/>',
    });
  }

  twilioConnectionDidDisconnect = (data: any) => {
    bugsnag.leaveBreadcrumb(`begin twilioConnectionDidDisconnect`, {
      component: '<InCallUI/>',
    });
    this.setState(
      {
        showQualityFeedbackModal: true,
        showCallInProgressModal: false,
        mostRecentCallSid: data.call_sid,
      },
      () => {
        bugsnag.leaveBreadcrumb(`setState`, {
          component: '<InCallUI/>',
        });
      },
    );
    if (Platform.OS === 'android') {
      bugsnag.leaveBreadcrumb(`run endCall()`, {
        component: '<InCallUI/>',
      });
      RNCallKeep.endCall(data.call_sid);
    }
    bugsnag.leaveBreadcrumb(`end twilioConnectionDidDisconnect`, {
      component: '<InCallUI/>',
    });
  };

  twilioRecentCaller = (callerId: string) => {
    if (Platform.OS === 'ios') {
      const removeClient = callerId.split('client:').pop();
      return removeClient!.replace('737737', ' ');
    } else if (Platform.OS === 'android') {
      return callerId;
    } else {
      return callerId;
    }
  };

  twilioConnectionDidConnect = (data: any) => {
    bugsnag.leaveBreadcrumb(`begin twilioConnectionDidConnect`, {
      component: '<InCallUI/>',
    });

    this.setState(
      {
        // Make sure everything is reset first in case of back to back calls
        showQualityFeedbackModal: false,
        showDescriptionFeedbackModal: false,
        showSelectorFeedbackModal: false,
        mostRecentCaller: this.twilioRecentCaller(data.call_from),
        showCallInProgressModal: true,
        callDidOccur: true,
      },
      () => {
        bugsnag.leaveBreadcrumb(`setState`, {
          component: '<InCallUI/>',
        });
      },
    );
    if (Platform.OS === 'android') {
      bugsnag.leaveBreadcrumb(`run setCurrentCallActive()`, {
        component: '<InCallUI/>',
      });
      RNCallKeep.setCurrentCallActive(data.call_sid);
    }
    bugsnag.leaveBreadcrumb(`end twilioConnectionDidConnect`, {
      component: '<InCallUI/>',
    });
  };

  handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      bugsnag.leaveBreadcrumb(`run removeEventListeners()`, {
        component: '<InCallUI/>',
      });
      removeEventListeners();
      bugsnag.leaveBreadcrumb(`run addEventListeners()`, {
        component: '<InCallUI/>',
      });
      addEventListeners();
    } else {
      TwilioVoice.removeEventListener(
        'deviceDidReceiveIncoming',
        twilioReceiveIncoming,
      );
    }
  };

  getAuthToken = async () => {
    try {
      const response = await request({
        url: '/call/api/token',
        method: 'GET',
      });
      const {token} = response.data;
      return token;
    } catch (err) {}
  };

  initTwilio = async () => {
    bugsnag.leaveBreadcrumb('run getAuthToken()', {
      component: '<InCallUI/>',
    });
    const token = await this.getAuthToken();
    bugsnag.leaveBreadcrumb('run initWithToken()', {
      component: '<InCallUI/>',
    });
    await TwilioVoice.initWithToken(token);
    if (Platform.OS === 'ios') {
      try {
        bugsnag.leaveBreadcrumb('run configureCallKit()', {
          component: '<InCallUI/>',
        });
        TwilioVoice.configureCallKit({
          appName: 'Pepper',
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  sendCurrentFeedbackData = async () => {
    const {callQuality, callQualityDescription, mostRecentCallSid} = this.state;
    this.resetFeedbackState();
    await request({
      url: '/user/call-feedback/',
      method: 'POST',
      body: {
        callQuality,
        callQualityDescription,
        callSid: mostRecentCallSid,
      },
    });
    notify(
      <Text semibold success>
        Thank you for your feedback!
      </Text>,
    );
  };

  onPositiveFeedback = async () => {
    this.setState(
      {showQualityFeedbackModal: false, callQuality: 'good'},
      async () => await this.sendCurrentFeedbackData(),
    );
  };

  onNegativeFeedback = () => {
    this.setState({
      showQualityFeedbackModal: false,
      showSelectorFeedbackModal: true,
      callQuality: 'bad',
    });
  };

  onRobocallFeedback = () => {
    popup({
      title: 'Are you sure you got a robocall?',
      description:
        "We take issues like this very seriously, and we'll start investigating immediately if you received a robocall.",
      buttonOptions: [
        {text: 'Cancel', onPress: () => {}},
        {
          text: 'Yes',
          onPress: () => {
            this.setState(
              {
                showQualityFeedbackModal: false,
                callQuality: 'robocall',
              },
              async () => this.sendCurrentFeedbackData(),
            );
            notify(
              <Text semibold error>
                We're so sorry that this happened. We'll look into this ASAP and
                get back to you with an explanation.
              </Text>,
              {duration: 5000},
            );
          },
        },
      ],
    });
  };

  resetFeedbackState = () => {
    this.setState({
      showQualityFeedbackModal: false,
      showDescriptionFeedbackModal: false,
      callQuality: '',
      mostRecentCallSid: '',
      callQualityDescription: '',
      callDidOccur: false,
    });
  };

  cancelFeedback = async () => {
    await this.sendCurrentFeedbackData();
  };

  hideCallInProgressModal = () => {
    this.setState({showCallInProgressModal: false});
  };

  render() {
    Platform.OS === 'android' && callkeepSetup();
    return (
      <>
        {this.state.showQualityFeedbackModal && this.state.callDidOccur && (
          <Modal
            isVisible={this.state.showQualityFeedbackModal}
            modalHeight={window.height * 0.5}>
            <Text semibold style={{fontSize: 20}}>
              How was your call quality?
            </Text>
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 30,
              }}>
              <TouchableOpacity
                style={{
                  ...styles.callQualityButton,
                  borderColor: 'green',
                }}
                onPress={this.onPositiveFeedback}>
                <Text style={{fontSize: 50}}>😊👍</Text>
                <Text center>Great</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{...styles.callQualityButton, borderColor: 'orange'}}
                onPress={this.onNegativeFeedback}>
                <Text style={{fontSize: 50}}>😞👎</Text>
                <Text center>Poor</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                ...styles.callQualityButton,
                borderColor: 'red',
                marginTop: 20,
              }}
              onPress={this.onRobocallFeedback}>
              <Text style={{fontSize: 50}}>😡🤖</Text>
              <Text center>Got Robocall</Text>
            </TouchableOpacity>
          </Modal>
        )}

        {this.state.showSelectorFeedbackModal && (
          <Modal
            isVisible={this.state.showSelectorFeedbackModal}
            scrollable={false}
            onBackButtonPress={this.cancelFeedback}
            modalHeight={window.height * 0.4}>
            <Text center semibold style={{marginBottom: 20, fontSize: 20}}>
              Call Feedback
            </Text>
            <TouchableOpacity
              style={styles.callQualitySelectorItem}
              onPress={async () => {
                this.setState(
                  {
                    callQualityDescription: 'Poor audio connection',
                    showSelectorFeedbackModal: false,
                  },
                  async () => await this.sendCurrentFeedbackData(),
                );
              }}>
              <Text>
                Poor audio connection <Text lg>🔕</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callQualitySelectorItem}
              onPress={async () => {
                this.setState(
                  {
                    callQualityDescription: 'Call completely failed',
                    showSelectorFeedbackModal: false,
                  },
                  async () => await this.sendCurrentFeedbackData(),
                );
              }}>
              <Text>
                Call completely failed <Text lg>📵</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callQualitySelectorItem}
              onPress={() =>
                this.setState({
                  showSelectorFeedbackModal: false,
                  showDescriptionFeedbackModal: true,
                })
              }>
              <Text>Other</Text>
            </TouchableOpacity>
          </Modal>
        )}

        {this.state.showDescriptionFeedbackModal && (
          <Modal
            isVisible={this.state.showDescriptionFeedbackModal}
            scrollable={false}
            onBackButtonPress={this.cancelFeedback}
            modalButtons={[
              {
                buttonText: <Text semibold>Cancel</Text>,
                onPress: this.cancelFeedback,
              },
              {
                buttonText: (
                  <Text semibold highlight>
                    Submit
                  </Text>
                ),
                onPress: this.sendCurrentFeedbackData,
              },
            ]}>
            <Text style={{marginTop: 20}} semibold lg>
              Call Feedback
            </Text>
            <TextInput
              onChangeText={callQualityDescription =>
                this.setState({callQualityDescription})
              }
              value={this.state.callQualityDescription}
              placeholder="What went wrong?"
              inputContainerStyle={{marginTop: 10}}
              autoFocus
              textbox
            />
          </Modal>
        )}
        {this.state.showCallInProgressModal && Platform.OS === 'ios' && (
          <Modal
            isVisible={this.state.showCallInProgressModal}
            modalHeight={window.height * 0.45}
            modalButtons={[
              {
                buttonText: (
                  <Text semibold highlight>
                    Ok
                  </Text>
                ),
                onPress: this.hideCallInProgressModal,
              },
            ]}>
            <Image
              width={200}
              height={200}
              style={{
                resizeMode: 'cover',
                alignSelf: 'center',
              }}
              source={onThePhone}
            />
            <Text semibold>
              Call{' '}
              {this.state.mostRecentCaller &&
                `with ${this.state.mostRecentCaller} `}
              is currently in progress.{'\n\n'}
              If you {smallIos ? 'double click' : 'swipe up'} to try and view
              your recently used apps, you can use the usual call screen.
            </Text>
          </Modal>
        )}
        {this.props.children}
      </>
    );
  }
}

export default InCallUI;
