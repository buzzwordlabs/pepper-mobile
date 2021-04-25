import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Transition, Transitioning} from 'react-native-reanimated';

import {FAQ as FAQHero} from '../assets/images';
import {Icon, Text, Image} from '../components';
import {request} from '../utils';
import {NavigationProps} from './types';
import {sortBy} from 'lodash';

interface Props extends NavigationProps {
  faqs: FAQObject[];
}

type FAQObject = {question: string; answer: string; id: string};

interface State {
  faqs: FAQObject[];
  isLoading: boolean;
}

export default class FAQ extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'FAQs',
  };

  state = {
    faqs: [],
    isLoading: false,
  };

  componentDidMount = async () => {
    this.setState({isLoading: true});
    const response = await request({url: '/faq/all', method: 'GET'});
    if (response.ok) {
      const sortedFaqs = sortBy(response.data.faq, ['id']);
      this.setState({faqs: sortedFaqs});
    }
    this.setState({isLoading: false});
  };

  render() {
    return (
      <SafeAreaView style={{marginTop: 10}}>
        {this.state.isLoading ? (
          <ActivityIndicator size="small" style={{marginTop: 30}} />
        ) : (
          <FlatList
            data={this.state.faqs}
            ListHeaderComponent={
              <Image
                height={200}
                width={200}
                style={{
                  resizeMode: 'cover',
                  alignSelf: 'center',
                }}
                source={FAQHero}
              />
            }
            initialNumToRender={1}
            maxToRenderPerBatch={5}
            renderItem={({item: {question, answer}}) => (
              <SingleFAQ question={question} answer={answer} />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </SafeAreaView>
    );
  }
}

const SingleFAQ = (props: {question: string; answer: string}) => {
  const ref: any = useRef();

  const [isExpanded, setIsExpanded] = useState(false);

  const parseFaqAnswer = (answer: string) => answer.replace(/ \\n /g, '\n\n');

  const transition = (
    <Transition.Sequence>
      <Transition.Out type="fade" durationMs={100} />
      <Transition.Change interpolation="easeIn" />
      <Transition.In type="fade" durationMs={100} />
    </Transition.Sequence>
  );

  return (
    <Transitioning.View ref={ref} transition={transition}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setIsExpanded(!isExpanded);
          ref.current.animateNextTransition();
        }}
        style={styles.container}>
        <View style={styles.titleContainer}>
          <Text lg semibold highlight={isExpanded}>
            {props.question}
          </Text>
          <Icon
            library="fontAwesome"
            name={`caret-${isExpanded ? 'up' : 'down'}`}
            size={20}
            color="gray"
          />
        </View>
        {isExpanded && (
          <View>
            <Text style={styles.descriptionText}>
              {parseFaqAnswer(props.answer)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Transitioning.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  descriptionText: {
    marginTop: 30,
    marginBottom: 15,
  },
});
