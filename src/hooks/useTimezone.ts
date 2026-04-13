import { useMemo } from 'react';
import { DateTime, IANAZone } from 'luxon';
import { useTenant } from '../features/tenant/providers/TenantProvider';

export function useTimezone(customTimezone?: string) {
  const { tenant } = useTenant();
  
  const timezone = customTimezone ?? tenant?.timezone ?? 'UTC';
  
  const isValid = useMemo(() => {
    return IANAZone.isValidZone(timezone);
  }, [timezone]);
  
  const effectiveTimezone = isValid ? timezone : 'UTC';
  
  const dateTime = useMemo(() => {
    return {
      now: () => DateTime.now().setZone(effectiveTimezone),
      
      format: (date: Date | string, format = 'yyyy-MM-dd HH:mm:ss') => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.toFormat(format);
      },
      
      formatRelative: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.toRelative() ?? '';
      },
      
      toISO: (date?: Date) => {
        const dt = date 
          ? DateTime.fromJSDate(date, { zone: effectiveTimezone }) 
          : DateTime.now().setZone(effectiveTimezone);
        return dt.toISO();
      },
      
      fromISO: (isoString: string) => {
        return DateTime.fromISO(isoString, { zone: effectiveTimezone });
      },
      
      startOfDay: () => DateTime.now().setZone(effectiveTimezone).startOf('day'),
      endOfDay: () => DateTime.now().setZone(effectiveTimezone).endOf('day'),
      startOfWeek: () => DateTime.now().setZone(effectiveTimezone).startOf('week'),
      endOfWeek: () => DateTime.now().setZone(effectiveTimezone).endOf('week'),
      
      addDays: (days: number) => DateTime.now().setZone(effectiveTimezone).plus({ days }),
      addHours: (hours: number) => DateTime.now().setZone(effectiveTimezone).plus({ hours }),
      addMinutes: (minutes: number) => DateTime.now().setZone(effectiveTimezone).plus({ minutes }),
      
      isToday: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.hasSame(DateTime.now().setZone(effectiveTimezone), 'day');
      },
      
      isTomorrow: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.hasSame(DateTime.now().setZone(effectiveTimezone).plus({ days: 1 }), 'day');
      },
      
      formatTime: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.toFormat('HH:mm');
      },
      
      formatDate: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.toFormat('dd MMM yyyy');
      },
      
      formatDateTime: (date: Date | string) => {
        const dt = typeof date === 'string' 
          ? DateTime.fromISO(date, { zone: effectiveTimezone }) 
          : DateTime.fromJSDate(date, { zone: effectiveTimezone });
        return dt.toFormat('dd MMM yyyy, HH:mm');
      },
      
      toLocal: (utcDate: Date | string) => {
        const dt = typeof utcDate === 'string' 
          ? DateTime.fromISO(utcDate, { zone: 'utc' }).setZone(effectiveTimezone)
          : DateTime.fromJSDate(utcDate, { zone: 'utc' }).setZone(effectiveTimezone);
        return dt;
      },
    };
  }, [effectiveTimezone]);
  
  return {
    timezone: effectiveTimezone,
    ...dateTime,
  };
}
