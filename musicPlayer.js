

import React, {Component,PureComponent} from 'react'
import {View, Text, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, Image, Slider, Animated, Easing, Platform, findNodeHandle, Dimensions} from 'react-native'
import {commonStyle} from './commonStyle'
import Video from 'react-native-video'
import FontAwesome from 'react-native-vector-icons/FontAwesome'


const mockData = []
const deviceInfo = {
  deviceWidth: Dimensions.get('window').width,
  deviceHeight: Platform.OS === 'ios' ? Dimensions.get('window').height : Dimensions.get('window').height - 24
}

const header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

const play = ()=>{
  return(
    <Text>播放</Text>
  )
}
const paused = ()=>{
  return(
    <Text>暂停</Text>
  )
}

const musicListUrl = 'http://dlbcdn.ocm.ainirobot.com/manual/0e8ea76b86a97bddd1ca0ca4b35601b8.mp3'
const musicDetail = 'http://xiamirun.avosapps.com/run?song=http://www.xiami.com/song/'

export default class MusicPlayer extends PureComponent {

  constructor(props) {
    super(props)
    this.rotation = false
    this.musicList = []
    this.state = {
      loading:false,
      viewRef: null,
      paused: false, // false: 表示播放，true: 表示暂停
      duration: 0.00,
      slideValue: 0.00,
      currentTime: 0.00,
      currentIndex: 0,
      playMode: 0,
      spinValue: new Animated.Value(0),
      playIcon: 'pause',
      playModeIcon: 'music_paused_o',
      msg:[]
    }
    this.spinAnimated = Animated.timing(this.state.spinValue, {
      toValue: 1,
      duration: 20000,
      easing: Easing.inOut(Easing.linear)
    })
  }

  formatMediaTime(duration) {
    let min = Math.floor(duration / 60)
    let second = duration - min * 60
    min = min >= 10 ? min : '0' + min
    second = second >= 10 ? second : '0' + second
    return min + ':' + second
  }

  spining() {
    if (this.rotation) {
      this.state.spinValue.setValue(0)
      this.spinAnimated.start(() => {
        this.spining()
      })
    }
  }

  spin() {
    this.rotation = !this.rotation
    if (this.rotation) {
      this.spinAnimated.start(() => {
        this.spinAnimated = Animated.timing(this.state.spinValue, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.linear)
        })
        this.spining()
      })
    } else {
      this.state.spinValue.stopAnimation((oneTimeRotate) => {
        this.spinAnimated = Animated.timing(this.state.spinValue, {
          toValue: 1,
          duration: (1 - oneTimeRotate) * 20000,
          easing: Easing.inOut(Easing.linear)
        })
      })
    }
  }

  componentWillMount() {

    // this.setState({musicInfo: mockData[this.state.currentIndex]})
    this.getxiamiMusic(408303)
  }

  getxiamiMusic(musicId) {
    this.setState({loading:true});
    fetch(`http://10.101.3.23/cmrs/fresh?uid=${musicId}`)
      .then((response)=>{
        return response.json()
      })
      .then((responseData) => {
        let msg = responseData.recommend[0]
        let data = {}
        data.title = msg.name
        data.artist_name = msg.artist_name
        data.cover = (msg.song_image && msg.song_image.length>0)?msg.song_image : 'http://img.yidianling.com/file/2016/07/inu911sfu2qf1jwe.jpg!s330x330';
        data.url = msg.url
        mockData.push(data)
        this.setState({msg: mockData,currentIndex:this.state.currentIndex+=1},()=>{
          this.spin()
            this.player.seek(0)
        })

      })
      .catch((error) => {
        this.spin()
        console.log(error)
      })
  }

  setDuration(duration) {
    this.setState({duration: duration.duration})
  }

  setTime(data) {
    let sliderValue = parseInt(this.state.currentTime)
    this.setState({
      slideValue: sliderValue,
      currentTime: data.currentTime
    })
  }

  nextSong(currentIndex) {
    this.reset()
    this.getxiamiMusic(408303)
    this.spin()
    // currentIndex === this.state.musicList.length ? currentIndex = 0 : currentIndex
    // let newSong = this.state.musicList[currentIndex]
    // let music_id = newSong.music_id
    // if (!isNaN(parseInt(music_id))) {
    //   this.getxiamiMusic(music_id)
    //   this.setState({currentIndex})
    // } else {
    //   this.nextSong(currentIndex + 1)
    //   this.showMessageBar('抱歉')('没有找到音乐信息，已帮你切换到下一首')('error')
    // }
  }

  preSong(currentIndex) {
    this.spin()
    if(currentIndex <=0){
      this.showMessageBar('你好')('这已经是第一首啦')('console')
    }else{
      this.setState({currentIndex: currentIndex-1})
    }


    // currentIndex === -1 ? currentIndex = this.state.musicList.length -1 : currentIndex
    // let newSong = this.state.musicList[currentIndex]
    // let music_id = newSong.music_id
    // if (!isNaN(parseInt(music_id))) {
    //   this.getxiamiMusic(music_id)
    //   this.setState({currentIndex})
    // } else {
    //   this.preSong(currentIndex - 1)
    //   this.showMessageBar('抱歉')('没有找到音乐信息，已帮你切换到下一首')('error')
    // }
  }

  reset() {
    this.setState({
      currentTime: 0.00,
      slideValue: 0.00
    })
  }

  play() {
    this.spin()
    this.setState({
      paused: !this.state.paused,
      playIcon: this.state.paused ? 'pause' : 'play'
    })
  }

  playMode(playMode) {
    playMode ++
    playMode = playMode === 3 ? playMode = 0 : playMode
    switch (playMode) {
      case 0:
        this.setState({playMode, playModeIcon: 'music_cycle_o'})
        break
      case 1:
        this.setState({playMode, playModeIcon: 'music_single_cycle_o'})
        break
      case 2:
        this.setState({playMode, playModeIcon: 'music_random_o'})
        break
      default:
        break
    }
  }
  loadStart(){
    // console.log(1111111,this)
    // this.refs.player.presentFullscreenPlayer()//会调用系统给的播放器进行播放
  }
  onEnd(data) {
    console.log(11111111,data)
      this.nextSong()

  }

  videoError(error) {title
    this.showMessageBar('播放器报错啦！')(error)('error')
  }

  showMessageBar = title => msg => type => {
    Alert.alert(title,msg);
  }

  imageLoaded() {
    console.log(this.state.msg)
  }

  render() {
    let musicInfo = this.state.msg[this.state.currentIndex<=0?0:this.state.currentIndex-1]
    return (
      musicInfo && musicInfo.url?
        <View style={styles.container}>
          <Image
            ref={(img) => { this.backgroundImage = img}}
            style={styles.bgContainer}
            source={{uri: musicInfo && musicInfo.cover ? musicInfo.cover:'http://img.yidianling.com/file/2016/07/inu911sfu2qf1jwe.jpg!s330x330'}}
            resizeMode='cover'
            onLoadEnd={() => this.imageLoaded()}
          />
          <View style={styles.bgContainer}>
            <View style={styles.navBarStyle}>
              <View style={styles.navBarContent}>
                <TouchableOpacity
                  style={{marginTop: 5}}
                  onPress={() => alert('pop')}
                >
                </TouchableOpacity>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.title}>{musicInfo&&musicInfo.title?musicInfo.title:'hello'}</Text>
                  <Text style={styles.subTitle}>{ musicInfo&&musicInfo.artist_name?musicInfo.artist_name:'啦啦啦' }</Text>
                </View>
                <TouchableOpacity
                  style={{marginTop: 5}}
                  onPress={() => alert('分享')}
                >

                </TouchableOpacity>
              </View>
            </View>
            <View
              style={styles.djCard}>
            </View>
            <Image
              style={{width: 260, height: 260, alignSelf: 'center', position: 'absolute', top: 190}}
              source={require('./bgCD.png')}
            />
            <Animated.Image
              style={{
                width: 170,
                height: 170,
                borderRadius: 85,
                alignSelf: 'center',
                position: 'absolute', top: 235,
                transform: [{rotate: this.state.spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}]
              }}
              source={{uri: musicInfo&&musicInfo.cover?musicInfo.cover:'http://img.yidianling.com/file/2016/07/inu911sfu2qf1jwe.jpg!s330x330'}}/>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 50, justifyContent: 'space-around', bottom: -60}}>

              </View>
              <View style={styles.progressStyle}>
                <Text style={{width: 35, fontSize: 11, color: commonStyle.white, marginLeft: 5}}>{this.formatMediaTime(Math.floor(this.state.currentTime))}</Text>
                <Slider
                  style={styles.slider}
                  value={this.state.slideValue}
                  maximumValue={this.state.duration}
                  minimumTrackTintColor={commonStyle.themeColor}
                  maximumTrackTintColor={commonStyle.iconGray}
                  step={1}
                  onValueChange={value => {
                    this.setState({currentTime: value})
                  }}
                  onSlidingComplete={value => {
                    this.player.seek(value)
                  }}
                />
                <View style={{width: 35, alignItems: 'flex-end', marginRight: 5}}>
                  <Text style={{fontSize: 11, color: commonStyle.white}}>{this.formatMediaTime(Math.floor(this.state.duration))}</Text>
                </View>
              </View>
              <View style={styles.toolBar}>
                <TouchableOpacity
                  style={{width: 50, marginLeft: 5}}
                  onPress={() => this.playMode(this.state.playMode)}
                >
                  {/*<FontAwesome name='play' size={35} color={commonStyle.white}/>*/}
                </TouchableOpacity>
                <View style={styles.cdStyle}>
                  <TouchableOpacity
                    onPress={() => this.preSong(this.state.currentIndex - 1)}
                  >
                    <FontAwesome name='step-backward' size={35} color={commonStyle.white}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{width: 35, height: 35, borderRadius: 20, borderColor: commonStyle.white, justifyContent: 'center', alignItems: 'center'}}
                    onPress={() => this.play()}
                  >
                    <FontAwesome name={`${this.state.playIcon}`} size={35} color={commonStyle.white}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.nextSong(this.state.currentIndex + 1)}
                  >
                    <FontAwesome name='step-forward' size={35} color={commonStyle.white}/>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{width: 50, alignItems: 'flex-end', marginRight: 5}}
                >

                </TouchableOpacity>
              </View>
            </View>
            <Video
                ref={(ref) => {
                    this.player = ref
                }}
                source={{uri: musicInfo && musicInfo.url?musicInfo.url:'http://dlbcdn.ocm.ainirobot.com/405/0b2b3c8e3339203fe0d3505eb4e5f4a6.mp3'}}
              volume={1.0}
                allowsExternalPlayback={true}
              paused={this.state.paused}
              playInBackground={true}
              playWhenInactive={true}
              onLoadStart={this.loadStart}
              onLoad={data => this.setDuration(data)}
              onProgress={(data) => this.setTime(data)}
              onEnd={(data) => this.onEnd(data)}
              onError={(data) => this.videoError(data)}
              onBuffer={this.onBuffer}
              onTimedMetadata={this.onTimedMetadata}/>
          </View>
        </View>:<View/>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bgContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: deviceInfo.deviceHeight,
    width: deviceInfo.deviceWidth
  },
  navBarStyle: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: deviceInfo.deviceWidth,
    height: 64,
    borderWidth: 0.5,
    borderColor: commonStyle.lineColor
  },
  navBarContent: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  title: {
    color: commonStyle.white,
    fontSize: 14
  },
  subTitle: {
    color: commonStyle.white,
    fontSize: 11,
    marginTop: 5
  },
  djCard: {
    width: 270,
    height: 270,
    marginTop: 185,
    borderColor: commonStyle.gray,
    borderWidth: 10,
    borderRadius: 190,
    alignSelf: 'center',
    opacity: 0.2
  },
  playerStyle: {
    position: 'absolute',
    width: deviceInfo.deviceWidth,
  },
  progressStyle: {
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 80
  },
  slider: {
    flex: 1,
    marginHorizontal: 5,
  },
  toolBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    position: 'absolute',
    bottom: 0,
    marginVertical: 30
  },
  cdStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }
})