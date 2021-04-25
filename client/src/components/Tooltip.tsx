import React, {useState} from 'react';
import {View} from 'react-native';
import DefaultTooltip, {TooltipProps} from 'react-native-walkthrough-tooltip';
import {isNumber} from 'lodash';
import Text from './Text';

interface State {
  showTooltip: boolean;
}
interface Props extends TooltipProps {
  children: Element;
  close?: () => void | Promise<void>;
  isVisible: boolean;
  header?: string;
  contentPadding?:
    | number
    | {
        paddingTop?: number;
        paddingRight?: number;
        paddingBottom?: number;
        paddingLeft?: number;
      };
}

const Tooltip = (props: Props) => {
  const initialState: State = {showTooltip: props.isVisible};
  const [state, setState] = useState(initialState);
  const {
    contentPadding,
    placement,
    children,
    content,
    onClose,
    header,
    close,
  } = props;
  return (
    <DefaultTooltip
      isVisible={state.showTooltip}
      contentStyle={{borderRadius: 25}}
      content={
        <View
          style={
            isNumber(contentPadding)
              ? {padding: contentPadding || 0}
              : {...contentPadding}
          }>
          {header && (
            <Text>
              <Text semibold center lg>
                {header}
                {'\n\n'}
              </Text>
              {content}
            </Text>
          )}
        </View>
      }
      placement={placement || 'bottom'}
      onClose={() => {
        close && close();
        setState({showTooltip: false});
      }}>
      {children}
    </DefaultTooltip>
  );
};

export default Tooltip;
