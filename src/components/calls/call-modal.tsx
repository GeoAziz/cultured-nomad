'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import './call-modal.css';
import { Button } from '@/components/ui/button';
import { VideoIcon, PhoneIcon, MicIcon, MicOffIcon, VideoOffIcon, PhoneOffIcon } from 'lucide-react';

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
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={onToggleAudio}
        >
            {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
        </Button>
        
        {isVideo && (
            <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={onToggleVideo}
            >
                {isVideoMuted ? <VideoOffIcon /> : <VideoIcon />}
            </Button>
        )}
        
        <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={onEndCall}
        >
            <PhoneOffIcon />
        </Button>
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
                <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col justify-center items-center">
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
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                {callType === 'video' ? 
                                    <VideoIcon className="w-12 h-12 text-primary animate-pulse" /> : 
                                    <PhoneIcon className="w-12 h-12 text-primary animate-pulse" />
                                }
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                {remoteStream ? 'Connected' : 'Connecting to'} {peerName}
                            </h3>
                            {!remoteStream && (
                                <p className="text-white/60">
                                    {callType === 'video' ? 'Starting video call...' : 'Starting voice call...'}
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
                                className="w-full h-full object-cover"
                            />
                        </div>
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
    );
};
