'use client';

import { useEffect, useRef, useState } from 'react';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { CallSignal, CallType, ActiveCall } from '@/types/calls';

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Free TURN server for dev/testing. For production, use a paid TURN service.
    { urls: 'turn:relay1.expressturn.com:3478', username: 'expressturn', credential: 'expressturn' }
];

export const useWebRTC = (userId: string) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [callType, setCallType] = useState<CallType | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'ringing' | 'active' | 'ended' | 'failed'>('idle');
    const [callHistory, setCallHistory] = useState<any[]>([]);
    
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const db = getFirestore(app);

    // Cleanup function
    const cleanup = async (status: 'ended' | 'failed' = 'ended') => {
        try {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            setRemoteStream(null);
            setIsCallActive(false);
            setCallType(null);
            setCallStatus(status);

            // Cleanup any existing call signals
            const callSignalsRef = collection(db, 'callSignals');
            const snapshot = await getDocs(query(callSignalsRef, 
                where('from', '==', userId)));
            // Delete all signals from this user
            const deletePromises = snapshot.docs.map((doc: DocumentData) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Log call history
            setCallHistory(prev => [
                ...prev,
                {
                    time: new Date(),
                    type: callType,
                    status,
                    peer: null // can be set from context
                }
            ]);
        } catch (err) {
            console.error('Error during cleanup:', err);
        }
    };

    // Listen for call signals (offer, answer, candidate, leave)
    useEffect(() => {
        if (!userId) return;

        const callSignalsRef = collection(db, 'callSignals');
        const unsubscribe = onSnapshot(callSignalsRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const signal = change.doc.data() as CallSignal;
                    if (signal.to === userId) {
                        console.log('Received call signal:', signal);
                        if (signal.type === 'offer') {
                            setCallStatus('ringing');
                            answerCall(signal);
                        } else if (signal.type === 'answer') {
                            setCallStatus('active');
                            peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signal.data));
                        } else if (signal.type === 'candidate') {
                            peerConnection.current?.addIceCandidate(new RTCIceCandidate(signal.data));
                        } else if (signal.type === 'leave') {
                            cleanup('ended');
                        }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [userId]);

    // Initialize peer connection
    const initializePeerConnection = (recipientId?: string) => {
        console.log('Creating new RTCPeerConnection');
        peerConnection.current = new RTCPeerConnection({ 
            iceServers: ICE_SERVERS 
        });

        // Handle ICE candidates
        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate && recipientId) {
                const candidateSignal: CallSignal = {
                    type: 'candidate',
                    from: userId,
                    to: recipientId,
                    data: event.candidate.toJSON(),
                    callType: callType || 'audio',
                    timestamp: new Date()
                };
                await setDoc(doc(collection(db, 'callSignals')), candidateSignal);
            }
        };

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        // Advanced: Connection state change for status and edge case handling
        peerConnection.current.onconnectionstatechange = () => {
            if (peerConnection.current?.connectionState === 'connected') {
                setCallStatus('active');
            } else if (peerConnection.current?.connectionState === 'disconnected' || peerConnection.current?.connectionState === 'failed') {
                setCallStatus('failed');
                cleanup('failed');
            } else if (peerConnection.current?.connectionState === 'closed') {
                setCallStatus('ended');
            }
        };
    };

    // Start a call
    const startCall = async (recipientId: string, type: CallType): Promise<void> => {
        try {
            console.log('Starting call:', { recipientId, type });
            setCallType(type);
            setIsCallActive(true);
            setCallStatus('connecting');

            // Get media stream
            const mediaConstraints = {
                audio: true,
                video: type === 'video'
            };

            console.log('Requesting media permissions...');

            const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            console.log('Got local media stream');
            setLocalStream(stream);

            // Initialize peer connection
            console.log('Initializing peer connection');
            initializePeerConnection(recipientId);

            // Add tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, stream);
            });

            // Create and set local description
            const offer = await peerConnection.current?.createOffer();
            await peerConnection.current?.setLocalDescription(offer);

            // Store the offer in Firestore
            const callSignal: CallSignal = {
                type: 'offer',
                from: userId,
                to: recipientId,
                data: offer,
                callType: type,
                timestamp: new Date()
            };

            await setDoc(doc(collection(db, 'callSignals')), callSignal);
            setIsCallActive(true);

        } catch (err: any) {
            setError(err.message);
            setCallStatus('failed');
            await cleanup('failed');
        }
    };

    // Answer a call
    const answerCall = async (callSignal: CallSignal): Promise<void> => {
        try {
            setCallType(callSignal.callType);
            setCallStatus('connecting');

            // Get media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callSignal.callType === 'video'
            });
            setLocalStream(stream);

            // Initialize peer connection
            initializePeerConnection(callSignal.from);

            // Add tracks
            stream.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, stream);
            });

            // Set remote description from offer
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(callSignal.data));

            // Create and send answer
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);

            // Store the answer in Firestore
            const answerSignal: CallSignal = {
                type: 'answer',
                from: userId,
                to: callSignal.from,
                data: answer,
                callType: callSignal.callType,
                timestamp: new Date()
            };

            await setDoc(doc(collection(db, 'callSignals')), answerSignal);
            setIsCallActive(true);
            setCallStatus('active');

        } catch (err: any) {
            setError(err.message);
            setCallStatus('failed');
            await cleanup('failed');
        }
    };

    // End call
    const endCall = async (): Promise<void> => {
        // Send leave signal to peer
        try {
            if (peerConnection.current) {
                const leaveSignal: CallSignal = {
                    type: 'leave',
                    from: userId,
                    to: '', // peer id can be set from context
                    data: null,
                    callType: callType || 'audio',
                    timestamp: new Date()
                };
                await setDoc(doc(collection(db, 'callSignals')), leaveSignal);
            }
        } catch (err) {
            console.error('Error sending leave signal:', err);
        }
        await cleanup('ended');
    };

    return {
        startCall,
        answerCall,
        endCall,
        localStream,
        remoteStream,
        isCallActive,
        callType,
        error,
        callStatus,
        callHistory
    };
};
