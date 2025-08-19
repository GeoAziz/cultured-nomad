'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    VideoIcon,
    PhoneIcon,
    MicIcon,
    MicOffIcon,
    VideoOffIcon,
    PhoneOffIcon,
    BarChart2
} from 'lucide-react';
import './call-modal.css';

interface NetworkQualityProps {
    quality: number; // 0-4, where 4 is best quality
}

const NetworkQuality = ({ quality }: NetworkQualityProps) => (
    <div className="network-quality">
        {[...Array(4)].map((_, i) => (
            <div
                key={i}
                className={`signal-bar h-${i + 2} ${i < quality ? 'active' : ''}`}
            />
        ))}
    </div>
);

interface CallTimerProps {
    startTime: number;
}

const CallTimer = ({ startTime }: CallTimerProps) => {
    const [duration, setDuration] = useState<string>('00:00');

    useEffect(() => {
        const timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            setDuration(
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    return <div className="call-timer">{duration}</div>;
};

interface CallControlsProps {
    isVideo: boolean;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
}

const CallControls = ({
    isVideo,
    isAudioMuted,
    isVideoMuted,
    onToggleAudio,
    onToggleVideo,
    onEndCall
}: CallControlsProps) => (
    <div className="call-controls">
        <div className="flex justify-center gap-4">
            <Button
                variant="outline"
                size="icon"
                className="call-button"
                onClick={onToggleAudio}
            >
                {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
            </Button>
            
            {isVideo && (
                <Button
                    variant="outline"
                    size="icon"
                    className="call-button"
                    onClick={onToggleVideo}
                >
                    {isVideoMuted ? <VideoOffIcon /> : <VideoIcon />}
                </Button>
            )}
            
            <Button
                variant="destructive"
                size="icon"
                className="call-button end-call"
                onClick={onEndCall}
            >
                <PhoneOffIcon />
            </Button>
        </div>
    </div>
);

interface CallModalProps {
    isOpen: boolean;
    callType: 'audio' | 'video';
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    onEndCall: () => void;
    peerName?: string;
}

export const CallModal = ({
    isOpen,
    callType,
    remoteStream,
    localStream,
    onEndCall,
    peerName = 'Peer'
}: CallModalProps) => {
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [networkQuality, setNetworkQuality] = useState(4);
    const [callStartTime, setCallStartTime] = useState<number>(0);

    // Monitor network quality
    useEffect(() => {
        if (remoteStream) {
            const checkQuality = () => {
                // Simulate network quality check (replace with actual WebRTC stats)
                const quality = Math.floor(Math.random() * 2) + 3; // Random between 3-4
                setNetworkQuality(quality);
            };

            const interval = setInterval(checkQuality, 5000);
            return () => clearInterval(interval);
        }
    }, [remoteStream]);

    useEffect(() => {
        if (remoteStream && !callStartTime) {
            setCallStartTime(Date.now());
        }
    }, [remoteStream]);

    const handleToggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const handleToggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onEndCall()} modal={true}>
            <DialogContent className="sm:max-w-[90vw] h-[80vh] p-0 border-none bg-black">
                <DialogHeader className="sr-only">
                    <DialogTitle>{`${callType === 'video' ? 'Video' : 'Voice'} Call with ${peerName}`}</DialogTitle>
                </DialogHeader>

                <div className="video-container">
                    {/* Remote Stream (Main View) */}
                    {remoteStream && callType === 'video' ? (
                        <video
                            ref={(video) => {
                                if (video) video.srcObject = remoteStream;
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 call-connecting">
                                {callType === 'video' ? 
                                    <VideoIcon className="w-12 h-12 text-primary" /> : 
                                    <PhoneIcon className="w-12 h-12 text-primary" />
                                }
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                {remoteStream ? 'Connected' : 'Connecting to'} {peerName}
                            </h3>
                            {!remoteStream && (
                                <p className="connection-status">
                                    {callType === 'video' ? 'Starting video call' : 'Starting voice call'}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Local Stream (Picture-in-Picture) */}
                    {localStream && callType === 'video' && (
                        <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20">
                            <video
                                ref={(video) => {
                                    if (video) video.srcObject = localStream;
                                }}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover video-mirror"
                            />
                        </div>
                    )}

                    {/* User Info Bar */}
                    <div className="user-info">
                        <h3 className="text-lg font-medium text-white">{peerName}</h3>
                    </div>

                    {/* Network Quality and Timer */}
                    {remoteStream && (
                        <>
                            <NetworkQuality quality={networkQuality} />
                            <CallTimer startTime={callStartTime} />
                        </>
                    )}

                    {/* Call Controls */}
                    <CallControls
                        isVideo={callType === 'video'}
                        isAudioMuted={isAudioMuted}
                        isVideoMuted={isVideoMuted}
                        onToggleAudio={handleToggleAudio}
                        onToggleVideo={handleToggleVideo}
                        onEndCall={onEndCall}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
};
