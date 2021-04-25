import React from 'react';
import {isEqual} from 'lodash';

import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';

import {RobocallItem, Text} from '../components';
import {GlobalContext} from '../global/GlobalContext';
import {WithRequest, withRequest} from '../hoc';
import {
  mapCallsToContact,
  writeCache,
  readCacheMulti,
  writeCacheMulti,
} from '../utils';
import {NavigationProps} from './types';

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
  recentRobocalls: MappedRobocallData[];
  refreshing: boolean;
  initLoading: boolean;
  countRobocalls: number;
}

export interface RawRobocallData {
  createdAt: string;
  caller: string;
  callSid: string;
}

export interface MappedRobocallData {
  familyName: string;
  givenName: string;
  caller: string;
  createdAt: string;
}

class Robocalls extends React.PureComponent<Props, State> {
  static contextType = GlobalContext;
  static navigationOptions = {title: 'Blocked Robocalls'};

  state: State = {
    recentRobocalls: [],
    refreshing: false,
    initLoading: false,
    countRobocalls: 0,
  };

  componentDidMount = async () => {
    const {recentRobocalls, countRobocalls} = await readCacheMulti([
      'recentRobocalls',
      'countRobocalls',
    ]);
    this.setState({recentRobocalls, countRobocalls});
    await this.queryRobocalls();
  };

  queryRobocalls = async () => {
    const response = await this.props.request({
      url: '/user/robocalls/',
      method: 'GET',
    });
    if (response.ok) {
      const {recentRobocalls, countRobocalls} = await response.data;
      await this.handleNewData(recentRobocalls, countRobocalls);
    }
  };

  handleNewData = async (
    unmappedRecentRobocalls: RawRobocallData[],
    countRobocalls: number,
  ) => {
    const recentRobocalls = await mapCallsToContact(unmappedRecentRobocalls);

    const recentRobocallsChanged = !isEqual(
      recentRobocalls,
      this.state.recentRobocalls,
    );
    const countRobocallsChanged = !isEqual(
      countRobocalls,
      this.state.countRobocalls,
    );

    // If either values have changed, update state and cache accordingly
    if (recentRobocallsChanged || countRobocallsChanged) {
      if (recentRobocallsChanged && countRobocallsChanged) {
        this.setState({recentRobocalls, countRobocalls});
        await writeCacheMulti([
          ['recentRobocalls', recentRobocalls],
          ['countRobocalls', countRobocalls],
        ]);
      } else if (recentRobocallsChanged) {
        this.setState({recentRobocalls});
        await writeCache('recentRobocalls', recentRobocalls);
      } else {
        this.setState({countRobocalls});
        await writeCache('countRobocalls', countRobocalls);
      }
    }
    // Neither values changed, so do nothing
  };

  updateRobocallsData = async () => {
    this.setState({refreshing: true});
    await this.queryRobocalls();
    this.setState({refreshing: false});
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.countRobocalls > 0 &&
          this.state.recentRobocalls.length > 0 && (
            <View style={{marginVertical: 10}}>
              <Text lg semibold center>
                We've blocked{' '}
                <Text semibold lg error>
                  {this.state.countRobocalls}
                </Text>{' '}
                robocalls for you so far!
              </Text>
            </View>
          )}
        {this.state.initLoading ? (
          <ActivityIndicator size="small" style={{marginTop: 30}} />
        ) : (
          <FlatList
            onRefresh={this.updateRobocallsData}
            refreshing={this.state.refreshing}
            data={this.state.recentRobocalls}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            ListEmptyComponent={() => (
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 30,
                  marginHorizontal: 20,
                }}>
                <Text semibold lg center>
                  No blocked robocalls yet but don't worry... {'\n'}they won't
                  bother you anymore 😉
                </Text>
              </View>
            )}
            renderItem={({item}) => {
              return (
                <RobocallItem
                  givenName={item.givenName}
                  familyName={item.familyName}
                  phoneNumber={item.caller}
                  date={item.createdAt}
                />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  }
}

export default withRequest(Robocalls);
