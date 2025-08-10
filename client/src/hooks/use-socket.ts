import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DisasterEvent } from '@shared/schema';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io(process.env.NODE_ENV === 'development' ? '' : '', {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to Socket.IO server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from Socket.IO server');
      });
    }

    return () => {
      // Don't disconnect on unmount to maintain connection across components
    };
  }, []);

  const joinLocation = (country: string) => {
    if (socket) {
      socket.emit('joinLocation', country);
    }
  };

  const leaveLocation = (country: string) => {
    if (socket) {
      socket.emit('leaveLocation', country);
    }
  };

  const onNewEvent = (callback: (event: DisasterEvent) => void) => {
    if (socket) {
      socket.on('newEvent', callback);
    }

    return () => {
      if (socket) {
        socket.off('newEvent', callback);
      }
    };
  };

  const onLocationEvent = (callback: (event: DisasterEvent) => void) => {
    if (socket) {
      socket.on('locationEvent', callback);
    }

    return () => {
      if (socket) {
        socket.off('locationEvent', callback);
      }
    };
  };

  return {
    socket,
    isConnected,
    joinLocation,
    leaveLocation,
    onNewEvent,
    onLocationEvent,
  };
}
