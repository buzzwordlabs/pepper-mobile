import TrackPlayer from 'react-native-track-player';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());

  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());
};
