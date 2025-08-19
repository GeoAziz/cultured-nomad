'use client';

import { useEffect, useRef, useState } from 'react';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase_config';
import { CallSignal, CallType, ActiveCall } from '@/types/calls';

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Free STUN servers - For production, you'd want to add TURN servers
];

export const useWebRTC = (userId: string) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [callType, setCallType] = useState<CallType | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const db = getFirestore(app);

    // Cleanup function
    const cleanup = async () => {
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

            // Cleanup any existing call signals
            const callSignalsRef = collection(db, 'callSignals');
            const snapshot = await getDocs(query(callSignalsRef, 
                where('from', '==', userId)));
            
            // Delete all signals from this user
            const deletePromises = snapshot.docs.map((doc: DocumentData) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (err) {
            console.error('Error during cleanup:', err);
        }
    };

    // Listen for call signals
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
                            answerCall(signal);
                        }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [userId]);

    // Initialize peer connection
    const initializePeerConnection = () => {
        console.log('Creating new RTCPeerConnection');
        peerConnection.current = new RTCPeerConnection({ 
            iceServers: ICE_SERVERS 
        });

        // Handle ICE candidates
        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate) {
                // Send the ICE candidate to the remote peer
                // We'll implement this with Firestore
            }
        };

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };
    };

    // Start a call
    const startCall = async (recipientId: string, type: CallType): Promise<void> => {
        try {
            console.log('Starting call:', { recipientId, type });
            setCallType(type);
            setIsCallActive(true); // Set active immediately for UI feedback
            
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
            initializePeerConnection();
            
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
            await cleanup();
        }
    };

    // Answer a call
    const answerCall = async (callSignal: CallSignal): Promise<void> => {
        try {
            setCallType(callSignal.callType);
            
            // Get media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callSignal.callType === 'video'
            });
            setLocalStream(stream);
            
            // Initialize peer connection
            initializePeerConnection();
            
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

        } catch (err: any) {
            setError(err.message);
            await cleanup();
        }
    };

    // End call
    const endCall = async (): Promise<void> => {
        await cleanup();
    };

    return {
        startCall,
        answerCall,
        endCall,
        localStream,
        remoteStream,
        isCallActive,
        callType,
        error
    };
};
