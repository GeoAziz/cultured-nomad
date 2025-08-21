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
    isSpeakerOn: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onToggleSpeaker: () => void;
    onEndCall: () => void;
}

const CallControls = ({
    isVideo,
    isAudioMuted,
    isVideoMuted,
    isSpeakerOn,
    onToggleAudio,
    onToggleVideo,
    onToggleSpeaker,
    onEndCall
}: CallControlsProps) => (
    <div className="call-controls">
        <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="call-button"
                    onClick={onToggleAudio}
                    aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                    {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                </Button>
                <span className="text-xs text-white/80 mt-1">Mic</span>
            </div>
            {isVideo && (
                <div className="flex flex-col items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        className="call-button"
                        onClick={onToggleVideo}
                        aria-label={isVideoMuted ? 'Turn on video' : 'Turn off video'}
                    >
                        {isVideoMuted ? <VideoOffIcon /> : <VideoIcon />}
                    </Button>
                    <span className="text-xs text-white/80 mt-1">Video</span>
                </div>
            )}
            <div className="flex flex-col items-center">
                <Button
                    variant={isSpeakerOn ? "secondary" : "outline"}
                    size="icon"
                    className="call-button"
                    onClick={onToggleSpeaker}
                    aria-label={isSpeakerOn ? 'Speaker on' : 'Speaker off'}
                >
                    <BarChart2 className={isSpeakerOn ? "text-blue-500" : ""} />
                </Button>
                <span className="text-xs text-white/80 mt-1">Speaker</span>
            </div>
            <div className="flex flex-col items-center">
                <Button
                    variant="destructive"
                    size="icon"
                    className="call-button end-call"
                    onClick={onEndCall}
                    aria-label="End call"
                >
                    <PhoneOffIcon />
                </Button>
                <span className="text-xs text-white/80 mt-1">End</span>
            </div>
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
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [networkQuality, setNetworkQuality] = useState(4);
    const [callStartTime, setCallStartTime] = useState<number>(0);
    const [showControls, setShowControls] = useState(true);
    const [peerAvatar, setPeerAvatar] = useState<string | null>(null);
    const ringingAudioRef = useRef<HTMLAudioElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle mouse movement to show/hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch(e.key.toLowerCase()) {
                case 'm':
                    handleToggleAudio();
                    break;
                case 'v':
                    if (callType === 'video') {
                        handleToggleVideo();
                    }
                    break;
                case 'h':
                    onEndCall();
                    break;
                case 's':
                    handleToggleSpeaker();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, callType]);

    // Play ringing sound when connecting/ringing
    useEffect(() => {
        if (isOpen && !remoteStream) {
            ringingAudioRef.current?.play();
        } else {
            ringingAudioRef.current?.pause();
            if (ringingAudioRef.current) {
                ringingAudioRef.current.currentTime = 0;
            }
        }
    }, [isOpen, remoteStream]);
                            {/* Ringing sound */}
                            <audio ref={ringingAudioRef} src="/sounds/ringtone.mp3" loop preload="auto" />

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

    // Loudspeaker toggle (for mobile, or desktop output device selection)
    const handleToggleSpeaker = () => {
        setIsSpeakerOn((prev) => !prev);
        // For desktop, you can set sinkId on audio elements if supported
        // For mobile, this is a placeholder (real implementation may require Cordova/Capacitor plugin)
        // Example: remoteAudioRef.current?.setSinkId(isSpeakerOn ? 'default' : 'speaker')
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onEndCall()} modal={true}>
            <DialogContent 
                className="sm:max-w-[90vw] h-[90vh] p-0 border-none call-modal"
                ref={containerRef}
                onMouseMove={handleMouseMove}
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{`${callType === 'video' ? 'Video' : 'Voice'} Call with ${peerName}`}</DialogTitle>
                </DialogHeader>

                {/* Accessibility Info */}
                <div className="sr-only" role="alert" aria-live="polite">
                    Keyboard shortcuts: M to mute, V for video, S for speaker, H to hang up
                </div>

                {/* Ringing sound */}
                <audio ref={ringingAudioRef} src="/sounds/ringtone.mp3" loop preload="auto" />

                <div className="video-container">
                    {/* Remote Stream (Main View) */}
                    {remoteStream && callType === 'video' ? (
                        <>
                            <video
                                ref={(video) => {
                                    if (video) {
                                        video.srcObject = remoteStream;
                                        // Set volume based on speaker state
                                        video.volume = isSpeakerOn ? 1 : 0.5;
                                    }
                                }}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                                aria-label={`${peerName}'s video feed`}
                            />
                            {/* Accessibility label for video feed */}
                            <div className="sr-only" role="status">
                                Video call with {peerName} is active
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="call-avatar call-connecting">
                                {peerAvatar ? (
                                    <img 
                                        src={peerAvatar} 
                                        alt={peerName} 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                                        {callType === 'video' ? 
                                            <VideoIcon className="w-12 h-12 text-primary" /> : 
                                            <PhoneIcon className="w-12 h-12 text-primary" />
                                        }
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-semibold text-white mt-6 mb-2">
                                {remoteStream ? 'Connected' : 'Connecting to'} {peerName}
                            </h3>
                            {!remoteStream && (
                                <div className="space-y-2 text-center">
                                    <p className="connection-status text-lg text-white/80">
                                        {callType === 'video' ? 'Starting video call' : 'Starting voice call'}
                                    </p>
                                    <p className="text-sm text-white/60">
                                        Use keyboard shortcuts (M, V, S, H) for quick controls
                                    </p>
                                </div>
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

                    {/* User Info and Status Bar */}
                    <div className={`user-info transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-medium text-white">{peerName}</h3>
                            {networkQuality < 3 && (
                                <span className="text-yellow-400 text-sm">
                                    Poor Connection
                                </span>
                            )}
                        </div>
                        {remoteStream && (
                            <div className="flex items-center space-x-2 text-sm text-white/60">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Connected</span>
                            </div>
                        )}
                    </div>

                    {/* Network Quality and Timer */}
                    {remoteStream && (
                        <div className={`absolute top-4 right-4 space-y-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                            <NetworkQuality quality={networkQuality} />
                            <CallTimer startTime={callStartTime} />
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="bg-gradient-to-t from-black/90 to-black/50 p-6">
                            <CallControls
                                isVideo={callType === 'video'}
                                isAudioMuted={isAudioMuted}
                                isVideoMuted={isVideoMuted}
                                isSpeakerOn={isSpeakerOn}
                                onToggleAudio={handleToggleAudio}
                                onToggleVideo={handleToggleVideo}
                                onToggleSpeaker={handleToggleSpeaker}
                                onEndCall={onEndCall}
                            />
                            {/* Keyboard Shortcuts Guide */}
                            <div className="text-white/40 text-xs text-center mt-4 space-x-4">
                                <span>M - Mute</span>
                                {callType === 'video' && <span>V - Video</span>}
                                <span>S - Speaker</span>
                                <span>H - Hang up</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};
