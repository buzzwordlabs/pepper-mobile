import {SafeAreaView, StyleSheet, View} from 'react-native';
import React from 'react';
import {Button, Text, IconButton, Image} from '../../components';
import {microphone} from '../../assets/images';
import {prettyTimeMS} from '../../utils';
import Slider from 'react-native-slider';
import {tintColor, errorBackground} from '../../constants';
import Pulse from 'react-native-pulse';

interface Props {
  recorderDuration: number;
  playerDuration: number;
  playerPosition: number;
  toggleRecord: () => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  sendRecording: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}

export default function RecordGreetingUI(props: Props) {
  return (
    <SafeAreaView>
      <View>
        {props.isRecording && (
          <Pulse
            color={tintColor}
            numPulses={3}
            diameter={150}
            speed={1}
            duration={2000}
            style={{marginTop: 25}}
          />
        )}
        <Image
          source={microphone}
          width={150}
          height={150}
          style={{alignSelf: 'center'}}
        />
      </View>
      <Text style={{marginTop: 20}} center xl>
        {props.isRecording
          ? prettyTimeMS(props.recorderDuration).textFormat
          : props.playerDuration > 0
          ? `${prettyTimeMS(props.playerPosition).textFormat}/${
              prettyTimeMS(props.playerDuration).textFormat
            }`
          : prettyTimeMS(props.recorderDuration).textFormat}
      </Text>
      <View style={{marginTop: 40, marginHorizontal: 20}}>
        {/* Only show player progress if user isn't currently recording */}
        {!props.isRecording ? (
          <Slider
            style={{flex: 1}}
            minimumValue={0}
            maximumValue={Number(props.playerDuration)}
            value={Number(props.playerPosition)}
            minimumTrackTintColor={tintColor}
            maximumTrackTintColor="#A4A4A4"
            animateTransitions
            onSlidingComplete={async (position: number) =>
              props.seekTo(position)
            }
            thumbStyle={{
              width: 3,
              height: 16,
              borderRadius: 0,
              backgroundColor: '#585858',
            }}
          />
        ) : (
          <Text center semibold style={{fontSize: 20}}>
            I'm listening...
          </Text>
        )}
        <View style={{marginTop: 40}}>
          <Text muted center>
            *1:00 maximum
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 40,
            }}>
            <View style={{marginHorizontal: 10}}>
              <IconButton
                style={[{paddingLeft: 15}, styles.buttonOverride]}
                onPress={props.toggleRecord}
                backgroundColor="#F2F2F2"
                library="materialComIcons"
                name={props.isRecording ? 'stop' : 'record'}
                size={40}
                color={errorBackground}
              />
            </View>
            {/* Don't let user play the recording while they're recording */}
            {!props.isRecording && props.recorderDuration > 0 && (
              <View style={{marginHorizontal: 10}}>
                <IconButton
                  onPress={props.togglePlay}
                  style={[{paddingLeft: 15}, styles.buttonOverride]}
                  library="materialComIcons"
                  backgroundColor="#F2F2F2"
                  name={props.isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="black"
                />
              </View>
            )}
          </View>
        </View>
        {/* Only submit if recording exists */}
        {!props.isRecording && props.recorderDuration > 0 && (
          <View style={{marginTop: 20}}>
            <Button
              style={styles.buttonOverride}
              textStyle={styles.textColor}
              loading={props.isLoading}
              loadingColor="black"
              title="Done"
              onPress={props.sendRecording}
            />
            {props.isLoading && (
              <Text sm center style={{marginTop: 10}}>
                Please wait while we upload your audio! Just a few more
                seconds...
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonOverride: {
    backgroundColor: '#F2F2F2',
    borderColor: '#BDBDBD',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 0,
    paddingBottom: 3,
    paddingRight: 5,
  },
  textColor: {color: '#585858'},
});
