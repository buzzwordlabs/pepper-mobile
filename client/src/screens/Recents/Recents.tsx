import React from 'react';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {firebase} from '@react-native-firebase/messaging';
import {isEmpty, isEqual} from 'lodash';

import {FlatList, Platform, StyleSheet, View, Clipboard} from 'react-native';

import {
  Modal,
  RecentCallItem,
  Text,
  TouchableOpacity,
  TextInput,
  Tooltip,
} from '../../components';
import {window, isSmallDevice} from '../../constants';
import {GlobalContext} from '../../global/GlobalContext';
import {WithRequest, withRequest} from '../../hoc';
import {
  getDiffContacts,
  mapCallsToContact,
  popupPermissionsPrompt,
  writeCache,
  checkAllPermissions,
  callkeepSetup,
  sendCall,
  callerId,
  validatePhoneNumber,
  notify,
  convertRecentDateTime,
  tooltipSeen,
  readCache,
} from '../../utils';
import moment from 'moment';
import {getVersion} from 'react-native-device-info';
import {NavigationProps} from '../types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalButton: {
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

interface Props extends WithRequest, NavigationProps {}

interface State {
  recentCalls: Array<any>;
  refreshing: boolean;
  initLoading: boolean;
  showReportProblemModal: boolean;
  focusedCallItem: RawCallData;
  showReportProblemDescriptionModal: boolean;
  copiedToClipboard: boolean;
  reportProblemDescription: string;
  showTooltip: boolean;
}

export interface RawCallData {
  callSid: string;
  familyName: string;
  givenName: string;
  caller: string;
  missed: boolean;
  createdAt: string;
  updatedAt: string;
  dialCallStatus: string;
  callQuality: string;
}

class Recents extends React.PureComponent<Props, State> {
  static contextType = GlobalContext;

  state: State = {
    recentCalls: [],
    refreshing: false,
    initLoading: false,
    showReportProblemModal: false,
    showReportProblemDescriptionModal: false,
    copiedToClipboard: false,
    reportProblemDescription: '',
    showTooltip: false,
    focusedCallItem: {
      callSid: '',
      familyName: '',
      givenName: '',
      caller: '',
      missed: false,
      createdAt: '',
      updatedAt: '',
      dialCallStatus: '',
      callQuality: '',
    },
  };

  componentDidMount = async () => {
    const seenToolTip = await tooltipSeen({
      type: 'recent-call-report-problem',
      appVersion: getVersion(),
    });
    if (!seenToolTip) this.setState({showTooltip: true});
    this.getAndroidFirebaseToken();
    if (Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('register', this._onRegistered);
      PushNotificationIOS.requestPermissions();
    }
    const {overallStatus, contactsStatus} = await checkAllPermissions();
    if (contactsStatus !== 'granted') return popupPermissionsPrompt();
    else if (overallStatus !== 'granted') popupPermissionsPrompt();
    this.context.setState({permissionsGranted: overallStatus === 'granted'});

    const recentCalls = await readCache('recentCalls');
    this.setState({recentCalls});
    await this.queryRecentCalls();
    await this.syncContacts();
    Platform.OS === 'android' && callkeepSetup();
  };

  componentWillUnmount = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeEventListener('register', this._onRegistered);
    }
  };

  updateFocusedCallItem = (callData: RawCallData) => {
    this.setState({
      focusedCallItem: callData,
      showReportProblemModal: true,
    });
  };

  getAndroidFirebaseToken = async () => {
    if (Platform.OS === 'android') {
      const fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await this._onRegistered(fcmToken);
      }
    }
  };

  _onRegistered = async (deviceToken: string) => {
    await this.props.request({
      url: '/user/devices/token',
      method: 'POST',
      body: {token: deviceToken},
    });
  };

  queryRecentCalls = async () => {
    this.setState({initLoading: true});
    const response = await this.props.request({
      url: '/user/recents/',
      method: 'GET',
    });
    if (response.ok) {
      let {recentCalls} = await response.data;
      recentCalls = await mapCallsToContact(recentCalls);
      await this.handleNewData(recentCalls);
    }
  };

  handleNewData = async (unmappedRecentCalls: any) => {
    const recentCalls = await mapCallsToContact(unmappedRecentCalls);
    // If either recentCalls has changed, update state and cache accordingly
    if (!isEqual(recentCalls, this.state.recentCalls)) {
      this.setState({recentCalls});
      await writeCache('recentCalls', recentCalls);
    }
  };

  syncContacts = async () => {
    const {updatedContacts, deletedContacts} = await getDiffContacts();
    if (!isEmpty(updatedContacts) || !isEmpty(deletedContacts)) {
      await this.props.request({
        url: '/user/contacts/update',
        method: 'POST',
        body: {
          updatedContacts,
          deletedContacts,
        },
      });
    }
  };

  submitReportProblem = async ({
    callSid,
    description,
  }: {
    callSid: string;
    description: string;
  }) => {
    const response = await this.props.request({
      url: '/user/recents/report-problem',
      method: 'POST',
      body: {description, callSid},
    });
    if (response.ok) {
      this.setState({
        reportProblemDescription: '',
        showReportProblemModal: false,
        showReportProblemDescriptionModal: false,
      });
      await this.queryRecentCalls();
      return notify(
        <Text success semibold>
          This problem was successfully reported.
        </Text>,
      );
    } else {
      return notify(
        <Text error semibold>
          An error occurred.
        </Text>,
      );
    }
  };

  static navigationOptions: {title: string};

  render() {
    const dateInfo = convertRecentDateTime(
      this.state.focusedCallItem.createdAt,
    );
    return (
      <View style={styles.container}>
        <FlatList
          onRefresh={this.queryRecentCalls}
          refreshing={this.state.refreshing}
          data={this.state.recentCalls}
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          ListEmptyComponent={() => (
            <View
              style={{
                alignItems: 'center',
                marginTop: 30,
                marginHorizontal: 20,
              }}>
              <Text semibold lg>
                No calls yet. Stay tuned! 📱
              </Text>
            </View>
          )}
          renderItem={({item, index}) => {
            if (index === 0 && this.state.showTooltip) {
              return (
                <Tooltip
                  isVisible={true}
                  contentPadding={30}
                  header="New Feature! 🎉"
                  close={() => this.setState({showTooltip: false})}
                  content={
                    <Text>
                      <Text semibold>
                        Now you can report any issues with a specific call!
                      </Text>
                      {'\n\n'}
                      This will help us improve Pepper.
                    </Text>
                  }>
                  <RecentCallItem
                    {...item}
                    missed={item.dialCallStatus !== 'completed'}
                    onPress={this.updateFocusedCallItem}
                  />
                </Tooltip>
              );
            }
            return (
              <RecentCallItem
                {...item}
                missed={item.dialCallStatus !== 'completed'}
                onPress={this.updateFocusedCallItem}
              />
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />
        {this.state.showReportProblemModal && (
          <Modal
            isVisible={this.state.showReportProblemModal}
            scrollable
            onBackdropPress={() => {
              this.setState({
                showReportProblemModal: false,
                copiedToClipboard: false,
              });
            }}
            modalHeight={window.height * (isSmallDevice ? 0.8 : 0.65)}>
            <Text center semibold style={{marginBottom: 20, fontSize: 20}}>
              From{' '}
              {callerId(
                this.state.focusedCallItem.givenName,
                this.state.focusedCallItem.familyName,
                this.state.focusedCallItem.caller,
              )}{' '}
              on {'\n'}
              {`${dateInfo.day} ${dateInfo.time}`}
            </Text>
            {this.state.focusedCallItem.callQuality && (
              <Text linebreak>
                Problem reported on{' '}
                {moment(this.state.focusedCallItem.updatedAt).format('LL')}
              </Text>
            )}
            {validatePhoneNumber(this.state.focusedCallItem.caller!) !== '' && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => sendCall(this.state.focusedCallItem.caller!)}>
                <Text>
                  Call{' '}
                  {callerId(
                    this.state.focusedCallItem.givenName,
                    this.state.focusedCallItem.familyName,
                    this.state.focusedCallItem.caller,
                  )}{' '}
                  <Text lg>📞</Text>
                </Text>
              </TouchableOpacity>
            )}
            {!this.state.focusedCallItem.callQuality && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() =>
                  this.setState({
                    showReportProblemModal: false,
                    showReportProblemDescriptionModal: true,
                  })
                }>
                <Text>
                  Report A Problem <Text lg>🆘</Text>
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Clipboard.setString(this.state.focusedCallItem.callSid);
                this.setState({copiedToClipboard: true});
              }}>
              {!this.state.copiedToClipboard ? (
                <Text>
                  Copy Call ID To Clipboard <Text lg>📋</Text>
                </Text>
              ) : (
                <Text>
                  Copied <Text lg>✅</Text>
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                this.setState({
                  showReportProblemModal: false,
                  copiedToClipboard: false,
                });
              }}>
              <Text highlight semibold>
                Cancel
              </Text>
            </TouchableOpacity>
          </Modal>
        )}
        {this.state.showReportProblemDescriptionModal && (
          <Modal
            isVisible={this.state.showReportProblemDescriptionModal}
            scrollable={false}
            onBackdropPress={() =>
              this.setState({showReportProblemDescriptionModal: false})
            }
            modalButtons={[
              {
                buttonText: <Text semibold>Cancel</Text>,
                onPress: () =>
                  this.setState({showReportProblemDescriptionModal: false}),
              },
              {
                buttonText: (
                  <Text semibold highlight>
                    Submit
                  </Text>
                ),
                onPress: async () => {
                  const {reportProblemDescription: description} = this.state;
                  const {callSid} = this.state.focusedCallItem;
                  await this.submitReportProblem({callSid, description});
                },
              },
            ]}>
            <Text style={{marginTop: 20}} semibold lg>
              Call Feedback
            </Text>
            <TextInput
              onChangeText={reportProblemDescription =>
                this.setState({reportProblemDescription})
              }
              value={this.state.reportProblemDescription}
              placeholder="What went wrong?"
              inputContainerStyle={{marginTop: 10}}
              autoFocus
              textbox
            />
          </Modal>
        )}
      </View>
    );
  }
}

Recents.navigationOptions = {
  title: 'Recents',
};

export default withRequest(Recents);
