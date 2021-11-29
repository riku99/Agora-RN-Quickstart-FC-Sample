import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

const token = 'token';
const channelName = 'channel';
const appId = 'appId';

const App = () => {
  const [engine, setEngine] = useState<RtcEngine>();
  const [peerIds, setPeerIds] = useState<number[]>([]);
  const [joinSucceed, setJoinSuccees] = useState(false);

  useEffect(() => {
    (async function () {
      const engineResult = await RtcEngine.create(appId);
      setEngine(engineResult);
    })();
  }, []);

  useEffect(() => {
    (async function () {
      if (engine) {
        await engine.enableVideo();
      }
    })();
  }, [engine]);

  useEffect(() => {
    const joined = (uid: number, elapsed: number) => {
      console.log('User joined', uid, elapsed);
      if (peerIds.indexOf(uid) === -1) {
        setPeerIds(current => current && [...current, uid]);
      }
    };

    const offline = (uid: number, reason: number) => {
      console.log('UserOffline', uid, reason);
      setPeerIds(current => current && current.filter(id => id !== uid));
    };

    const joinedSub = engine?.addListener('UserJoined', joined);
    const offlineSub = engine?.addListener('UserOffline', offline);

    return () => {
      joinedSub?.remove();
      offlineSub?.remove();
    };
  }, [peerIds, engine]);

  useEffect(() => {
    const success = (channel: string, uid: number, elapsed: number) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      setJoinSuccees(true);
    };
    engine?.addListener('JoinChannelSuccess', success);
  }, [engine]);

  const startCall = async () => {
    console.log('start');
    await engine?.joinChannel(token, channelName, null, 0);
  };

  const endCall = async () => {
    console.log('end');
    await engine?.leaveChannel();
    setJoinSuccees(false);
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity onPress={startCall} style={styles.button}>
            <Text style={styles.buttonText}> Start Call </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
        </View>
        {joinSucceed && (
          <View style={styles.fullView}>
            <RtcLocalView.SurfaceView
              style={styles.max}
              channelId={channelName}
              renderMode={VideoRenderMode.Hidden}
            />
            <ScrollView
              style={styles.remoteContainer}
              contentContainerStyle={{paddingHorizontal: 2.5}}
              horizontal={true}>
              {peerIds.map(value => {
                return (
                  <RtcRemoteView.SurfaceView
                    style={styles.remote}
                    uid={value}
                    channelId={channelName}
                    renderMode={VideoRenderMode.Hidden}
                    zOrderMediaOverlay={true}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const dimensions = Dimensions.get('screen');

const styles = StyleSheet.create({
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height - 100,
  },
  remoteContainer: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 5,
  },
  remote: {
    width: 150,
    height: 150,
    marginHorizontal: 2.5,
  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
});

export default App;
