import React from 'react';
import {ViewStyle, View, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {statusBarHeight, bottomOffset} from '../constants';

interface Props {
  style?: ViewStyle;
  parentStyle?: ViewStyle;
  extraScrollHeight?: number;
  children: any;
  FloorComponent?: Element;
}

export default function ParentView(props: Props) {
  const {FloorComponent} = props;

  const renderInnerView = () => {
    return (
      <View
        style={[
          {
            marginHorizontal: 20,
            marginTop: statusBarHeight,
            marginBottom: bottomOffset,
            paddingBottom: 10,
            flex: 1,
            justifyContent: 'center',
          },
          props.style,
        ]}>
        {props.children}
      </View>
    );
  };

  const renderScrollView = () => {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={props.extraScrollHeight || 0}
        contentContainerStyle={props.parentStyle}>
        {renderInnerView()}
      </KeyboardAwareScrollView>
    );
  };

  if (props.FloorComponent) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        {renderScrollView()}
        {
          <View
            style={{
              marginHorizontal: props.style?.marginHorizontal || 20,
              marginBottom: 0,
            }}>
            {FloorComponent}
          </View>
        }
      </SafeAreaView>
    );
  } else return renderScrollView();
}
