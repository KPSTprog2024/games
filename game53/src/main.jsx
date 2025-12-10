import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, BatteryCharging, Zap } from 'lucide-react';

/**
 * BRUTALIST INTERVAL ALARM v1.3
 * * Aesthetic: Raw, Unapologetic, Functional.
 * * Updates: Added direct number input capability to Stepper controls.
 */

// --- Audio Engine (Web Audio API) ---
const audioContextRef = { current: null };

const initAudio = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContextRef.current.state === 'suspended') {
    audioContextRef.current.resume();
  }
};

const playSound = (type) => {
  if (!audioContextRef.current) return;

  const ctx = audioContextRef.current;
  const now = ctx.currentTime;

  const playTone = (frequency, type, startTime, duration, gainValue = 0.3) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(gainValue, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  switch (type) {
    case 'switch_a_to_b':
      // Lower, double blip for A -> B (swapped from previous B sound)
      playTone(600, 'triangle', now, 0.08, 0.4);
      playTone(800, 'triangle', now + 0.12, 0.08, 0.4);
      break;

    case 'switch_b_to_a':
      // Sharp, high-pitched double blip for B -> A (swapped from previous A sound)
      playTone(1200, 'square', now, 0.1, 0.3);
      playTone(1400, 'square', now + 0.12, 0.1, 0.25);
      break;

    case 'finish': {
      // Long completion alarm
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sawtooth';

      [0, 0.2, 0.4].forEach((t) => {
        playTone(880, 'square', now + t, 0.1, 0.3);
      });

      osc.frequency.setValueAtTime(440, now + 0.6);
      osc.frequency.linearRampToValueAtTime(220, now + 2.5);
      gainNode.gain.setValueAtTime(0.5, now + 0.6);
      gainNode.gain.linearRampToValueAtTime(0, now + 2.5);

      osc.start(now + 0.6);
      osc.stop(now + 2.5);
      break;
    }
    default:
      break;
  }
};

// --- Components ---

const BrutalistButton = ({ onClick, children, className = '', active = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative group overflow-hidden font-mono font-bold text-lg uppercase tracking-wider
      border-4 border-black transition-all duration-75
      disabled:opacity-50 disabled:cursor-not-allowed
      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1
      flex items-center justify-center gap-2 p-4 select-none
      ${
        active
          ? 'bg-black text-white shadow-none translate-x-1 translate-y-1'
          : 'bg-white text-black hover:bg-yellow-300 active:bg-black active:text-white'
      }
      ${className}
    `}
  >
    {children}
  </button>
);

const StepperRow = ({ label, value, onChange, steps, max = 99, suffix = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    let n = parseInt(tempValue, 10);
    if (Number.isNaN(n) || n < 0) n = 0;
    if (n > max) n = max;

    onChange(n);
    setTempValue(n);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleFocus = (e) => {
    setIsEditing(true);
    e.target.select();
  };

  return (
    <div className="StepperRow flex flex-wrap items-center gap-2 mb-3">
      <div className="w-16 font-bold bg-black text-white p-1 text-center text-xs">{label}</div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          max={max}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="
            text-xl font-bold w-16 text-center border-4 border-black bg-yellow-100 p-0.5
            focus:outline-none tabular-nums
          "
          autoFocus
        />
      ) : (
        <div
          onClick={handleFocus}
          className="
            text-xl font-bold w-16 text-center border-b-4 border-black bg-white select-none cursor-pointer
            hover:bg-gray-100 transition-colors
          "
        >
          {value}
          {suffix}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => {
              let n = value + step;
              if (n < 0) n = 0;
              if (n > max) n = max;
              onChange(n);
            }}
            className="h-8 min-w-[32px] px-1 border-2 border-black font-bold text-xs bg-white hover:bg-black hover:text-white transition-colors active:bg-gray-800"
            disabled={value + step < 0 || value + step > max}
          >
            {step > 0 ? '+' : ''}
            {step}
          </button>
        ))}
      </div>
    </div>
  );
};

const PresetButton = ({ title, sub, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col justify-center h-full text-xs font-bold border-2 border-black p-2 bg-white hover:bg-black hover:text-white transition-colors text-left"
  >
    <span className="uppercase">{title}</span>
    <span className="opacity-60">{sub}</span>
  </button>
);

function IntervalAlarmApp() {
  const [intervalA, setIntervalA] = useState({ m: 1, s: 0 });
  const [intervalB, setIntervalB] = useState({ m: 0, s: 30 });
  const [targetCycles, setTargetCycles] = useState(10);

  const [status, setStatus] = useState('idle');
  const [phase, setPhase] = useState('A');
  const [timeLeft, setTimeLeft] = useState(60);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [flash, setFlash] = useState(false);

  const timerRef = useRef(null);
  const endTimeRef = useRef(null);
  const pausedTimeLeftRef = useRef(null);

  const toSeconds = (t) => t.m * 60 + t.s;

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerVisualAlarm = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const switchPhase = useCallback(() => {
    if (phase === 'A') {
      setPhase('B');
      const nextTime = toSeconds(intervalB);
      setTimeLeft(nextTime);
      endTimeRef.current = Date.now() + nextTime * 1000;
      if (isSoundOn) playSound('switch_a_to_b');
      triggerVisualAlarm();
    } else {
      const currentCyclesFinished = completedCycles + 1;

      if (currentCyclesFinished >= targetCycles) {
        setCompletedCycles(currentCyclesFinished);
        setStatus('finished');
        if (isSoundOn) playSound('finish');
        triggerVisualAlarm();
        clearInterval(timerRef.current);
        setTimeLeft(0);
      } else {
        setPhase('A');
        setCompletedCycles(currentCyclesFinished);
        const nextTime = toSeconds(intervalA);
        setTimeLeft(nextTime);
        endTimeRef.current = Date.now() + nextTime * 1000;
        if (isSoundOn) playSound('switch_b_to_a');
        triggerVisualAlarm();
      }
    }
  }, [phase, intervalA, intervalB, completedCycles, targetCycles, isSoundOn]);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.ceil((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      clearInterval(timerRef.current);
      switchPhase();
    } else {
      setTimeLeft(remaining);
    }
  }, [switchPhase]);

  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, 100);
    }
  }, [status, phase, tick, timeLeft]);

  const startTimer = () => {
    initAudio();
    if (status === 'finished') {
      resetTimer();
      return;
    }
    if (status === 'running') return;

    let duration = timeLeft;
    let newEndTime;

    if (status === 'idle') {
      duration = toSeconds(intervalA);
      setTimeLeft(duration);
      setPhase('A');
      setCompletedCycles(0);
      newEndTime = Date.now() + duration * 1000;
    } else if (status === 'paused') {
      duration = pausedTimeLeftRef.current;
      newEndTime = Date.now() + duration * 1000;
    }

    endTimeRef.current = newEndTime;
    setStatus('running');
  };

  const pauseTimer = () => {
    if (status !== 'running') return;
    clearInterval(timerRef.current);
    setStatus('paused');
    pausedTimeLeftRef.current = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    if (pausedTimeLeftRef.current < 0) pausedTimeLeftRef.current = 0;
    setTimeLeft(pausedTimeLeftRef.current);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setStatus('idle');
    setPhase('A');
    setCompletedCycles(0);
    setTimeLeft(toSeconds(intervalA));
    setFlash(false);
    pausedTimeLeftRef.current = null;
    endTimeRef.current = null;
  };

  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(toSeconds(intervalA));
    }
  }, [intervalA, status]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const containerClass = `
    min-h-screen w-full flex flex-col font-mono transition-colors duration-100
    ${flash ? 'bg-black invert' : 'bg-[#e0e0e0]'}
  `;

  const isPhaseB = phase === 'B' && status !== 'idle' && status !== 'finished';

  const panelClass = `
    border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-4 relative transition-colors duration-200
    ${isPhaseB ? 'bg-black text-white' : 'bg-white text-black'}
  `;

  return (
    <div className={containerClass}>
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <header className="relative z-10 p-4 border-b-4 border-black bg-white text-black flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black"></div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Interval_OS_v1.3</h1>
        </div>
        <button
          onClick={() => {
            setIsSoundOn(!isSoundOn);
            if (!isSoundOn) initAudio();
          }}
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          {isSoundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full p-4 gap-4 justify-center">
        <div className={panelClass}>
          <div
            className={`flex justify-between items-end mb-2 border-b-4 pb-2 ${isPhaseB ? 'border-white' : 'border-black'}`}
          >
            <span className={`text-2xl font-black uppercase ${status === 'finished' ? 'text-green-600' : ''}`}>
              {status === 'finished' ? 'COMPLETE' : phase === 'A' ? 'FOCUS' : 'BREAK'}
            </span>
            <span className={`font-bold px-2 py-1 text-sm ${isPhaseB ? 'bg-white text-black' : 'bg-black text-white'}`}>
              {phase === 'A' ? 'INT_A' : 'INT_B'}
            </span>
          </div>

          <div className="relative py-8 text-center">
            <div className="text-[18vw] sm:text-[5rem] leading-none font-black tracking-tighter tabular-nums select-none">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className={`flex items-center gap-2 mt-4 font-bold border-t-4 pt-4 ${isPhaseB ? 'border-white' : 'border-black'}`}>
            <div className={`w-full h-6 border-2 relative ${isPhaseB ? 'bg-gray-800 border-white' : 'bg-gray-300 border-black'}`}>
              <div
                className={`h-full transition-all duration-300 ${isPhaseB ? 'bg-white' : 'bg-black'}`}
                style={{ width: `${Math.min((completedCycles / targetCycles) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="whitespace-nowrap min-w-[100px] text-right">
              CYC {completedCycles.toString().padStart(2, '0')}/{targetCycles}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 h-24 text-black">
          <BrutalistButton onClick={resetTimer} className="bg-white hover:bg-red-100">
            <RotateCcw size={20} /> RESET
          </BrutalistButton>

          {status === 'running' ? (
            <BrutalistButton onClick={pauseTimer} active className="text-xl">
              <Pause size={24} fill="currentColor" /> STOP
            </BrutalistButton>
          ) : (
            <BrutalistButton onClick={startTimer} className="bg-yellow-300 text-xl font-black text-2xl">
              <Play size={28} fill="currentColor" /> {status === 'paused' ? 'RESUME' : 'START'}
            </BrutalistButton>
          )}
        </div>

        <div className="mt-4 text-black">
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={status === 'running' || status === 'paused'}
            className="w-full flex justify-between items-center p-3 border-4 border-black bg-white font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Settings size={18} /> CONFIGURATION
            </span>
            <span>{showSettings ? '[-]' : '[+]'}</span>
          </button>

          {showSettings && (
            <div className="border-x-4 border-b-4 border-black bg-white p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="mb-6 border-b-2 border-black border-dashed pb-4">
                <div className="flex items-center gap-2 font-bold text-blue-600 mb-2 uppercase">
                  <Zap size={18} /> Interval A (Focus)
                </div>
                <StepperRow
                  label="MIN"
                  value={intervalA.m}
                  onChange={(v) => setIntervalA({ ...intervalA, m: v })}
                  steps={[+5, +1, -1, -5]}
                  max={99}
                />
                <StepperRow
                  label="SEC"
                  value={intervalA.s}
                  onChange={(v) => setIntervalA({ ...intervalA, s: v })}
                  steps={[+10, +5, -5, -10]}
                  max={59}
                />
              </div>

              <div className="mb-6 border-b-2 border-black border-dashed pb-4">
                <div className="flex items-center gap-2 font-bold text-red-600 mb-2 uppercase">
                  <BatteryCharging size={18} /> Interval B (Break)
                </div>
                <StepperRow
                  label="MIN"
                  value={intervalB.m}
                  onChange={(v) => setIntervalB({ ...intervalB, m: v })}
                  steps={[+5, +1, -1, -5]}
                  max={99}
                />
                <StepperRow
                  label="SEC"
                  value={intervalB.s}
                  onChange={(v) => setIntervalB({ ...intervalB, s: v })}
                  steps={[+10, +5, -5, -10]}
                  max={59}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 font-bold text-black mb-2 uppercase">
                  <RotateCcw size={18} /> Total Cycles
                </div>
                <StepperRow
                  label="COUNT"
                  value={targetCycles}
                  onChange={(v) => setTargetCycles(v < 1 ? 1 : v)}
                  steps={[+5, +1, -1, -5]}
                  max={50}
                />
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold mb-2 uppercase bg-black text-white w-fit px-1">Presets</div>
                <div className="grid grid-cols-2 gap-2">
                  <PresetButton
                    title="Pomodoro"
                    sub="25m / 5m (x4)"
                    onClick={() => {
                      setIntervalA({ m: 25, s: 0 });
                      setIntervalB({ m: 5, s: 0 });
                      setTargetCycles(4);
                    }}
                  />
                  <PresetButton
                    title="Workout"
                    sub="1m / 30s (x10)"
                    onClick={() => {
                      setIntervalA({ m: 1, s: 0 });
                      setIntervalB({ m: 0, s: 30 });
                      setTargetCycles(10);
                    }}
                  />
                  <PresetButton
                    title="Plank"
                    sub="30s / 20s (x3)"
                    onClick={() => {
                      setIntervalA({ m: 0, s: 30 });
                      setIntervalB({ m: 0, s: 20 });
                      setTargetCycles(3);
                    }}
                  />
                  <PresetButton
                    title="Tabata"
                    sub="20s / 10s (x8)"
                    onClick={() => {
                      setIntervalA({ m: 0, s: 20 });
                      setIntervalB({ m: 0, s: 10 });
                      setTargetCycles(8);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 text-center font-bold text-xs uppercase tracking-widest opacity-40 mix-blend-multiply text-black">
        SYSTEM READY // BRUTALIST_MODE // v1.3
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;800&display=swap');
        body { font-family: 'JetBrains Mono', monospace; }

        .StepperRow input[type="number"]::-webkit-inner-spin-button,
        .StepperRow input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IntervalAlarmApp />
  </React.StrictMode>,
);
