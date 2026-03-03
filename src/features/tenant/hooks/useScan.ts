import { useCallback, useEffect, useRef, useState } from 'react';

interface ScanResult {
  data: string;
}

interface UseScanOptions {
  onScan: (data: string) => Promise<void> | void;
  cooldownMs?: number;
  sameCodeCooldownMs?: number;
  enabled?: boolean;
}

export function useScan({
  onScan,
  cooldownMs = 1200,
  sameCodeCooldownMs = 4000,
  enabled = true,
}: UseScanOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isLockedRef = useRef(false);
  const lastScanAtRef = useRef(0);
  const lastPayloadRef = useRef<string | null>(null);
  const lastPayloadAtRef = useRef(0);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  const unlock = useCallback(() => {
    isLockedRef.current = false;
    setIsProcessing(false);
  }, []);

  const resume = useCallback(() => {
    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = null;
    }
    unlock();
  }, [unlock]);

  const onBarCodeScanned = useCallback(
    async ({ data }: ScanResult) => {
      if (!enabled) return;

      const normalizedData = data?.trim();
      if (!normalizedData) return;

      const now = Date.now();

      if (isLockedRef.current) return;
      if (now - lastScanAtRef.current < cooldownMs) return;

      const isSameCode =
        lastPayloadRef.current === normalizedData &&
        now - lastPayloadAtRef.current < sameCodeCooldownMs;

      if (isSameCode) return;

      isLockedRef.current = true;
      setIsProcessing(true);
      lastScanAtRef.current = now;
      lastPayloadRef.current = normalizedData;
      lastPayloadAtRef.current = now;

      try {
        await onScanRef.current(normalizedData);
      } finally {
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
        }

        unlockTimeoutRef.current = setTimeout(() => {
          unlock();
          unlockTimeoutRef.current = null;
        }, cooldownMs);
      }
    },
    [cooldownMs, enabled, sameCodeCooldownMs, unlock]
  );

  return {
    isProcessing,
    onBarCodeScanned,
    resume,
  };
}
