import React, {Component} from 'react';
import TrackPlayer from 'react-native-track-player';
import VoicemailPlayerUI from './VoicemailPlayerUI';
import {Track} from '../../screens/Voicemail';

interface Props {
  track: Track;
  currentTrack: string;
  isPlaying: boolean;
  duration: number;
  toggle: (track: any) => Promise<{changedTrackFocus: boolean}>;
  deleteVoicemail: (deleteId: string) => Promise<void>;
}

interface State {
  position: number;
  bufferedPosition: number;
  duration: number;
  progressUpdates: boolean;
}

export default class VoicemailPlayer extends Component<Props, State> {
  state = {
    position: 0,
    bufferedPosition: 0,
    duration: 0,
    progressUpdates: false,
  };

  componentDidMount = async () => {
    const {currentTrack, track} = this.props;
    const {id} = track;
    if (currentTrack === id) this.timer;
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateProgress = async () => {
    try {
      // Only check for updates if a track should be playing now
      if (
        this.props.currentTrack === this.props.track.id &&
        this.props.isPlaying
      ) {
        const data = {
          position: await TrackPlayer.getPosition(),
          bufferedPosition: await TrackPlayer.getBufferedPosition(),
          duration: await TrackPlayer.getDuration(),
        };
        this.setState(data);
      }
    } catch (e) {
      // The player is probably not initialized yet, we'll just ignore it
    }
  };

  timer = setInterval(this.updateProgress, 100);

  render() {
    const {
      track,
      currentTrack,
      isPlaying,
      toggle,
      duration,
      deleteVoicemail,
    } = this.props;
    return (
      <VoicemailPlayerUI
        track={track}
        currentTrackId={currentTrack}
        isPlaying={isPlaying}
        duration={duration}
        position={this.state.position}
        callToggle={() => toggle(track)}
        deleteVoicemail={deleteVoicemail}
      />
    );
  }
}
