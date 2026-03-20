import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from '../features/auth/hooks/useSession';

export function useSocket() {
    const { isAuthenticated, token: sessionToken } = useSession();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !sessionToken) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        const url = process.env.EXPO_PUBLIC_API_URL || '';

        socketRef.current = io(url, {
            auth: { token: sessionToken },
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('[Socket] Connected:', socketRef.current?.id);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('[Socket] Connect error:', err.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, sessionToken]);

    return { socket: socketRef.current, isConnected };
}
