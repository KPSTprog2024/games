import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Star, Trophy, XCircle } from 'lucide-react';

// --- Types & Constants ---

type Point3D = { x: number; y: number; z: number };
type Difficulty = 'easy' | 'normal' | 'hard';
type GameMode = 'compare' | 'count' | 'menu';

const COLORS = {
  bg: 'bg-slate-50',
};

// --- Block Generation Logic ---

const generateBlocks = (count: number, difficulty: Difficulty): Point3D[] => {
  const blocks: Point3D[] = [];
  blocks.push({ x: 0, y: 0, z: 0 });

  while (blocks.length < count) {
    const candidates: Point3D[] = [];
    blocks.forEach((b) => {
      candidates.push({ x: b.x, y: b.y, z: b.z + 1 });
      const neighbors = [
        { x: b.x + 1, y: b.y, z: b.z },
        { x: b.x - 1, y: b.y, z: b.z },
        { x: b.x, y: b.y + 1, z: b.z },
        { x: b.x, y: b.y - 1, z: b.z },
      ];
      neighbors.forEach((n) => {
        if (n.z === 0) {
          candidates.push(n);
        } else {
          const hasSupport = blocks.some(
            (eb) => eb.x === n.x && eb.y === n.y && eb.z === n.z - 1,
          );
          if (hasSupport) candidates.push(n);
        }
      });
    });

    const validCandidates = candidates.filter((c) => {
      if (blocks.some((b) => b.x === c.x && b.y === c.y && b.z === c.z)) return false;
      const range = difficulty === 'easy' ? 2 : 3;
      if (Math.abs(c.x) > range || Math.abs(c.y) > range) return false;
      const maxHeight = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 2 : 3;
      if (c.z >= maxHeight) return false;
      return true;
    });

    if (validCandidates.length === 0) break;
    const nextBlock = validCandidates[Math.floor(Math.random() * validCandidates.length)];
    blocks.push(nextBlock);
  }
  return blocks;
};

// --- Isometric Drawing Component ---

const IsometricCanvas = ({ blocks, size = 300 }: { blocks: Point3D[]; size?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // サイズ調整: キャンバス内の解像度を上げて鮮明にする
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    const tileW = 40;
    const tileH = 20;
    const blockH = 35;

    ctx.clearRect(0, 0, size, size);

    const sortedBlocks = [...blocks].sort((a, b) => {
      const scoreA = a.x + a.y + a.z;
      const scoreB = b.x + b.y + b.z;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.z - b.z;
    });

    // 常に中央に配置するためのオフセット計算
    const centerX = size / 2;
    const centerY = size / 2 + 40;

    sortedBlocks.forEach((block) => {
      const screenX = centerX + (block.x - block.y) * tileW;
      const screenY = centerY + (block.x + block.y) * tileH - block.z * blockH;
      drawCube(ctx, screenX, screenY, tileW, tileH, blockH);
    });
  }, [blocks, size]);

  const drawCube = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tw: number,
    th: number,
    bh: number,
  ) => {
    const topColor = '#ffffff';
    const leftColor = '#e2e8f0';
    const rightColor = '#cbd5e1';
    const strokeColor = '#334155';

    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    // Top
    ctx.beginPath();
    ctx.moveTo(x, y - bh);
    ctx.lineTo(x + tw, y - th - bh);
    ctx.lineTo(x, y - th * 2 - bh);
    ctx.lineTo(x - tw, y - th - bh);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.moveTo(x, y - bh);
    ctx.lineTo(x + tw, y - th - bh);
    ctx.lineTo(x + tw, y - th);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = rightColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Left
    ctx.beginPath();
    ctx.moveTo(x, y - bh);
    ctx.lineTo(x - tw, y - th - bh);
    ctx.lineTo(x - tw, y - th);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = leftColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  };

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', maxWidth: '320px' }} />;
};

// --- Game Components ---

const GameScreen = () => {
  const [mode, setMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [leftBlocks, setLeftBlocks] = useState<Point3D[]>([]);
  const [rightBlocks, setRightBlocks] = useState<Point3D[]>([]);
  const [countBlocks, setCountBlocks] = useState<Point3D[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number | 'left' | 'right'>(0);

  const [keyForReset, setKeyForReset] = useState(0);

  const TOTAL_QUESTIONS = 5;

  const generateProblem = () => {
    setFeedback(null);
    setKeyForReset((k) => k + 1);

    let min = 3,
      max = 5;
    if (difficulty === 'normal') {
      min = 4;
      max = 7;
    }
    if (difficulty === 'hard') {
      min = 6;
      max = 9;
    }

    if (mode === 'compare') {
      let countL = Math.floor(Math.random() * (max - min + 1)) + min;
      let countR = Math.floor(Math.random() * (max - min + 1)) + min;

      while (countL === countR) {
        countR = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      setLeftBlocks(generateBlocks(countL, difficulty));
      setRightBlocks(generateBlocks(countR, difficulty));
      setCorrectAnswer(countL > countR ? 'left' : 'right');
    } else if (mode === 'count') {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      setCountBlocks(generateBlocks(count, difficulty));
      setCorrectAnswer(count);
    }
  };

  const startGame = (selectedMode: GameMode, selectedDiff: Difficulty) => {
    setMode(selectedMode);
    setDifficulty(selectedDiff);
    setQuestionIndex(0);
    setScore(0);
    setShowResult(false);
  };

  useEffect(() => {
    if (mode !== 'menu' && !showResult) {
      generateProblem();
    }
  }, [questionIndex, mode, showResult]);

  const handleAnswer = (answer: number | 'left' | 'right', event?: React.MouseEvent<HTMLButtonElement>) => {
    if (feedback) return;

    if (event) {
      event.currentTarget.blur();
    }

    const isCorrect = answer === correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (questionIndex < TOTAL_QUESTIONS - 1) {
        setQuestionIndex((i) => i + 1);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  const resetGame = () => {
    setMode('menu');
    setFeedback(null);
    setShowResult(false);
  };

  if (mode === 'menu') {
    return (
      <div className={`min-h-screen ${COLORS.bg} flex flex-col items-center justify-center p-4 font-sans select-none`}>
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border-4 border-blue-100">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">つみき の おけいこ</h1>
          <p className="text-slate-500 mb-8">おじゅけん に チャレンジ！</p>

          <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-bold text-lg text-slate-600">あそびかた</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startGame('compare', difficulty)}
                className="p-5 md:p-6 bg-blue-100 hover:bg-blue-200 rounded-3xl border-2 border-blue-300 transition-all flex flex-col items-center gap-3 active:scale-95 text-lg md:text-xl"
              >
                <div className="text-3xl">⚖️</div>
                <span className="font-bold text-blue-700">どっちが おおい？</span>
              </button>
              <button
                onClick={() => startGame('count', difficulty)}
                className="p-5 md:p-6 bg-amber-100 hover:bg-amber-200 rounded-3xl border-2 border-amber-300 transition-all flex flex-col items-center gap-3 active:scale-95 text-lg md:text-xl"
              >
                <div className="text-3xl">🔢</div>
                <span className="font-bold text-amber-700">なんこ ある？</span>
              </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-lg text-slate-600">むずかしさ</p>
            <div className="flex justify-center gap-2 bg-slate-100 p-2 rounded-xl">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${
                      difficulty === d ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-400'
                    }`}
                  >
                    {d === 'easy' && 'かんたん'}
                    {d === 'normal' && 'ふつう'}
                    {d === 'hard' && 'むずかしい'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={`min-h-screen ${COLORS.bg} flex flex-col items-center justify-center p-4 select-none`}>
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
          <Trophy className={`w-24 h-24 mx-auto mb-4 ${score === TOTAL_QUESTIONS ? 'text-yellow-400' : 'text-slate-300'}`} />
          <h2 className="text-3xl font-bold mb-2">よくできました！</h2>
          <div className="text-6xl font-black text-blue-600 mb-6">
            {score} <span className="text-2xl text-slate-400">/ {TOTAL_QUESTIONS}</span>
          </div>
          <div className="flex justify-center gap-2 mb-8 h-8">
            {[...Array(score)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-current animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <button
            onClick={resetGame}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <RefreshCw /> もういちど やる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLORS.bg} flex flex-col max-w-2xl mx-auto shadow-2xl bg-white select-none`}>
      <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
        <button onClick={resetGame} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
          もどる
        </button>
        <div className="flex gap-1">
          {[...Array(TOTAL_QUESTIONS)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < questionIndex ? 'bg-blue-500' : i === questionIndex ? 'bg-blue-200 animate-pulse' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="font-bold text-slate-500">だい {questionIndex + 1} もん</div>
      </div>

      <div className="p-4 md:p-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-700">
          {mode === 'compare' ? 'つみき は どっちが おおい？' : 'つみき は ぜんぶで なんこ？'}
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 pb-8 relative">
        {feedback && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300 rounded-xl">
            {feedback === 'correct' ? (
              <div className="animate-bounce mb-4">
                <div className="w-40 h-40 rounded-full border-8 border-red-500 flex items-center justify-center mx-auto">
                  <div className="w-24 h-24 rounded-full border-8 border-red-500 opacity-60" />
                </div>
                <p className="text-center text-red-500 font-bold text-4xl mt-4">せいかい！</p>
              </div>
            ) : (
              <div className="animate-pulse mb-4">
                <XCircle className="w-40 h-40 text-blue-500 mx-auto" />
                <p className="text-center text-blue-500 font-bold text-4xl mt-4">ざんねん...</p>
              </div>
            )}

            {mode === 'compare' && (
              <div className="flex gap-12 mt-4 text-2xl font-bold text-slate-600 bg-slate-100 p-6 rounded-2xl">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">ひだり</div>
                  <span className="text-4xl text-blue-600">{leftBlocks.length}</span> こ
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">みぎ</div>
                  <span className="text-4xl text-blue-600">{rightBlocks.length}</span> こ
                </div>
              </div>
            )}

            {mode === 'count' && feedback === 'wrong' && (
              <div className="mt-4 text-2xl font-bold text-slate-600 bg-slate-100 p-4 rounded-xl">
                こたえは <span className="text-4xl text-blue-600 mx-2">{countBlocks.length}</span> こ だよ
              </div>
            )}
          </div>
        )}

        {mode === 'compare' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full items-center max-w-full">
            <div
              onClick={() => handleAnswer('left')}
              className="relative aspect-square cursor-pointer group bg-slate-50 border-4 border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center overflow-hidden active:scale-95 max-w-[220px] w-full mx-auto"
            >
              <div className="w-full h-full p-3 sm:p-4">
                <IsometricCanvas blocks={leftBlocks} size={240} />
              </div>
              <div className="absolute bottom-4 bg-white/90 px-6 py-2 rounded-full font-bold text-slate-500 shadow-sm border border-slate-100">
                こっち！
              </div>
            </div>

            <div
              onClick={() => handleAnswer('right')}
              className="relative aspect-square cursor-pointer group bg-slate-50 border-4 border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center overflow-hidden active:scale-95 max-w-[220px] w-full mx-auto"
            >
              <div className="w-full h-full p-3 sm:p-4">
                <IsometricCanvas blocks={rightBlocks} size={240} />
              </div>
              <div className="absolute bottom-4 bg-white/90 px-6 py-2 rounded-full font-bold text-slate-500 shadow-sm border border-slate-100">
                こっち！
              </div>
            </div>
          </div>
        )}

        {mode === 'count' && (
          <div className="flex flex-col h-full items-center justify-start pt-4">
            <div className="w-full max-w-sm aspect-square bg-slate-50 border-4 border-slate-200 rounded-3xl mb-8 flex items-center justify-center overflow-hidden p-6 shadow-inner">
              <IsometricCanvas blocks={countBlocks} size={340} />
            </div>

            <div key={keyForReset} className="grid grid-cols-4 gap-4 w-full max-w-sm">
              {[...Array(9)].map((_, i) => {
                const num = i + 3;
                return (
                  <button
                    key={num}
                    onClick={(e) => handleAnswer(num, e)}
                    className="aspect-square bg-white border-b-4 border-slate-200 text-4xl md:text-5xl font-extrabold text-slate-600 rounded-3xl hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all active:border-b-0 active:translate-y-1 shadow-sm focus:outline-none"
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
