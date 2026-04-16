import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OperationType = 'Encode' | 'Decode' | 'Analysis';
export type OperationStatus = 'Pending' | 'Processing' | 'Success' | 'Failed';

export interface Operation {
  id: string;
  type: OperationType;
  file: string;
  time: Date;
  status: OperationStatus;
  details?: string;
}

export interface Model {
  name: string;
  version: string;
  status: 'Active' | 'Update Available' | 'Offline' | 'Training';
  type: string;
  description: string;
  metrics: Record<string, string>;
}

export interface SystemMetrics {
  gpu: number; // percentage
  cpu: number; // percentage
  storage: number; // percentage
  throughput: number; // req/s
  activeNodes: number;
  connections: number;
  latency: number; // ms
}

interface AppContextType {
  operations: Operation[];
  models: Model[];
  metrics: SystemMetrics;
  addOperation: (op: Omit<Operation, 'id' | 'time'>) => string;
  updateOperationStatus: (id: string, status: OperationStatus, details?: string) => void;
  simulateProcessing: (id: string, duration?: number) => Promise<void>;
}

const API_BASE_URL = 'http://localhost:5001/api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    gpu: 0,
    cpu: 0,
    storage: 0,
    throughput: 0,
    activeNodes: 0,
    connections: 0,
    latency: 0
  });

  // Fetch models from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/models`)
      .then(res => res.json())
      .then(data => setModels(data))
      .catch(err => console.error('Failed to fetch models:', err));
  }, []);

  // Fetch metrics from API periodically
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/metrics`);
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const addOperation = (op: Omit<Operation, 'id' | 'time'>) => {
    const id = Math.random().toString(36).substring(7);
    const newOp: Operation = { ...op, id, time: new Date() };
    setOperations(prev => [newOp, ...prev].slice(0, 50));
    return id;
  };

  const updateOperationStatus = (id: string, status: OperationStatus, details?: string) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, status, details: details || op.details } : op
    ));
  };

  const simulateProcessing = async (id: string, duration: number = 3000) => {
    updateOperationStatus(id, 'Processing');
    await new Promise(resolve => setTimeout(resolve, duration));
    updateOperationStatus(id, 'Success');
  };

  return (
    <AppContext.Provider value={{ operations, models, metrics, addOperation, updateOperationStatus, simulateProcessing }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
