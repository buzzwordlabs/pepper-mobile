import React from 'react';
import {View, ScrollView, TouchableOpacity, Keyboard} from 'react-native';
import Text from './Text';
import DefaultModal from 'react-native-modal';
import {window} from '../constants';

interface ModalProps {
  modalButtons?: MappedButtonProps[];
  isVisible: boolean;
  children: Element;
  scrollable?: boolean;
  modalHeight?: number;
  onBackdropPress?: () => void | Promise<void>;
  onBackButtonPress?: () => void | Promise<void>;
  onModalHide?: () => void | Promise<void>;
}

export default function Modal(props: ModalProps) {
  const totalButtons = props.modalButtons ? props.modalButtons.length : 0;
  const modalHeight =
    props.modalHeight || window.height * 0.3 + modalButtonHeight * totalButtons;
  const multilineButtons = totalButtons > 2;
  return (
    <DefaultModal
      isVisible={props.isVisible}
      onBackdropPress={props.onBackdropPress || Keyboard.dismiss}
      avoidKeyboard
      onBackButtonPress={props.onBackButtonPress}>
      <View
        style={{
          borderRadius: modalHeight * 0.05,
          height: modalHeight,
          backgroundColor: '#FAFAFA',
        }}>
        {props.scrollable ? (
          <ScrollView
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              marginHorizontal: modalHeight * 0.075,
            }}>
            {props.children}
          </ScrollView>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              marginHorizontal: modalHeight * 0.075,
            }}>
            {props.children}
          </View>
        )}

        {totalButtons > 0 && (
          <View
            style={{
              flexDirection: multilineButtons ? 'column' : 'row',
              borderTopWidth: 1,
              borderColor: '#A4A4A4',
              justifyContent: 'center',
            }}>
            {props.modalButtons!.map(
              (button: MappedButtonProps, index: number) => {
                return (
                  <ModalButton
                    isFirst={index === 0}
                    multilineButtons={multilineButtons}
                    buttonText={button.buttonText}
                    onPress={button.onPress}
                  />
                );
              },
            )}
          </View>
        )}
      </View>
    </DefaultModal>
  );
}

const modalButtonHeight = 50;

interface ModalButtonProps extends MappedButtonProps {
  multilineButtons: boolean;
  isFirst: boolean;
}

interface MappedButtonProps {
  buttonText: string | Element;
  onPress: () => void | Promise<void>;
}

const ModalButton = (props: ModalButtonProps) => {
  const {multilineButtons} = props;
  return (
    <View style={{justifyContent: 'center'}}>
      <TouchableOpacity
        style={{
          borderLeftWidth: multilineButtons ? 0 : props.isFirst ? 0 : 1,
          borderTopWidth: !props.isFirst && multilineButtons ? 1 : 0,

          borderColor: '#A4A4A4',
          width: multilineButtons ? '100%' : 160,
          height: modalButtonHeight,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={props.onPress}>
        <Text>{props.buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};
