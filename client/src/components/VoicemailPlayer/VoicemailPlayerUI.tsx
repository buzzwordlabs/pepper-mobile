import moment from 'moment';
import React from 'react';
import {Image, Platform, TouchableOpacity, View} from 'react-native';
import Slider from 'react-native-slider';
import TrackPlayer from 'react-native-track-player';

import {pause, play} from '../../assets/images';
import {errorBackground, tintColor} from '../../constants';
import {Track} from '../../screens/Voicemail';
import Icon from '../Icon';
import Text from '../Text';

interface Props {
  currentTrackId: string;
  isPlaying: boolean;
  position: number;
  track: Track;
  duration: number;
  callToggle: () => Promise<{changedTrackFocus: boolean}>;
  deleteVoicemail: (deleteId: string) => Promise<void>;
}

export default function VoicePlayerUI(props: Props) {
  const [state, setState] = React.useState({sliderPosition: props.position});
  // Keep props and sliderPosition synchronized
  React.useEffect(() => {
    setState({sliderPosition: props.position});
  }, [props.position]);

  const {id, title, artist} = props.track;
  const currentlyFocused = props.currentTrackId === id;
  const currentlyPlaying = props.currentTrackId === id && props.isPlaying;
  const date = moment(artist);
  const audioLengthMinutes = Math.floor(props.duration / 60);
  const audioLengthSeconds = Math.floor(props.duration % 60);
  const timeLeft = state.sliderPosition;
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = Math.ceil(timeLeft % 60);

  return (
    <TouchableOpacity
      style={[
        {
          marginVertical: 2,
          marginHorizontal: 15,
          paddingHorizontal: 15,
          paddingVertical: 15,
        },
        currentlyFocused && {backgroundColor: '#F6F6F6', borderRadius: 20},
      ]}
      onPress={async () => {
        const {changedTrackFocus} = await props.callToggle();
        changedTrackFocus && setState({sliderPosition: 0});
      }}>
      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
        <Text semibold>{title}</Text>
        <TouchableOpacity onPress={() => props.deleteVoicemail(id)}>
          {Platform.select({
            ios: (
              <Icon
                library="ionicon"
                name="ios-trash"
                color={errorBackground}
                size={22}
              />
            ),
            android: (
              <Icon
                library="materialComIcons"
                name="trash-can"
                color={errorBackground}
                size={22}
              />
            ),
          })}
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <Icon
          onPress={async () => {
            await props.callToggle();
          }}
          style={{marginRight: 10}}
          library="materialComIcons"
          name={currentlyPlaying ? 'pause' : 'play'}
          size={30}
          color="#6E6E6E"
        />
        <Slider
          style={{flex: 1}}
          minimumValue={0}
          maximumValue={props.duration}
          animateTransitions
          value={currentlyFocused ? state.sliderPosition : 0}
          minimumTrackTintColor={tintColor}
          maximumTrackTintColor="#A4A4A4"
          thumbStyle={{
            width: 3,
            height: 16,
            borderRadius: 0,
            backgroundColor: '#585858',
          }}
          onValueChange={async (position: number) => {
            setState({sliderPosition: position});
            await TrackPlayer.seekTo(position);
          }}
        />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text sm>{date.format('MMM Do YYYY—h:mm A')}</Text>
        <Text sm>
          {currentlyFocused
            ? `${minutesLeft}:${
                secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft
              }/${audioLengthMinutes}:${
                audioLengthSeconds < 10
                  ? `0${audioLengthSeconds}`
                  : audioLengthSeconds
              }`
            : `${audioLengthMinutes}:${
                audioLengthSeconds < 10
                  ? `0${audioLengthSeconds}`
                  : audioLengthSeconds
              }`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
