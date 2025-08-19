export type CallType = 'audio' | 'video';

export interface CallSignal {
    type: 'offer' | 'answer' | 'candidate' | 'leave';
    from: string;
    to: string;
    data: any;
    callType: CallType;
    timestamp: Date;
}

export interface ActiveCall {
    callId: string;
    participants: string[];
    startTime: Date;
    type: CallType;
    status: 'connecting' | 'active' | 'ended';
}
