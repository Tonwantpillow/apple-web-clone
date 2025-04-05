import React, { useEffect, useRef, useState } from 'react'
import { hightlightsSlides } from '../constants'
import gsap from 'gsap';
import { pauseImg, playImg, replayImg } from '../utils';
import { useGSAP } from '@gsap/react';

const VideoCarousel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);
    const [video, setVideo] = useState({
        isEnd: false, startPlay: false, 
        videoId: 0, isLastVideo: false,
        isPlaying: false
    })

    const [loadedData, setLoadedData] = useState([])
    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useGSAP(()=>{
        gsap.to('#slider',{
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: 'power2.inOut'
        })
        gsap.to('#video',{
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none',
            },
            onComplete: () => {
                setVideo((prev)=>({
                    ...prev,
                    startPlay: true,
                    isPlaying: true
                }))
            }
        })
    },[isEnd, videoId])

    useEffect(()=>{
        if(loadedData.length > 3) {
            if(!isPlaying) {
                videoRef.current[videoId].pause();
            } else {
                startPlay && videoRef.current[videoId].play();
            }
        }
    },[startPlay, videoId, isPlaying, loadedData])
    useEffect(()=>{
        let currentProgress = 0;
        let span = videoSpanRef.current;

        if(span[videoId]){
            let anim = gsap.to(span[videoId], {
                onUpdate: ()=>{
                    const progress = Math.ceil(anim.progress() * 100 );

                    if(progress != currentProgress) {
                        currentProgress = progress;
                        gsap.to(videoDivRef.current[videoId], {
                            width: window.innerWidth < 760 ?
                            '10vw' : window.innerWidth < 1200 ?
                            '10VW' : '4vw'
                        })
                    }
                    gsap.to(span[videoId], {
                        width: `${currentProgress}%`,
                        backgroundColor: 'white'
                    })
                },
                onComplete: ()=>{
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId],{
                            width: '12px',
                        })
                        gsap.to(span[videoId],{
                            backgroundColor: '#afafaf',
                        })
                    }
                    
                }
            })
            if(videoId === 0) {
                anim.restart();
            }
            const animUpdate = () => {
                anim.progress(videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration)
            }
            if (isPlaying) {
                gsap.ticker.add(animUpdate)
            }else {
                gsap.ticker.remove(animUpdate)
            }
        }
    },[videoId, startPlay])
    const handleProcess = (type, i) => {
        switch(type) {
            case 'video-end':
                setVideo((prev)=>({...prev, isEnd:true, videoId: i+1}))
                break;
            case 'video-last': 
                setVideo((prev)=>({...prev,isLastVideo:true}))
                break;
            case 'video-reset':
                setVideo((prev)=>({...prev, isLastVideo: false, videoId: 0}))
                break;
            case 'play':
                setVideo((prev)=>({...prev, isPlaying: !prev.isPlaying}))
                break;
            case 'pause':
                setVideo((prev)=>({...prev, isPlaying: !prev.isPlaying}))
                break;
            default:
                return video;
        }
    }
    const handleLoadedMetadata = (i,e) => {
        setLoadedData((prev)=>[...prev, e])
    }
  return (
    <>
        <div className='flex items-center'>
            {hightlightsSlides.map((list,i)=>(
                <div key={list.id} id="slider"
                className='sm:pr-20 pr-10'>
                    <div className='video-carousel_container'>
                        <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                            <video id="video" playsInline={true} preload='auto' muted
                            className={`${
                                list.id === 2 && 'translate-x-44'}
                                pointer-event-none
                            `}
                            ref={(elm) => (videoRef.current[i] = elm)}
                            onPlay={()=> {
                                setVideo((prev)=>({
                                    ...prev, isPlaying: true
                                }))
                            }}
                            onEnded={()=>{
                                i !== 3
                                ? handleProcess('video-end', i)
                                : handleProcess('video-last')
                            }}
                            onLoadedMetadata={(e)=>handleLoadedMetadata(i,e)}>
                                <source src={list.video} type="video/mp4"/> 
                            </video>
                        </div>
                        <div className='absolute top-12 left-[5%] z-10'>
                            {list.textLists.map((text)=>(
                                <p key={text} className='md:text-2xl text-xl font-medium'>
                                    {text}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className='relative flex-center mt-10'>
            <div className='flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full'>
                {videoRef.current.map((_, i)=> (
                    <span 
                    key={i}
                    ref={(elm)=>{videoDivRef.current[i] = elm}}
                    className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'
                    >
                        <span className='absolute h-full w-full rounded-full' ref={(elm)=>(videoSpanRef.current[i] = elm)}/>
                    </span>
                ))}
            </div>
            <button className='control-btn'>
                <img src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'}
                onClick={
                isLastVideo ? ()=> handleProcess('video-reset') 
                : !isPlaying ? ()=> handleProcess('play') 
                : () => handleProcess('pause')}/>
            </button>
        </div>
    </>
  )  
  
}

export default VideoCarousel
