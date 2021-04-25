import React from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AudioRecord from 'react-native-audio-record';
import {Buffer} from 'buffer';
import {View, Platform} from 'react-native';
import {Text} from '../../components';
import {request, getExternalStoragePermission, notify} from '../../utils';
import RecordGreetingUI from './RecordGreetingUI';
import {NavigationProps} from '../types';
import {GlobalContext} from '../../global/GlobalContext';

type Props = NavigationProps;

interface State {
  // All time is in seconds
  recorderDuration: number;
  playerPosition: number;
  playerDuration: number;
  isRecording: boolean;
  isPlaying: boolean;
  filePath: string;
  isLoading: boolean;
}

const initialState: State = {
  recorderDuration: 0,
  playerPosition: 0,
  playerDuration: 0,
  isRecording: false,
  isPlaying: false,
  filePath: '',
  isLoading: false,
};

class RecordGreeting extends React.Component<Props> {
  static contextType = GlobalContext;
  static navigationOptions = {
    title: 'Custom Voicemail',
  };
  intervalSetter: any = null;

  state: State = {
    recorderDuration: 0,
    playerPosition: 0,
    playerDuration: 0,
    isRecording: false,
    isPlaying: false,
    filePath: '',
    isLoading: false,
  };

  willBlurListener = this.props.navigation.addListener('willBlur', () => {
    if (this.state.isPlaying) {
      this.removePlayerListener();
      this.pause();
    }
    if (this.state.isRecording) this.stopRecord();
    this.setState(initialState);
  });

  audioRecorderPlayer = new AudioRecorderPlayer();

  componentDidMount = async () => {
    // android requires audio and external storage
    if (Platform.OS === 'android') {
      try {
        await getExternalStoragePermission();
      } catch (err) {
        console.warn(err);
      }
    }
    this.initAudioRecord();
  };

  componentWillUnmount = () => {
    this.willBlurListener.remove();
    clearInterval(this.intervalSetter);
  };

  // Recorder

  initAudioRecord = () => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'audio.wav',
    };

    AudioRecord.init(options);
    AudioRecord.on('data', data => {});
  };

  toggleRecord = async () =>
    this.state.isRecording ? await this.stopRecord() : await this.startRecord();

  startRecord = async () => {
    if (this.state.recorderDuration > 0) {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.seekToPlayer(this.state.recorderDuration * 1000);
      this.setState({
        playerPosition: 0,
        playerDuration: 0,
        recorderDuration: 0,
        isPlaying: false,
      });
      this.removePlayerListener();
    }
    this.setState({filePath: '', isRecording: true});
    this.intervalSetter = setInterval(() => {
      this.setState((prevState: State) => ({
        recorderDuration: prevState.recorderDuration + 1,
      }));
    }, 1000);
    AudioRecord.start();
  };

  stopRecord = async () => {
    if (!this.state.isRecording) return;
    clearInterval(this.intervalSetter);
    const filePath = await AudioRecord.stop();
    this.setState({filePath, isRecording: false});
  };

  // Player

  togglePlay = async () => (this.state.isPlaying ? this.pause() : this.play());

  play = async () => {
    if (this.state.isRecording) await this.stopRecord();
    this.setState({isPlaying: true});
    this.addPlayerListener();
    await this.audioRecorderPlayer.startPlayer(
      Platform.OS === 'ios' ? 'audio.wav' : this.state.filePath,
    );
  };

  pause = async () => {
    this.setState({isPlaying: false});
    await this.audioRecorderPlayer.pausePlayer();
  };

  seekTo = async (playerPosition: number) => {
    this.audioRecorderPlayer.seekToPlayer(playerPosition * 1000);
    await this.audioRecorderPlayer.startPlayer(this.state.filePath);
    this.setState({playerPosition, isPlaying: true});
  };

  finishedPlaying = async () => {
    this.setState({isPlaying: false});
    await this.audioRecorderPlayer.stopPlayer();
  };

  addPlayerListener = () => {
    this.audioRecorderPlayer.addPlayBackListener(
      async ({
        current_position: playerPosition,
        duration: playerDuration,
      }: {
        current_position: number;
        duration: number;
      }) => {
        if (playerPosition === playerDuration) await this.finishedPlaying();
        this.setState({
          playerPosition: playerPosition / 1000,
          playerDuration: playerDuration / 1000,
        });
      },
    );
  };

  removePlayerListener = () =>
    this.audioRecorderPlayer.removePlayBackListener();

  sendRecording = async () => {
    // 5 seconds minimum
    if (this.state.recorderDuration < 5) {
      return notify(
        <Text error semibold>
          Recordings must be at least 5 seconds long.
        </Text>,
      );
    } else {
      const {filePath} = this.state;
      const data: FormData = new FormData();
      const audioFile: any = {
        uri: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        name: `audio.wav`,
        type: `audio/x-wav`,
      };
      data.append('voicemailRecording', audioFile);
      this.setState({isLoading: true});
      const response = await request({
        url: '/user/settings/custom-voicemail-recording',
        method: 'PUT',
        body: data,
      });
      this.setState({isLoading: false});
      if (response.ok) {
        const {voicemailGreeting} = response.data;
        this.context.setState({
          settings: {...this.context.state.settings, voicemailGreeting},
        });
        notify(
          <Text success semibold>
            Your custom voicemail has been successfully uploaded.
          </Text>,
        );
        this.props.navigation.goBack();
      } else {
        notify(
          <Text error semibold>
            An unknown error occurred. Please try pressing the "Done" button
            once more.
          </Text>,
        );
      }
    }
  };
  render() {
    return (
      <RecordGreetingUI
        recorderDuration={this.state.recorderDuration}
        playerDuration={this.state.playerDuration}
        playerPosition={this.state.playerPosition}
        pause={this.pause}
        toggleRecord={this.toggleRecord}
        togglePlay={this.togglePlay}
        sendRecording={this.sendRecording}
        seekTo={this.seekTo}
        isRecording={this.state.isRecording}
        isPlaying={this.state.isPlaying}
        isLoading={this.state.isLoading}
      />
    );
  }
}

export default RecordGreeting;
