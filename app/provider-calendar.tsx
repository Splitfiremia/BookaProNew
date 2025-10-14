import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, PanResponder, PanResponderInstance, Animated, TouchableOpacity, Alert } from 'react-native';
import { useAppointments, AppointmentDetails } from '@/providers/AppointmentProvider';
import { useTeam, TeamMember } from '@/providers/TeamProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, UserSquare2, Settings } from 'lucide-react-native';

const SERVICE_COLORS: Record<string, string> = {
  Haircut: '#4F46E5',
  Color: '#0EA5E9',
  Styling: '#10B981',
  'Beard Trim': '#F59E0B',
  Massage: '#EF4444',
  Default: '#94A3B8',
};

type ViewMode = 'day' | 'week' | 'month';

interface BreakBlock { 
  id: string; 
  providerId: string; 
  dayISO: string; 
  start: number; 
  end: number; 
}

interface AvailabilityDay { 
  day: number; 
  start: number; 
  end: number; 
  enabled: boolean; 
}

interface AugmentedAppointment extends AppointmentDetails { 
  startMinutes: number; 
  endMinutes: number; 
  duration: number; 
  dateISO: string; 
}

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;

export default function ProviderCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { appointments, updateAppointment } = useAppointments();
  const { teamMembers } = useTeam();

  const [mode, setMode] = useState<ViewMode>('week');
  const [current, setCurrent] = useState<Date>(new Date());
  const [selectedProvider, setSelectedProvider] = useState<string | 'all'>('all');
  const [breaks, setBreaks] = useState<BreakBlock[]>([]);
  const [availability, setAvailability] = useState<AvailabilityDay[]>(() =>
    Array.from({ length: 7 }, (_, d) => ({ 
      day: d, 
      start: 9 * 60, 
      end: 17 * 60, 
      enabled: d < 6 
    }))
  );
  const [banner, setBanner] = useState<string | null>(null);

  // Clear banner after timeout
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => setBanner(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  // Demo updates - only in development
  useEffect(() => {
    if (__DEV__ && appointments.length > 0) {
      const id = setInterval(() => {
        if (Math.random() > 0.8) {
          const idx = Math.floor(Math.random() * appointments.length);
          const apt = appointments[idx];
          const msg = `Update: ${apt.serviceName} for ${apt.providerName} was adjusted.`;
          setBanner(msg);
        }
      }, 10000);
      return () => clearInterval(id);
    }
  }, [appointments]);

  const visibleTeam: TeamMember[] = useMemo(() => {
    if (selectedProvider === 'all') return teamMembers;
    return teamMembers.filter(t => t.id === selectedProvider);
  }, [teamMembers, selectedProvider]);

  const daysInWeek = useMemo(() => getWeekDays(current), [current]);
  const daysInMonth = useMemo(() => getMonthMatrix(current), [current]);

  const onPrev = useCallback(() => {
    if (mode === 'day') setCurrent(addDays(current, -1));
    else if (mode === 'week') setCurrent(addDays(current, -7));
    else setCurrent(addMonths(current, -1));
  }, [current, mode]);

  const onNext = useCallback(() => {
    if (mode === 'day') setCurrent(addDays(current, 1));
    else if (mode === 'week') setCurrent(addDays(current, 7));
    else setCurrent(addMonths(current, 1));
  }, [current, mode]);

  const dayStart = 8 * 60; // 8:00 AM
  const dayEnd = 20 * 60; // 8:00 PM
  const slotHeight = 40;

  const filteredAppointments = useMemo(() => {
    return appointments
      .map(augmentAppointment)
      .filter(a => isSameView(a, current, mode))
      .filter(a => selectedProvider === 'all' || a.providerId === selectedProvider);
  }, [appointments, current, mode, selectedProvider]);

  const handleDrop = useCallback(async (
    apt: AugmentedAppointment, 
    targetMinutes: number, 
    dayDate: Date, 
    providerId?: string
  ) => {
    try {
      const avail = availability[dayDate.getDay()];
      if (!avail?.enabled) {
        throw new Error('Provider not available on this day');
      }

      const newStart = clamp(targetMinutes, avail.start, avail.end - apt.duration);
      const newEnd = newStart + apt.duration;
      const dayISO = isoDate(dayDate);
      const targetProviderId = providerId ?? apt.providerId;

      if (hasConflict(
        filteredAppointments, 
        apt.id, 
        newStart, 
        newEnd, 
        dayISO, 
        targetProviderId, 
        breaks
      )) {
        throw new Error('Time conflicts with another appointment or break');
      }

      await updateAppointment(apt.id, {
        date: formatDay(dayDate),
        time: formatTimeRange(newStart, newEnd),
        providerId: targetProviderId,
        updatedAt: new Date().toISOString(),
      });

      setBanner('Appointment updated successfully');
    } catch (error: any) {
      const message = error?.message || 'Unknown error occurred';
      console.error('Drop failed:', message);
      setBanner(`Cannot move appointment: ${message}`);
    }
  }, [availability, filteredAppointments, breaks, updateAppointment]);

  const handleOpenSettings = useCallback(() => {
    Alert.alert(
      'Availability Settings',
      'This feature will be available in the next update.',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>      
      <Stack.Screen 
        options={{ 
          title: 'Provider Calendar', 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0B1220',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerButton}
              testID="back-button"
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
          )
        }} 
      />

      <Header
        mode={mode}
        setMode={setMode}
        current={current}
        onPrev={onPrev}
        onNext={onNext}
        team={teamMembers}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        onOpenSettings={handleOpenSettings}
      />

      {banner ? (
        <View style={styles.banner} testID="banner">
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}

      {mode === 'month' && (
        <MonthView
          daysMatrix={daysInMonth}
          appointments={filteredAppointments}
          current={current}
        />
      )}

      {mode === 'week' && (
        <WeekView
          days={daysInWeek}
          team={visibleTeam}
          appointments={filteredAppointments}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={handleDrop}
          breaks={breaks}
        />
      )}

      {mode === 'day' && (
        <DayView
          day={current}
          team={visibleTeam}
          appointments={filteredAppointments}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={handleDrop}
          breaks={breaks}
        />
      )}
    </View>
  );
}

// Header Component
function Header({ 
  mode, 
  setMode, 
  current, 
  onPrev, 
  onNext, 
  team, 
  selectedProvider, 
  onSelectProvider, 
  onOpenSettings 
}: {
  mode: ViewMode;
  setMode: (v: ViewMode) => void;
  current: Date;
  onPrev: () => void;
  onNext: () => void;
  team: TeamMember[];
  selectedProvider: string | 'all';
  onSelectProvider: (id: string | 'all') => void;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.header} testID="calendar-header">
      <View style={styles.rowBetween}>
        <Text style={styles.title} testID="header-title">
          {formatHeader(current, mode)}
        </Text>
        <View style={styles.headerButtons}>
          <IconButton 
            icon={<ChevronLeft color="#fff" size={18} />} 
            onPress={onPrev} 
            testID="prev" 
          />
          <IconButton 
            icon={<ChevronRight color="#fff" size={18} />} 
            onPress={onNext} 
            testID="next" 
          />
          <IconButton 
            icon={<Settings color="#fff" size={18} />} 
            onPress={onOpenSettings} 
            testID="settings" 
          />
        </View>
      </View>
      
      <View style={styles.rowBetween}>
        <View style={styles.segment}>
          <SegmentButton 
            active={mode === 'day'} 
            onPress={() => setMode('day')} 
            icon={<UserSquare2 color={mode === 'day' ? '#111827' : '#374151'} size={16} />} 
            label="Day" 
            testID="seg-day" 
          />
          <SegmentButton 
            active={mode === 'week'} 
            onPress={() => setMode('week')} 
            icon={<CalendarDays color={mode === 'week' ? '#111827' : '#374151'} size={16} />} 
            label="Week" 
            testID="seg-week" 
          />
          <SegmentButton 
            active={mode === 'month'} 
            onPress={() => setMode('month')} 
            icon={<LayoutGrid color={mode === 'month' ? '#111827' : '#374151'} size={16} />} 
            label="Month" 
            testID="seg-month" 
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.providerChips}
        >
          <Chip 
            label="All" 
            active={selectedProvider === 'all'} 
            onPress={() => onSelectProvider('all')} 
            testID="chip-all" 
          />
          {team.map(t => (
            <Chip 
              key={t.id} 
              label={t.name} 
              active={selectedProvider === t.id} 
              onPress={() => onSelectProvider(t.id)} 
              testID={`chip-${t.id}`} 
            />
          ))}
        </ScrollView>
      </View>
      
      <Legend />
    </View>
  );
}

// View Components
function DayView({ 
  day, 
  team, 
  appointments, 
  dayStart, 
  dayEnd, 
  slotHeight, 
  onDrop, 
  breaks 
}: {
  day: Date;
  team: TeamMember[];
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const columns = team.length === 0 ? [{ id: 'none', name: 'Schedule' }] : team;
  const hourMarks = useMemo(() => getHourMarks(dayStart, dayEnd), [dayStart, dayEnd]);
  const containerHeight = (dayEnd - dayStart) * (slotHeight / 30);

  return (
    <ScrollView horizontal testID="day-view">
      <View style={[styles.gridContainer, { height: containerHeight }]}>        
        <View style={styles.columnHeaderRow}>
          <View style={styles.timeColHeader}>
            <Text style={styles.timeColHeaderText}>Time</Text>
          </View>
          {columns.map((c: any) => (
            <View key={c.id} style={styles.colHeader}>
              <Text style={styles.colHeaderText}>{c.name || 'Schedule'}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.row}>
          <TimeColumn dayStart={dayStart} dayEnd={dayEnd} slotHeight={slotHeight} />
          {columns.map((c: any) => (
            <DayColumn
              key={c.id}
              day={day}
              providerId={c.id}
              appointments={appointments.filter(a => 
                a.dateISO === isoDate(day) && 
                (!c.id || a.providerId === c.id)
              )}
              dayStart={dayStart}
              dayEnd={dayEnd}
              slotHeight={slotHeight}
              onDrop={onDrop}
              breaks={breaks.filter(b => 
                b.providerId === (c.id || 'all') && 
                b.dayISO === isoDate(day)
              )}
            />
          ))}
        </View>
        
        {hourMarks.map(m => (
          <View 
            key={m} 
            pointerEvents="none" 
            style={[
              styles.hourLine, 
              { top: (m - dayStart) * (slotHeight / 30) }
            ]} 
          />
        ))}
      </View>
    </ScrollView>
  );
}

function WeekView({ 
  days, 
  team, 
  appointments, 
  dayStart, 
  dayEnd, 
  slotHeight, 
  onDrop, 
  breaks 
}: {
  days: Date[];
  team: TeamMember[];
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const containerHeight = (dayEnd - dayStart) * (slotHeight / 30);

  return (
    <ScrollView horizontal testID="week-view">
      <View style={[styles.gridContainer, { height: containerHeight }]}>        
        <View style={styles.columnHeaderRow}>
          <View style={styles.timeColHeader}>
            <Text style={styles.timeColHeaderText}>Time</Text>
          </View>
          {days.map((d) => (
            <View key={d.toISOString()} style={styles.colHeader}>
              <Text style={styles.colHeaderText}>{formatWeekday(d)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.row}>
          <TimeColumn dayStart={dayStart} dayEnd={dayEnd} slotHeight={slotHeight} />
          {days.map((d) => (
            <DayColumn
              key={d.toISOString()}
              day={d}
              providerId={team[0]?.id}
              appointments={appointments.filter(a => a.dateISO === isoDate(d))}
              dayStart={dayStart}
              dayEnd={dayEnd}
              slotHeight={slotHeight}
              onDrop={onDrop}
              breaks={breaks.filter(b => b.dayISO === isoDate(d))}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MonthView({ 
  daysMatrix, 
  appointments, 
  current 
}: {
  daysMatrix: Date[][];
  appointments: AugmentedAppointment[];
  current: Date;
}) {
  return (
    <View style={styles.month} testID="month-view">
      {daysMatrix.map((row, i) => (
        <View key={`r-${i}`} style={styles.monthRow}>
          {row.map(d => {
            const count = appointments.filter(a => a.dateISO === isoDate(d)).length;
            return (
              <View 
                key={d.toISOString()} 
                style={[
                  styles.monthCell, 
                  !isSameMonth(d, current) && styles.monthCellMuted
                ]}
              >
                <Text style={styles.monthDay}>{d.getDate()}</Text>
                {count > 0 && (
                  <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>{count}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Utility Components
function Legend() {
  const entries = Object.entries(SERVICE_COLORS);
  return (
    <View style={styles.legend} testID="legend">
      {entries.map(([service, color]) => (
        <View key={service} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.legendText}>{service}</Text>
        </View>
      ))}
    </View>
  );
}

function SegmentButton({ 
  active, 
  onPress, 
  label, 
  icon, 
  testID 
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  icon: React.ReactNode;
  testID: string;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.segmentBtn, 
        active && styles.segmentBtnActive
      ]} 
      testID={testID}
    >
      <View style={styles.segmentBtnInner}>
        {icon}
        <Text style={[
          styles.segmentLabel, 
          active && styles.segmentLabelActive
        ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ 
  label, 
  active, 
  onPress, 
  testID 
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.chip, 
        active && styles.chipActive
      ]} 
      testID={testID}
    >
      <Text style={[
        styles.chipText, 
        active && styles.chipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function IconButton({ 
  icon, 
  onPress, 
  testID 
}: {
  icon: React.ReactNode;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} testID={testID}>
      {icon}
    </TouchableOpacity>
  );
}

function TimeColumn({ 
  dayStart, 
  dayEnd, 
  slotHeight 
}: {
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
}) {
  const labels = useMemo(() => getHourLabels(dayStart, dayEnd), [dayStart, dayEnd]);
  return (
    <View style={styles.timeCol}>
      {labels.map(label => (
        <View key={label} style={[styles.timeLabel, { height: slotHeight * 2 }]}>
          <Text style={styles.timeLabelText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function DayColumn({ 
  day, 
  providerId, 
  appointments, 
  dayStart, 
  dayEnd, 
  slotHeight, 
  onDrop, 
  breaks 
}: {
  day: Date;
  providerId?: string;
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const height = (dayEnd - dayStart) * (slotHeight / 30);
  return (
    <View style={[styles.dayCol, { height }]}>
      {breaks.map(breakItem => (
        <View 
          key={breakItem.id} 
          style={[
            styles.breakBlock, 
            { 
              top: (breakItem.start - dayStart) * (slotHeight / 30), 
              height: (breakItem.end - breakItem.start) * (slotHeight / 30) 
            }
          ]} 
        />
      ))}
      {appointments.map(apt => (
        <DraggableEvent
          key={apt.id}
          apt={apt}
          day={day}
          providerId={providerId}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={onDrop}
        />
      ))}
    </View>
  );
}

function DraggableEvent({ 
  apt, 
  day, 
  providerId, 
  dayStart, 
  dayEnd, 
  slotHeight, 
  onDrop 
}: {
  apt: AugmentedAppointment;
  day: Date;
  providerId?: string;
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
}) {
  const top = (apt.startMinutes - dayStart) * (slotHeight / 30);
  const height = apt.duration * (slotHeight / 30);
  const y = useRef(new Animated.Value(top)).current;
  const startY = useRef(top);
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gesture) => {
        const next = startY.current + gesture.dy;
        y.setValue(next);
      },
      onPanResponderRelease: async (_, gesture) => {
        setIsDragging(false);
        const next = startY.current + gesture.dy;
        const minutes = snapToMinutes(next);
        const snappedY = (minutes - dayStart) * (slotHeight / 30);
        
        Animated.timing(y, {
          toValue: snappedY,
          duration: 200,
          useNativeDriver: false,
        }).start();
        
        await onDrop(apt, minutes, day, providerId);
        startY.current = snappedY;
      },
    })
  ).current;

  const snapToMinutes = useCallback((valueY: number) => {
    const relative = Math.max(0, valueY);
    const minutes = dayStart + Math.round(relative / (slotHeight / 30)) * 30;
    return clamp(minutes, dayStart, dayEnd - apt.duration);
  }, [dayStart, dayEnd, slotHeight, apt.duration]);

  const color = SERVICE_COLORS[apt.serviceName] || SERVICE_COLORS.Default;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.event,
        { 
          top: y, 
          height, 
          borderLeftColor: color,
          opacity: isDragging ? 0.8 : 1,
          transform: [{ scale: isDragging ? 1.05 : 1 }]
        }
      ]}
      testID={`event-${apt.id}`}
    >
      <Text style={styles.eventTitle} numberOfLines={1}>
        {apt.serviceName}
      </Text>
      <Text style={styles.eventSub} numberOfLines={1}>
        {apt.providerName}
      </Text>
      <Text style={styles.eventTime}>
        {formatTimeRange(apt.startMinutes, apt.endMinutes)}
      </Text>
    </Animated.View>
  );
}

// Utility Functions
function formatHeader(current: Date, mode: ViewMode): string {
  if (mode === 'day') {
    return `${weekdayShort(current)}, ${monthShort(current)} ${current.getDate()}`;
  }
  if (mode === 'week') {
    const days = getWeekDays(current);
    const first = days[0];
    const last = days[6];
    return `${monthShort(first)} ${first.getDate()} - ${monthShort(last)} ${last.getDate()}`;
  }
  return `${monthShort(current)} ${current.getFullYear()}`;
}

function augmentAppointment(a: AppointmentDetails): AugmentedAppointment {
  const { start, end } = parseTimeRange(a.time);
  const dayISO = extractISOFromDisplayDate(a.date);
  return { 
    ...a, 
    startMinutes: start, 
    endMinutes: end, 
    duration: end - start, 
    dateISO: dayISO 
  };
}

function parseTimeRange(time: string): { start: number; end: number } {
  const parts = time.split('-').map(p => p.trim());
  const toMinutes = (timeStr: string) => {
    const [timePart, period] = timeStr.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    return totalHours * 60 + minutes;
  };
  
  return {
    start: toMinutes(parts[0] || '9:00 AM'),
    end: toMinutes(parts[1] || '9:30 AM')
  };
}

function formatTimeRange(start: number, end: number): string {
  return `${to12h(start)} - ${to12h(end)}`;
}

function to12h(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMins = mins.toString().padStart(2, '0');
  return `${displayHours}:${displayMins} ${period}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isSameView(apt: AugmentedAppointment, current: Date, mode: ViewMode): boolean {
  const aptDate = new Date(apt.dateISO);
  if (mode === 'day') return isSameDay(aptDate, current);
  if (mode === 'week') return isSameWeek(aptDate, current);
  return isSameMonth(aptDate, current);
}

function isoDate(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function formatDay(date: Date): string {
  return `${weekdayShort(date)}, ${monthShort(date)} ${date.getDate()}`;
}

function extractISOFromDisplayDate(displayDate: string): string {
  // Simple implementation - in real app, use proper date parsing
  const today = new Date();
  return isoDate(today);
}

function monthShort(date: Date): string {
  return MONTHS_SHORT[date.getMonth()];
}

function weekdayShort(date: Date): string {
  return ['SUN','MON','TUE','WED','THU','FRI','SAT'][date.getDay()];
}

function formatWeekday(date: Date): string {
  return `${weekdayShort(date)} ${date.getDate()}`;
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  const sunday = new Date(start.getFullYear(), start.getMonth(), diff);
  return Array.from({ length: 7 }, (_, i) => 
    new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i)
  );
}

function getMonthMatrix(date: Date): Date[][] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i));
    }
    weeks.push(row);
  }
  return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && 
         a.getMonth() === b.getMonth() && 
         a.getDate() === b.getDate();
}

function isSameWeek(a: Date, b: Date): boolean {
  const aWeek = getWeekDays(a)[0];
  const bWeek = getWeekDays(b)[0];
  return isSameDay(aWeek, bWeek);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getHourLabels(start: number, end: number): string[] {
  const labels: string[] = [];
  for (let minutes = start; minutes < end; minutes += 60) {
    labels.push(to12h(minutes));
  }
  return labels;
}

function getHourMarks(start: number, end: number): number[] {
  const marks: number[] = [];
  for (let minutes = start; minutes <= end; minutes += 60) {
    marks.push(minutes);
  }
  return marks;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function hasConflict(
  appointments: AugmentedAppointment[],
  excludeId: string,
  start: number,
  end: number,
  dayISO: string,
  providerId: string,
  breaks: BreakBlock[]
): boolean {
  // Check appointment conflicts
  for (const apt of appointments) {
    if (apt.id === excludeId) continue;
    if (apt.dateISO !== dayISO) continue;
    if (apt.providerId !== providerId) continue;
    if (rangeOverlap(start, end, apt.startMinutes, apt.endMinutes)) return true;
  }

  // Check break conflicts
  for (const breakItem of breaks) {
    if (breakItem.dayISO !== dayISO) continue;
    if (breakItem.providerId !== providerId && breakItem.providerId !== 'all') continue;
    if (rangeOverlap(start, end, breakItem.start, breakItem.end)) return true;
  }

  return false;
}

function rangeOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  return Math.max(a1, b1) < Math.min(a2, b2);
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B1220' 
  },
  headerButton: {
    marginLeft: 10,
    padding: 4
  },
  header: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 8, 
    backgroundColor: '#0B1220', 
    gap: 8 
  },
  title: { 
    color: '#F8FAFC', 
    fontSize: 20, 
    fontWeight: '600' 
  },
  rowBetween: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerButtons: { 
    flexDirection: 'row', 
    gap: 8 
  },
  iconBtn: { 
    padding: 8, 
    backgroundColor: '#111827', 
    borderRadius: 8 
  },
  segment: { 
    flexDirection: 'row', 
    backgroundColor: '#111827', 
    borderRadius: 10, 
    padding: 4, 
    gap: 6 
  },
  segmentBtn: { 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 8 
  },
  segmentBtnActive: { 
    backgroundColor: '#E5E7EB' 
  },
  segmentBtnInner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  segmentLabel: { 
    color: '#9CA3AF', 
    fontSize: 12 
  },
  segmentLabelActive: { 
    color: '#111827' 
  },
  providerChips: { 
    alignItems: 'center', 
    paddingHorizontal: 8 
  },
  chip: { 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    backgroundColor: '#0F172A', 
    borderRadius: 16, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: '#1F2937' 
  },
  chipActive: { 
    backgroundColor: '#1F2937', 
    borderColor: '#E5E7EB' 
  },
  chipText: { 
    color: '#9CA3AF', 
    fontSize: 12 
  },
  chipTextActive: { 
    color: '#F8FAFC' 
  },
  legend: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    paddingVertical: 4 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  legendDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5 
  },
  legendText: { 
    color: '#CBD5E1', 
    fontSize: 12 
  },
  gridContainer: { 
    paddingHorizontal: 8, 
    paddingBottom: 24 
  },
  columnHeaderRow: { 
    flexDirection: 'row' 
  },
  timeColHeader: { 
    width: 64, 
    paddingVertical: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  timeColHeaderText: { 
    color: '#94A3B8', 
    fontSize: 12 
  },
  colHeader: { 
    width: 220, 
    paddingVertical: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#1F2937' 
  },
  colHeaderText: { 
    color: '#E5E7EB', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  row: { 
    flexDirection: 'row' 
  },
  timeCol: { 
    width: 64 
  },
  timeLabel: { 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: '#1F2937', 
    justifyContent: 'flex-start', 
    paddingTop: 2 
  },
  timeLabelText: { 
    color: '#64748B', 
    fontSize: 10 
  },
  dayCol: { 
    width: 220, 
    borderLeftWidth: StyleSheet.hairlineWidth, 
    borderLeftColor: '#1F2937', 
    position: 'relative' 
  },
  hourLine: { 
    position: 'absolute', 
    left: 64, 
    right: 0, 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: '#1F2937' 
  },
  event: { 
    position: 'absolute', 
    left: 8, 
    right: 8, 
    backgroundColor: '#0F172A', 
    borderRadius: 10, 
    padding: 8, 
    borderLeftWidth: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  eventTitle: { 
    color: '#E5E7EB', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  eventSub: { 
    color: '#94A3B8', 
    fontSize: 11 
  },
  eventTime: { 
    color: '#CBD5E1', 
    fontSize: 10, 
    marginTop: 4 
  },
  breakBlock: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(239,68,68,0.12)', 
    borderWidth: 1, 
    borderColor: 'rgba(239,68,68,0.35)', 
    borderStyle: 'dashed' 
  },
  month: { 
    paddingHorizontal: 12, 
    paddingBottom: 24 
  },
  monthRow: { 
    flexDirection: 'row' 
  },
  monthCell: { 
    flex: 1, 
    aspectRatio: 1, 
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: '#1F2937', 
    padding: 6 
  },
  monthCellMuted: { 
    backgroundColor: '#0B1326' 
  },
  monthDay: { 
    color: '#CBD5E1', 
    fontSize: 12 
  },
  monthBadge: { 
    marginTop: 6, 
    backgroundColor: '#111827', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 8 
  },
  monthBadgeText: { 
    color: '#E5E7EB', 
    fontSize: 10 
  },
  banner: { 
    position: 'absolute', 
    top: 6, 
    alignSelf: 'center', 
    backgroundColor: '#10B981', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 10, 
    zIndex: 5 
  },
  bannerText: { 
    color: '#06221A', 
    fontSize: 12, 
    fontWeight: '600' 
  },
});