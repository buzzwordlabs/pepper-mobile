import React from 'react';
import {TextStyle, ViewStyle} from 'react-native';
import DefaultModalSelector from 'react-native-modal-selector';

import {secondaryColor, topOffset, smallIos} from '../constants';
import {CarrierObject, ForwardingModalData} from '../utils/forwarding';
import Button from './Button';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

interface Props {
  buttonText: string;
  buttonTextStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  data: ForwardingModalData;
  onChange: (carrier: CarrierObject) => void;
}

class ModalSelector extends React.Component<Props> {
  selector: any = React.createRef();
  render() {
    const {
      buttonText,
      buttonTextStyle,
      buttonStyle,
      data,
      onChange,
    } = this.props;

    return (
      <DefaultModalSelector
        data={data as any}
        ref={selector => {
          this.selector = selector;
        }}
        maxFontSizeMultiplier={1.5}
        animationType="fade"
        style={{width: '100%'}}
        cancelText="Cancel"
        cancelTextStyle={{
          fontSize: 20,
          fontWeight: '500',
          color: secondaryColor,
          fontFamily: 'IBMPlexSans',
        }}
        cancelStyle={{paddingVertical: verticalScale(10)}}
        cancelContainerStyle={{
          backgroundColor: 'white',
          borderRadius: 4,
        }}
        customSelector={
          <Button
            onPress={() => this.selector.open()}
            title={buttonText}
            textStyle={buttonTextStyle}
            style={buttonStyle}
          />
        }
        overlayStyle={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          paddingHorizontal: 30,
        }}
        optionContainerStyle={{
          backgroundColor: 'white',
          marginTop: topOffset,
        }}
        optionTextStyle={{
          fontSize: 20,
          color: secondaryColor,
          fontFamily: 'IBMPlexSans',
        }}
        optionStyle={{
          paddingVertical: verticalScale(16),
        }}
        sectionTextStyle={{
          fontSize: 18,
          color: 'grey',
          fontFamily: 'IBMPlexSans-SemiBold',
        }}
        onChange={onChange}
      />
    );
  }
}
export default ModalSelector;
