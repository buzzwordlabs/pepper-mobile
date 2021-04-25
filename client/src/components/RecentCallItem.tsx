import React from 'react';
import {View, TouchableHighlight} from 'react-native';
import {underlayColor, tintColor, fontScale} from '../constants';
import Icon from './Icon';
import Text from './Text';
import {convertRecentDateTime, callerId} from '../utils';
import {RawCallData} from '../screens/Recents/Recents';

interface Props extends RawCallData {
  onPress: any;
}

const RecentCallItem = (props: Props) => {
  const {
    familyName = '',
    givenName = '',
    caller,
    missed,
    createdAt,
    onPress,
    callSid,
    callQuality,
  } = props;

  const dateInfo = convertRecentDateTime(createdAt);

  return (
    <TouchableHighlight
      style={[
        {
          height: fontScale < 1.25 ? 70 : 70 * fontScale,
          paddingVertical: 16,
          paddingHorizontal: 16,
          alignItems: 'center',
          flex: 1,
          flexDirection: 'row',
          borderColor: 'lightgray',
          borderBottomWidth: 1,
          backgroundColor: '#fff',
        },
      ]}
      activeOpacity={0.8}
      underlayColor={underlayColor}
      onPress={() =>
        onPress({caller, familyName, givenName, callSid, callQuality})
      }>
      <>
        <View style={{flex: 1}}>
          <Icon
            name="phone-incoming"
            library="feather"
            size={16}
            color={tintColor}
          />
        </View>
        <View style={{flex: 10, marginLeft: 6}}>
          <Text>{callerId(givenName, familyName, caller)}</Text>
          <Text semibold sm error={missed} success={!missed}>
            {missed ? 'Missed' : 'Answered'}
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexDirection: 'row',
            flex: 3,
          }}>
          <Text
            style={{
              marginLeft: 'auto',
              marginRight: 10,
              textAlign: 'right',
            }}
            xs>
            {`${dateInfo.day}\n${dateInfo.time}`}
          </Text>
        </View>
      </>
    </TouchableHighlight>
  );
};

export default RecentCallItem;
