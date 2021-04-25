import React from 'react';
import {View} from 'react-native';
import {NavigationStackProp} from 'react-navigation-stack';
import Video from 'react-native-video';
import {introVideo} from '../assets/videos';

import {pepperLogo} from '../assets/images';
import {Button, ParentView, Image} from '../components';
import {verticalScale, moderateScale} from 'react-native-size-matters';

interface Props {
  navigation: NavigationStackProp;
}

export default class Intro extends React.Component<Props, {}> {
  player: any;
  static navigationOptions = {
    title: 'Welcome',
  };

  render() {
    return (
      <ParentView
        style={{
          flex: 1,
          marginHorizontal: 0,
          marginBottom: moderateScale(50),
          justifyContent: 'space-evenly',
        }}>
        <View>
          <Image
            source={pepperLogo}
            width={275}
            height={80}
            style={{
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
          <Video
            repeat
            source={introVideo}
            resizeMode="contain"
            style={{
              width: '100%',
              height: verticalScale(300),
              alignSelf: 'center',
            }}
          />
        </View>
        <View style={{marginHorizontal: 20}}>
          <Button
            title="Login"
            onPress={() => this.props.navigation.push('Login')}
          />
          <Button
            title="Create Account"
            onPress={() => this.props.navigation.push('Signup')}
            outline
          />
          <Button
            textOnly
            title="FAQs"
            onPress={() => this.props.navigation.push('FAQ')}
          />
        </View>
      </ParentView>
    );
  }
}
