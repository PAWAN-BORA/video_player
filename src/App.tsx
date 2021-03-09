import React, {useReducer, useEffect, createRef, useRef, ReducerWithoutAction, ContextType} from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import StopIcon from '@material-ui/icons/Stop';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import './App.css';
import { act } from '@testing-library/react';

enum Action  {
  ChangeVolume ="changeVolume",
  ChangePosition = "changePosition",
  Play = "Play",
  ChangeCurrenTime = "changeCurrentTime",
  setTotalTime = "setTotalTime",
}

interface State {
  position:number,
  volume:number,
  isPlay:boolean,
  totalTime:string,
  currentTime:string
}
interface ActionType {
  type:String,
  payload:State
}
function reducer(state:State, action:ActionType):State {
  switch(action.type){
    case Action.ChangePosition: {
      return {...state, position:action.payload.position}
     
    }
    case Action.Play: {
      return {...state, isPlay:action.payload.isPlay}
     
    }
    case Action.ChangeCurrenTime: {
      
      return {...state, position:action.payload.position, currentTime:action.payload.currentTime}
      
    }
    case Action.setTotalTime: {
      return {...state, totalTime:action.payload.totalTime}
     
    }
    case Action.ChangeVolume: {
      return {...state, volume:action.payload.volume}
    }
    default: {
      return state;
    }
  }
  // let newState:State = action.payload;
  // return action.payload;
}

function App():React.ReactElement {
  const videoEle = useRef<HTMLVideoElement>(null);
  const fullScreenEle = useRef<HTMLDivElement & {
    mozRequestFullScreen(): Promise<void>;
    webkitRequestFullscreen(): Promise<void>;
    msRequestFullscreen(): Promise<void>;
  }>(null); 
  const sliderCircle = useRef<HTMLDivElement>(null);
  const isSliderActive = useRef(false);
  const volumePos = useRef("10");
  // let totalTime = useRef('00:00');
  // let videoHeight = useRef<number>();
  // let videoWidth = useRef<number>();

  const [state, dispatch]  =  useReducer(reducer, {position:0, volume:10, isPlay:false, totalTime:"00:00", currentTime:"00:00"})


  function setVideoWidthAndHeight(vidWidht:number, vidHeight:number) {
    let windowRatio = window.innerWidth/window.innerHeight;
    let videoRatio = vidWidht/vidHeight;
    if(windowRatio>videoRatio) {

      if(videoEle.current!=null) {
        console.log(window.innerWidth)
        videoEle.current.style.height = window.innerHeight + "px";
        videoEle.current.style.width = (window.innerHeight*videoRatio) + "px";
      }
      // console.log("sdf");
    } else  {
      if(videoEle.current!=null) {
        videoEle.current.style.width = window.innerWidth + "px";
        videoEle.current.style.height = (window.innerWidth/videoRatio) + "px";
      }
      console.log("234")
    }
    // let widht = window.innerWidth;
    // let height = window.innerHeight;
  }
  function resizeWindow() {
    if(videoEle.current!=null)
      setVideoWidthAndHeight(videoEle.current.videoWidth, videoEle.current.videoHeight);
  }
  function customContext(e:Event) {
    e.preventDefault();

  }
  function getTime(value:number):string {
    // console.log(value);
    let hours = 0;
    let minutes = Math.floor(value/60);
    let seconds = Math.round(value%60);
    // console.log(minutes, seconds)
    if(minutes>=60) {
      hours = Math.floor(minutes/60);
      minutes = Math.round(minutes%60);
      
      return `${hours<10?'0'+hours:hours}:${minutes<10?'0'+minutes:minutes}:${seconds<10?'0'+seconds:seconds}`
    } else {
      return `${minutes<10?'0'+minutes:minutes}:${seconds<10?'0'+seconds:seconds}`
    }

  }
  function changeCurrentTime() {
    // console.log(videoEle.current)
    if(videoEle.current==null) {
      return;
    }
    let cursorPos = 100*videoEle.current.currentTime/videoEle.current.duration;
    let currentTime = getTime(videoEle.current.currentTime);
    let newState:State = {...state, position:cursorPos, currentTime:currentTime}
    dispatch({type:Action.ChangeCurrenTime, payload:newState});
  }
  function videoEnded() {
    console.log(834793849);
    playOrPauseVideo("pause");

  }
  useEffect(()=>{
    // console.log(window.location.pathname);
    let params = window.location.pathname.split('/');
    // console.log(params[params.length-1]);
    fetch('http://localhost/sendVideo/?videoId=1')
    .then((res)=>{
      res.json()
      .then((data)=>{
        console.log(data.videoPath);
        if(videoEle.current!=null) {
          
          videoEle.current.src = data.videoPath;
          // fetch(data.videoPath, {mode:'no-cors'})
          // .then((res)=>{
          //   res.blob()
          //   .then((r)=>{
          //     console.log(r);
          //   })
            
          // })
          


          videoEle.current.onloadeddata =()=>{
            console.log(videoEle.current?.videoWidth, videoEle.current?.videoHeight);
            if(videoEle.current!=null) {
             
              
              setVideoWidthAndHeight(videoEle.current.videoWidth, videoEle.current.videoHeight);
              window.addEventListener('resize', resizeWindow);
              videoEle.current.addEventListener('timeupdate', changeCurrentTime);
              videoEle.current.addEventListener('ended', videoEnded);
              videoEle.current.addEventListener('contextmenu', customContext);
              let totalTime = getTime(videoEle.current.duration);
              let newState = {...state, totalTime:totalTime}
              dispatch({type:Action.setTotalTime, payload:newState});
            }
          }
        }
      })
    })
    .catch((err)=>{
      console.log(err)
      window.removeEventListener('resize', resizeWindow);
      videoEle.current?.removeEventListener('timeupdate', changeCurrentTime);
      videoEle.current?.removeEventListener('ended', videoEnded);
      videoEle.current?.removeEventListener('contextmenu', customContext);
    })

    return(()=>{
      console.log("dsf");
    })
    // let param =
    // getVideo() 
  }, [])
  
  // function getCursorPos() {
  //   if(videoEle.current==null) {
  //     return;
  //   }
  //   let currentTime = videoEle.current.currentSrc;
    

  // }
  function changePos(event:React.MouseEvent<HTMLDivElement>) {
    console.log(event);
    
    let progressBar = event.target as HTMLDivElement;
    let boundRect = progressBar.getBoundingClientRect();
    console.log(boundRect)
    // console.log(837492)
    if(videoEle.current!=null) {
      let clickPos = event.pageX-boundRect.x
      if(clickPos<0) {
        clickPos = 0;
      }
      let timeValue = clickPos *100/boundRect.width;
      console.log(timeValue, clickPos)
      let newCurrentTime = videoEle.current.duration*timeValue/100;
      console.log(newCurrentTime)
      videoEle.current.currentTime  = newCurrentTime;
    }
  }
  function checkPos(pos:string) {
    let newState  = {...state, position:Number(pos)};
    dispatch({type:Action.ChangePosition, payload:newState});
    if(videoEle.current!=null) {
      let timeValue = Number(pos);
      let newCurrentTime = videoEle.current.duration*timeValue/100
      videoEle.current.currentTime  = newCurrentTime;
    }
  }
  function changeVolume(value:string, isBtn=false) {
    // console.log(value);
    if(!isBtn && value!="0") {
      volumePos.current = value;
    }
    let newState  = {...state, volume:Number(value)};
    dispatch({type:Action.ChangeVolume, payload:newState});
    if(videoEle.current!=null) {
      let newVolume = Number(value)/10;
      videoEle.current.volume  = newVolume;
    }
  }
  function Fullscreen() {
    if(fullScreenEle.current==null) {
      return;
    }
    
    let isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null);
    if (!isInFullScreen) {
        if (fullScreenEle.current.requestFullscreen) {
            fullScreenEle.current.requestFullscreen();
        }
        else if (fullScreenEle.current.mozRequestFullScreen) { /* Firefox */
            fullScreenEle.current.mozRequestFullScreen();
        }
        else if (fullScreenEle.current.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            fullScreenEle.current.webkitRequestFullscreen();
        }
        else if (fullScreenEle.current.msRequestFullscreen) { /* IE/Edge */
            fullScreenEle.current.msRequestFullscreen();
        }
    } else {
      document.exitFullscreen();
    }
  }
  function playOrPauseVideo(val:string) {
    if(videoEle.current==null) {
      return;
    }
    console.log(val);
    
    switch(val) {
      case 'play': {
        let newState  = {...state, isPlay:true};
        videoEle.current.play();
        dispatch({type:Action.Play, payload:newState})
        break;
      }
      case 'pause': {
        let newState  = {...state, isPlay:false};
        videoEle.current.pause();
        dispatch({type:Action.Play, payload:newState})
        break;
      }
      case 'stop': {
        let newState  = {...state, isPlay:false};
        videoEle.current.pause();
        videoEle.current.currentTime = 0;
        dispatch({type:Action.Play, payload:newState})
        break;
      }
    }
  }

  let scaleX = `scaleX(${state.position/100})`;
  return (
    <div className="App" ref={fullScreenEle}>
      <div className="player" >
        <video ref={videoEle} className="video">Video tag is not supported in this browser</video>
        <div className="controlls">
          <div className="slider_box" onClick={(e)=>{changePos(e)}}>
            <div className="progress" style={{transform:scaleX}} ></div>
            {/* <div className="slider_circle" ref={sliderCircle} onMouseDown={} onMouseMove={} onMouseUp={}></div> */}
            {/* <input  type="range" min="0" max="100" value={state.position} onChange={(e)=>{checkPos(e.target.value)}} /> */}
          </div>

          <div className="bottom">
            <div className="play_and_stop_btn">
              <span>{state.isPlay?<PauseIcon onClick={()=>{playOrPauseVideo("pause")}}/>:<PlayArrowIcon onClick={()=>{playOrPauseVideo("play")}}/>}</span>
              <span><StopIcon onClick={()=>{playOrPauseVideo("stop")}}/></span>
            </div>
            <span>{state.totalTime}/{state.currentTime}</span>
            <div className="sound">
              {state.volume==0?
                <span><VolumeOffIcon onClick={()=>{changeVolume(volumePos.current, true)}}/></span>:
                <span><VolumeUpIcon onClick={()=>{changeVolume("0", true)}}/></span>
              }
              <span><input className="vol_slider" type="range" min="0" max="10" value={state.volume} onChange={(e)=>{changeVolume(e.target.value)}}/></span>
            </div>
            <span><FullscreenIcon onClick={Fullscreen}/></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
