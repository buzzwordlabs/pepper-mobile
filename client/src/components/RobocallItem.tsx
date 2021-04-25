import React from 'react';
import {View, ViewStyle, TouchableHighlight} from 'react-native';
import {underlayColor, errorBackground} from '../constants';
import Icon from './Icon';
import Text from './Text';
import {convertRecentDateTime, callerId} from '../utils';

export interface RobocallDataProps {
  familyName: string;
  givenName: string;
  phoneNumber: string;
  date: string;
  style?: ViewStyle;
}

const RobocallItem = (props: RobocallDataProps) => {
  const {givenName, familyName, phoneNumber, date, style} = props;

  const dateInfo = convertRecentDateTime(date);

  return (
    <TouchableHighlight
      style={[
        {
          height: 70,
          paddingVertical: 16,
          paddingHorizontal: 16,
          alignItems: 'center',
          flex: 1,
          flexDirection: 'row',
          borderColor: 'lightgray',
          borderBottomWidth: 1,
          backgroundColor: '#fff',
        },
        style,
      ]}
      activeOpacity={0.8}
      underlayColor={underlayColor}>
      <>
        <View style={{flex: 1}}>
          <Icon
            name="block"
            library="entypo"
            size={20}
            color={errorBackground}
          />
        </View>
        <View style={{flex: 10, marginLeft: 6}}>
          <Text>{callerId(givenName, familyName, phoneNumber)}</Text>
          <Text semibold sm error>
            Blocked
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

export default RobocallItem;
