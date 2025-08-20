# WebRTC Video & Voice Calling System

## Overview
The Cultured Nomad platform implements a WebRTC-based real-time communication system for voice and video calls between mentors and mentees. The system utilizes Firebase for signaling and modern web APIs for media handling.

## Technical Architecture

### Core Components

1. **WebRTC Hook (`use-webrtc.ts`)**
   - Manages peer connections
   - Handles media streams
   - Implements signaling logic
   - Controls call lifecycle

2. **Call Modal (`call-modal.tsx`)**
   - User interface for calls
   - Call controls
   - Media stream rendering
   - Status indicators

3. **Firebase Integration**
   - Signaling server
   - Call state management
   - Connection establishment

### Key Features

#### 1. Media Handling
- Audio stream management
- Video stream processing
- Camera/microphone permissions
- Track management (mute/unmute)

#### 2. Connection Management
- ICE candidate handling
- STUN server integration
- Peer connection lifecycle
- Stream cleanup

#### 3. User Interface
- Modern, animated call modal
- Picture-in-Picture local view
- Call duration timer
- Network quality indicator
- Connection status display
- Glassmorphic UI elements

## Implementation Details

### WebRTC Configuration
```typescript
const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
];
```

### Media Constraints
```typescript
const mediaConstraints = {
    audio: true,
    video: type === 'video' // Conditional video based on call type
};
```

### Signaling Flow
1. Caller creates offer
2. Offer stored in Firebase
3. Callee receives offer via Firestore listener
4. Callee creates and sends answer
5. Connection established

## Current Limitations

1. **Network**
   - No TURN server fallback
   - Limited NAT traversal capability
   - Basic connection quality management

2. **Scale**
   - Firebase Spark plan limitations
   - No load balancing
   - Single peer-to-peer connections only

3. **Features**
   - No group calls
   - No screen sharing
   - No recording capability
   - Basic error recovery

## Testing Guidelines

### Prerequisites
- Two different browsers/devices
- Camera and microphone access
- Stable internet connection
- Firebase configuration

### Test Scenarios

1. **Basic Connectivity**
   - Audio call initiation
   - Video call initiation
   - Permission handling
   - Call acceptance/rejection

2. **Media Controls**
   - Mute/unmute audio
   - Toggle video
   - Camera switching
   - Audio output selection

3. **Error Scenarios**
   - Permission denial
   - Network interruption
   - Browser compatibility
   - Device disconnection

## Future Enhancements

### Phase 1: Stability & Performance
- [ ] TURN server implementation
- [ ] Advanced error handling
- [ ] Connection quality optimization
- [ ] Browser compatibility improvements
- [ ] Mobile device optimization

### Phase 2: Advanced Features
- [ ] Screen sharing capability
- [ ] Call recording
- [ ] Background blur/effects
- [ ] Noise cancellation
- [ ] Virtual backgrounds
- [ ] Chat during calls

### Phase 3: Scaling & Infrastructure
- [ ] Custom media servers
- [ ] Load balancing
- [ ] Call analytics
- [ ] Performance monitoring
- [ ] Resource optimization

### Phase 4: Enhanced Collaboration
- [ ] Group calling support
- [ ] Breakout rooms
- [ ] Presentation mode
- [ ] File sharing during calls
- [ ] Call scheduling
- [ ] Call reminders

### Phase 5: Security & Privacy
- [ ] End-to-end encryption
- [ ] Call authentication
- [ ] Privacy controls
- [ ] Data retention policies
- [ ] Compliance features

## Best Practices

### Code Organization
- Separate concerns (media, connection, UI)
- Clear error handling
- Proper cleanup of resources
- Event-driven architecture

### Performance
- Optimize media quality
- Efficient stream handling
- Resource cleanup
- Memory management

### Security
- Secure signaling
- Permission management
- Stream encryption
- Data protection

## Troubleshooting

### Common Issues
1. Permission errors
   - Check browser settings
   - Verify HTTPS in production
   - Clear site data if needed

2. Connection failures
   - Check network connectivity
   - Verify ICE server access
   - Review firewall settings

3. Media issues
   - Verify device connections
   - Check browser compatibility
   - Review permission status

### Debug Tools
- Browser developer tools
- WebRTC statistics
- Firebase console
- Network analyzers

## Resources

### Documentation
- [WebRTC API](https://webrtc.org/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tools
- WebRTC Internals: chrome://webrtc-internals/
- Network analyzers
- WebRTC debugging tools

---

Last Updated: August 19, 2025
Version: 1.0.0

Note: This documentation will be updated as new features are implemented and the system evolves.
