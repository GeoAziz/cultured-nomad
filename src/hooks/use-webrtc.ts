'use client';

import { useEffect, useRef, useState } from 'react';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    onSnapshot, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    DocumentData,
    DocumentChange,
    orderBy,
    limit,
    writeBatch,
    serverTimestamp,
    QuerySnapshot
} from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { CallSignal, CallType, ActiveCall } from '@/types/calls';

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    // Backup TURN server for improved reliability
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
    const ringTimeoutRef = useRef<NodeJS.Timeout>();
    const RING_TIMEOUT_SECONDS = 30; // Ring timeout duration
    const db = getFirestore(app);

    // Cleanup function
    const cleanup = async (status: 'ended' | 'failed' = 'ended') => {
        try {
            // Clear ring timeout if it exists
            if (ringTimeoutRef.current) {
                clearTimeout(ringTimeoutRef.current);
                ringTimeoutRef.current = undefined;
            }

            // Stop all media tracks
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                });
                setLocalStream(null);
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => {
                    track.stop();
                });
                setRemoteStream(null);
            }

            // Close peer connection
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }

            // Clear call state
            setIsCallActive(false);
            setCallType(null);
            setCallStatus(status);

            // Clean up signals
            const callSignalsRef = collection(db, 'callSignals');
            const fromSignals = await getDocs(query(callSignalsRef, 
                where('from', '==', userId)));
            const toSignals = await getDocs(query(callSignalsRef,
                where('to', '==', userId)));

            const batch = writeBatch(db);
            fromSignals.docs.forEach((doc: DocumentData) => batch.delete(doc.ref));
            toSignals.docs.forEach((doc: DocumentData) => batch.delete(doc.ref));

            // Clean up old signals
            await cleanupOldSignals();

            // Log call history
            setCallHistory(prev => [
                ...prev,
                {
                    time: new Date(),
                    type: callType,
                    status,
                    peer: null
                }
            ]);
        } catch (err) {
            console.error('Error during cleanup:', err);
        }
    };

    // Error handling
    const handleSignalingError = (error: any) => {
        console.error('Signaling error:', error);
        setError(error.message);
        setCallStatus('failed');
        cleanup('failed');
    };

    // Cleanup old signals
    const cleanupOldSignals = async () => {
        try {
            // Only get signals where the current user is involved
            const oldSignals = await getDocs(
                query(
                    collection(db, 'callSignals'),
                    where('timestamp', '<=', new Date(Date.now() - 5 * 60 * 1000)),  // 5 minutes old
                    where('from', '==', userId)
                )
            );
            
            const toSignals = await getDocs(
                query(
                    collection(db, 'callSignals'),
                    where('timestamp', '<=', new Date(Date.now() - 5 * 60 * 1000)),  // 5 minutes old
                    where('to', '==', userId)
                )
            );
            
            if (!oldSignals.empty || !toSignals.empty) {
                const batch = writeBatch(db);
                oldSignals.docs.forEach(doc => batch.delete(doc.ref));
                toSignals.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        } catch (error) {
            console.error('Error cleaning up old signals:', error);
        }
    };

    // Listen for call signals with proper filtering
    useEffect(() => {
        if (!userId) return;

        const callSignalsRef = collection(db, 'callSignals');
        const q = query(
            callSignalsRef,
            where('to', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
                if (change.type === 'added') {
                    const signal = change.doc.data() as CallSignal;
                    console.log('Received call signal:', signal);
                    try {
                        if (signal.type === 'offer') {
                            setCallStatus('ringing');
                            answerCall(signal).catch(handleSignalingError);
                        } else if (signal.type === 'answer' && peerConnection.current) {
                            setCallStatus('active');
                            peerConnection.current.setRemoteDescription(
                                new RTCSessionDescription(signal.data)
                            ).catch(handleSignalingError);
                        } else if (signal.type === 'candidate' && peerConnection.current) {
                            peerConnection.current.addIceCandidate(
                                new RTCIceCandidate(signal.data)
                            ).catch(err => console.error('Error adding ICE candidate:', err));
                        } else if (signal.type === 'leave') {
                            cleanup('ended');
                        }
                    } catch (error) {
                        handleSignalingError(error);
                    }
                }
            });
        }, handleSignalingError);

        return () => unsubscribe();
    }, [userId]);

    // Initialize peer connection with improved handling
    const initializePeerConnection = (recipientId?: string) => {
        console.log('Creating new RTCPeerConnection');
        peerConnection.current = new RTCPeerConnection({ 
            iceServers: ICE_SERVERS 
        });

        // Handle ICE candidates
        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate && recipientId) {
                try {
                    const candidateSignal: CallSignal = {
                        type: 'candidate',
                        from: userId,
                        to: recipientId,
                        data: event.candidate.toJSON(),
                        callType: callType || 'audio',
                        timestamp: new Date()
                    };
                    await setDoc(doc(collection(db, 'callSignals')), candidateSignal);
                } catch (error) {
                    handleSignalingError(error);
                }
            }
        };

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            setRemoteStream(event.streams[0]);
        };

        // Connection state monitoring
        peerConnection.current.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnection.current?.connectionState);
            if (peerConnection.current?.connectionState === 'connected') {
                setCallStatus('active');
            } else if (peerConnection.current?.connectionState === 'disconnected' || 
                      peerConnection.current?.connectionState === 'failed') {
                setCallStatus('failed');
                cleanup('failed');
            } else if (peerConnection.current?.connectionState === 'closed') {
                setCallStatus('ended');
            }
        };

        // ICE connection state monitoring
        peerConnection.current.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
        };
    };

    // Start a call
    const startCall = async (recipientId: string, type: CallType): Promise<void> => {
        try {
            console.log('Starting call:', { recipientId, type });
            setCallType(type);
            setIsCallActive(true);
            setCallStatus('connecting');

            // Set ring timeout
            ringTimeoutRef.current = setTimeout(() => {
                if (callStatus !== 'active') {
                    console.log('Call timed out after', RING_TIMEOUT_SECONDS, 'seconds');
                    cleanup('ended');
                    setError('Call timed out. Please try again.');
                }
            }, RING_TIMEOUT_SECONDS * 1000);

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
            const offer = await peerConnection.current?.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });
            
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
