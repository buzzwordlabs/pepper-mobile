import moment from 'moment';
import React from 'react';
import {ActivityIndicator, Alert, FlatList, View} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';

import {VoicemailPlayer, Text} from '../components';
import {
  getContactByPhoneNumber,
  notify,
  request,
  readCache,
  writeCache,
} from '../utils';
import {isEqual} from 'lodash';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
}

export interface RawVoicemailData {
  id: string;
  url: string;
  caller: string;
  createdAt: string;
  duration: number;
}

interface State {
  voicemails: RawVoicemailData[];
  currentTrack: string;
  isPlaying: boolean;
  refreshing: boolean;
}

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export default class Voicemail extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Voicemail',
  };

  state = {
    voicemails: [],
    currentTrack: '',
    isPlaying: false,
    refreshing: false,
  };

  didBlurSubscription = this.props.navigation.addListener(
    'didBlur',
    async () => await this.pause(),
  );

  componentDidMount = async () => {
    TrackPlayer.addEventListener('playback-queue-ended', () =>
      this.setState({currentTrack: '', isPlaying: false}),
    );
    const voicemails = await readCache('voicemails');
    this.setState({voicemails});
    this.queryVoicemails();
  };

  componentWillUnmount = () => this.didBlurSubscription.remove();

  queryVoicemails = async () => {
    const response = await request({url: '/user/voicemails/', method: 'GET'});
    if (response.ok) {
      const voicemails = response.data.voicemails;
      await this.handleNewData(voicemails);
    }
  };

  handleNewData = async (unmappedVoicemails: RawVoicemailData[]) => {
    // Find contacts for these voicemails
    const voicemails: RawVoicemailData[] = await Promise.all(
      unmappedVoicemails.map(async (voicemail: RawVoicemailData) => {
        const caller = await getContactByPhoneNumber(voicemail.caller);
        return {...voicemail, caller};
      }),
    );
    // If either recentCalls has changed, update state and cache accordingly
    if (!isEqual(voicemails, this.state.voicemails)) {
      this.setState({voicemails});
      await writeCache('voicemails', voicemails);
    }
  };

  deleteVoicemail = async (deleteId: string) => {
    await this.pause();
    const {voicemails} = this.state;
    if (!deleteId) {
      return notify(
        <Text semibold error>
          There was an error while trying to delete this voicemail.
        </Text>,
      );
    }
    const currentVoicemail: RawVoicemailData[] = voicemails.filter(
      (voicemail: RawVoicemailData) => voicemail.id === deleteId,
    );
    Alert.alert(
      `Delete Voicemail From "${currentVoicemail[0].caller}?"`,
      'Deleting this voicemail cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {
            return;
          },
        },
        {
          text: 'Delete',
          onPress: async () => {
            const response = await request({
              url: 'user/voicemails/delete-one',
              method: 'PUT',
              body: {deletedVoicemail: deleteId},
            });
            if (response.ok) {
              const filteredVoicemails = voicemails.filter(
                (voicemail: RawVoicemailData) => voicemail.id !== deleteId,
              );
              this.setState({voicemails: filteredVoicemails});
            } else {
              notify(
                <Text semibold error>
                  There was an error while trying to delete this voicemail.
                </Text>,
              );
            }
          },
        },
      ],
    );
  };

  fullReset = async () => {
    this.setState(
      {isPlaying: false, currentTrack: ''},
      async () => await this.reset(),
    );
  };

  reset = async () => {
    await TrackPlayer.reset();
    // For good measure
    await TrackPlayer.removeUpcomingTracks();
  };

  resetAndPlay = async (track: Track) => {
    await this.reset();
    await TrackPlayer.add(track);
    await TrackPlayer.play();
    return this.setState({currentTrack: track.id, isPlaying: true});
  };

  replay = async (track: Track) => {
    return this.setState(
      {currentTrack: track.id, isPlaying: true},
      async () => {
        await TrackPlayer.reset();
        await TrackPlayer.add(track);
        await TrackPlayer.play();
      },
    );
  };

  pause = async () => {
    return this.setState(
      {isPlaying: false},
      async () => await TrackPlayer.pause(),
    );
  };

  play = async (track: Track) => {
    return this.setState(
      {currentTrack: track.id, isPlaying: true},
      async () => await TrackPlayer.play(),
    );
  };

  toggle = async (track: Track): Promise<{changedTrackFocus: boolean}> => {
    track = {
      ...track,
      artist: moment(track.artist).format('MMM Do YYYY h:mm A'),
    };

    const currentTrackId = await TrackPlayer.getCurrentTrack();

    // If current track is different from the one being played
    if (currentTrackId !== track.id) {
      // Reset the track and play the new one
      this.resetAndPlay(track);
      return {changedTrackFocus: true};
    }
    // Else, current track is the same
    else {
      const state = await TrackPlayer.getState();
      const audioLength = await TrackPlayer.getDuration();
      const position = await TrackPlayer.getPosition();
      // If the track is in "playing" state (android returns 3 for some reason)
      if (state === 'playing' || state === 3) {
        // If audio finished playing, replay it
        if (audioLength <= position) {
          this.replay(track);
          return {changedTrackFocus: false};
        }
        // Else, it's not done yet, so just pause
        else {
          this.pause();
          return {changedTrackFocus: false};
        }
      } else {
        if (audioLength <= position) {
          this.replay(track);
          return {changedTrackFocus: false};
        } else {
          this.play(track);
          return {changedTrackFocus: false};
        }
      }
    }
  };

  mapVoicemailToTrack = (voicemail: RawVoicemailData): Track => {
    return {
      id: voicemail.id,
      url: voicemail.url,
      title: voicemail.caller,
      artist: voicemail.createdAt,
    };
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <FlatList
          onRefresh={this.queryVoicemails}
          refreshing={this.state.refreshing}
          data={this.state.voicemails}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          ListEmptyComponent={() => (
            <View
              style={{
                alignItems: 'center',
                marginTop: 30,
                marginHorizontal: 20,
              }}>
              <Text semibold lg>
                No voicemails yet. Stay tuned! 📼
              </Text>
            </View>
          )}
          renderItem={({item}: {item: RawVoicemailData}) => {
            const track = this.mapVoicemailToTrack(item);
            return (
              <VoicemailPlayer
                track={track}
                duration={item.duration}
                currentTrack={this.state.currentTrack}
                toggle={this.toggle}
                isPlaying={this.state.isPlaying}
                deleteVoicemail={this.deleteVoicemail}
              />
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}
