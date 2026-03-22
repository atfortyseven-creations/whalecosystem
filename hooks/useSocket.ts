"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket
    const socket = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 [WebSocket] Connected to Hub');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('📡 [WebSocket] Disconnected');
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { isConnected, socket: socketRef.current, emit, on, off };
};

