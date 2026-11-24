import { createContext, useContext } from 'react';

export type RealtimeStatus = 'connecting' | 'live' | 'offline';

export const RealtimeContext = createContext<RealtimeStatus>('offline');
export const useRealtimeStatus = () => useContext(RealtimeContext);
