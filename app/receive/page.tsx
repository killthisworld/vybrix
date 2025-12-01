'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'missile1' | 'missile2' | 'missile3' | 'asteroid';
  speed: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

const STAR_COUNT = 100;
const GAME_AREA_BOTTOM = 75;

interface ReceiveResponse {
  status: string;
  message: string;
  minutesLeft?: number;
}

export default function ReceivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('');
  const [receivedMessage, setReceivedMessage] = useState<string>('');
  const [stars, setStars] = useState<Star[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<number>(5);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [ufoY, setUfoY] = useState(40);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isHit, setIsHit] = useState(false);
  const [score, setScore] = useState(0);
  const [showLanding, setShowLanding] = useState(false);
  const [landingProgress, setLandingProgress] = useState(0);
  
  const gameLoopRef = useRef<number | null>(null);
  const enemySpawnRef = useRef<number | null>(null);
  const coinSpawnRef = useRef<number | null>(null);
  const nextEnemyId = useRef(0);
  const nextBulletId = useRef(0);
  const nextExplosionId = useRef(0);
  const nextCoinId = useRef(0);

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 2 + 1,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    fetchMessage();
    const interval = setInterval(() => {
      fetchMessage();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      startGame();
    } else {
      stopGame();
    }
    return () => stopGame();
  }, [gameStarted]);

  useEffect(() => {
    if (status === 'received' && receivedMessage) {
      setGameStarted(false);
      saveScore();
      setShowLanding(true);
      animateLanding();
    }
  }, [status, receivedMessage]);

  const saveScore = async () => {
    try {
      const token = localStorage.getItem('vybrix_token');
      await fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, score }),
      });
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  };

  const animateLanding = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLandingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowLanding(false), 500);
      }
    }, 30);
  };

  const startGame = () => {
    enemySpawnRef.current = window.setInterval(() => {
      const rand = Math.random();
      let type: 'missile1' | 'missile2' | 'missile3' | 'asteroid';
      
      if (rand < 0.25) type = 'missile1';
      else if (rand < 0.5) type = 'missile2';
      else if (rand < 0.75) type = 'missile3';
      else type = 'asteroid';
      
      setEnemies(prev => [...prev, {
        id: nextEnemyId.current++,
        x: 100,
        y: Math.random() * (GAME_AREA_BOTTOM - 15) + 10,
        type,
        speed: Math.random() * 0.5 + 0.3
      }]);
    }, 2000);
    
    coinSpawnRef.current = window.setInterval(() => {
      setCoins(prev => [...prev, {
        id: nextCoinId.current++,
        x: 100,
        y: Math.random() * (GAME_AREA_BOTTOM - 15) + 10,
        rotation: 0
      }]);
    }, 3000);

    const gameLoop = () => {
      setEnemies(prev => prev
        .map(enemy => ({ ...enemy, x: enemy.x - enemy.speed }))
        .filter(enemy => enemy.x > -10)
      );

      setBullets(prev => prev
        .map(bullet => ({ ...bullet, x: bullet.x + 1.5 }))
        .filter(bullet => bullet.x < 105)
      );
      
      setCoins(prev => prev
        .map(coin => ({ ...coin, x: coin.x - 0.4, rotation: coin.rotation + 5 }))
        .filter(coin => coin.x > -10)
      );

      setExplosions(prev => prev
        .map(exp => ({ ...exp, frame: exp.frame + 1 }))
        .filter(exp => exp.frame < 15)
      );

      setBullets(prevBullets => {
        let newBullets = [...prevBullets];
        
        setEnemies(prevEnemies => {
          let newEnemies = [...prevEnemies];
          
          prevBullets.forEach(bullet => {
            prevEnemies.forEach(enemy => {
              const distance = Math.sqrt(
                Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
              );
              
              if (distance < 5) {
                newBullets = newBullets.filter(b => b.id !== bullet.id);
                newEnemies = newEnemies.filter(e => e.id !== enemy.id);
                setExplosions(prev => [...prev, {
                  id: nextExplosionId.current++,
                  x: enemy.x,
                  y: enemy.y,
                  frame: 0
                }]);
                setScore(prev => prev + 5);
              }
            });
          });
          
          return newEnemies;
        });
        
        return newBullets;
      });
      
      setCoins(prevCoins => {
        const ufoX = 15;
        return prevCoins.filter(coin => {
          const distance = Math.sqrt(
            Math.pow(ufoX - coin.x, 2) + Math.pow(ufoY - coin.y, 2)
          );
          
          if (distance < 10) {
            setScore(prev => prev + 10);
            return false;
          }
          return true;
        });
      });

      setEnemies(prevEnemies => {
        const ufoX = 15;
        let hit = false;
        
        const remainingEnemies = prevEnemies.filter(enemy => {
          const distance = Math.sqrt(
            Math.pow(ufoX - enemy.x, 2) + Math.pow(ufoY - enemy.y, 2)
          );
          
          if (distance < 8) {
            hit = true;
            setExplosions(prev => [...prev, {
              id: nextExplosionId.current++,
              x: enemy.x,
              y: enemy.y,
              frame: 0
            }]);
            return false;
          }
          return true;
        });
        
        if (hit) {
          setIsHit(true);
          setScore(0);
          setTimeout(() => setIsHit(false), 500);
        }
        
        return remainingEnemies;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const stopGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (enemySpawnRef.current) {
      clearInterval(enemySpawnRef.current);
    }
    if (coinSpawnRef.current) {
      clearInterval(coinSpawnRef.current);
    }
  };

  const moveUp = () => {
    setUfoY(prev => Math.max(10, prev - 5));
  };

  const moveDown = () => {
    setUfoY(prev => Math.min(GAME_AREA_BOTTOM, prev + 5));
  };

  const shoot = () => {
    setBullets(prev => [...prev, {
      id: nextBulletId.current++,
      x: 20,
      y: ufoY
    }]);
  };

  const fetchMessage = async () => {
    try {
      const token = localStorage.getItem('vybrix_token');

      if (!token) {
        setError('No session found. Please send a message first.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/receive?token=${token}`);
      const data: ReceiveResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error fetching message');
        setLoading(false);
        return;
      }

      setStatus(data.status);

      if (data.status === 'received') {
        setReceivedMessage(data.message);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
      setRefreshing(false);
      console.error(err);
    }
  };

  const handleReport = () => {
    const reason = prompt("Please describe why you're reporting this message:");
    if (reason && reason.trim()) {
      const token = localStorage.getItem('vybrix_token');
      const subject = encodeURIComponent('Inappropriate Message Report');
      const body = encodeURIComponent(
        `Reason: ${reason}\n\nToken: ${token}\n\nMessage: "${receivedMessage}"`
      );
      window.location.href = `mailto:vybrix.help@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white moving-star-slow"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.speed * 15}s`,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes moveStarsSlow {
            from { transform: translateX(100vw); }
            to { transform: translateX(-100vw); }
          }
          .moving-star-slow {
            animation: moveStarsSlow linear infinite;
          }
        `}</style>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-purple-300 text-lg">Tuning into your frequency...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showLanding) {
    const ufoLandingY = landingProgress;
    const planetY = 70 + (30 - landingProgress * 0.3);
    
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white moving-star-slow"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.speed * 15}s`,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes moveStarsSlow {
            from { transform: translateX(100vw); }
            to { transform: translateX(-100vw); }
          }
          .moving-star-slow {
            animation: moveStarsSlow linear infinite;
          }
        `}</style>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div 
            className="absolute"
            style={{
              left: '50%',
              top: `${planetY}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg width="300" height="300" viewBox="0 0 300 300">
              <defs>
                <radialGradient id="planetGrad">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>
              </defs>
              <circle cx="150" cy="150" r="140" fill="url(#planetGrad)" />
              <ellipse cx="150" cy="140" rx="100" ry="30" fill="#047857" opacity="0.5" />
              <ellipse cx="180" cy="160" rx="60" ry="20" fill="#047857" opacity="0.5" />
            </svg>
          </div>

          <div 
            className="absolute"
            style={{
              left: '50%',
              top: `${ufoLandingY}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg width="140" height="80" viewBox="0 0 140 80">
              <defs>
                <linearGradient id="saucerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="50%" stopColor="#6b7280" />
                  <stop offset="100%" stopColor="#4b5563" />
                </linearGradient>
                <radialGradient id="domeGrad" cx="50%" cy="40%">
                  <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
                </radialGradient>
              </defs>
              
              <ellipse cx="70" cy="50" rx="60" ry="18" fill="url(#saucerGrad)" />
              <ellipse cx="70" cy="47" rx="58" ry="15" fill="#d1d5db" opacity="0.3" />
              <ellipse cx="70" cy="38" rx="28" ry="20" fill="url(#domeGrad)" />
              
              <ellipse cx="70" cy="38" rx="8" ry="10" fill="#22c55e" />
              <ellipse cx="67" cy="36" rx="2.5" ry="3" fill="#000" />
              <ellipse cx="73" cy="36" rx="2.5" ry="3" fill="#000" />
              
              <ellipse cx="70" cy="35" rx="20" ry="14" fill="#e0f2fe" opacity="0.5" />
              <ellipse cx="70" cy="53" rx="60" ry="8" fill="#374151" opacity="0.5" />
              
              <circle cx="30" cy="52" r="4" fill="#ef4444" opacity="0.9" />
              <circle cx="50" cy="54" r="4" fill="#eab308" opacity="0.9" />
              <circle cx="70" cy="55" r="4" fill="#22c55e" opacity="0.9" />
              <circle cx="90" cy="54" r="4" fill="#3b82f6" opacity="0.9" />
              <circle cx="110" cy="52" r="4" fill="#a855f7" opacity="0.9" />
            </svg>
          </div>
        </div>

        <div className="fixed top-12 left-0 right-0 text-center z-30">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Message Received!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh' }} className="bg-black relative overflow-hidden flex flex-col">
      <style jsx>{`
        @keyframes moveStars {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }
        
        @keyframes moveStarsSlow {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.2; }
          50% { opacity: 1; }
          75% { opacity: 0.2; }
        }
        
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes ufoGlow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.8)); }
        }
        
        .moving-star {
          animation: moveStars linear infinite;
        }
        
        .moving-star-slow {
          animation: moveStarsSlow linear infinite;
        }
        
        .flickering {
          animation: flicker 0.5s;
        }
        
        .loading-dot {
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        
        .ufo-glow {
          animation: ufoGlow 2s ease-in-out infinite;
        }
      `}</style>

      {(status === 'waiting' || status === 'pending') && !gameStarted && (
        <>
          <div className="fixed inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white moving-star-slow"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDuration: `${star.speed * 15}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4">
            <div className="text-center mb-6">
              <div className="mb-4">
                <div className="inline-block">
                  <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Scouring the ether for your match
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full loading-dot" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full loading-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full loading-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
              
              <button
                onClick={() => setGameStarted(true)}
                className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-lg md:text-xl font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all transform hover:scale-105"
              >
                🎮 Play Game While You Wait!
              </button>
              
              <p className="text-purple-300/70 text-xs md:text-sm mt-3">
                Highest score gets their message shared on the leaderboard!
              </p>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </>
      )}

      {(status === 'waiting' || status === 'pending') && gameStarted && (
        <>
          {/* Game Screen Area */}
          <div style={{ height: 'calc(100dvh - 100px)' }} className="relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden border-b-4 border-purple-500/50">
              {stars.map((star, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white moving-star"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    animationDuration: `${star.speed * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30 text-base md:text-xl font-bold text-cyan-400 bg-black/50 px-2 py-1 md:px-3 md:py-1 rounded-lg">
              Score: {score}
            </div>

            <div 
              className={`absolute z-20 ufo-glow ${isHit ? 'flickering' : ''}`}
              style={{
                left: '15%',
                top: `${ufoY}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'top 0.15s ease-out'
              }}
            >
              <svg width="80" height="48" viewBox="0 0 140 80" className="md:w-[100px] md:h-[60px]">
                <defs>
                  <linearGradient id="saucerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="50%" stopColor="#6b7280" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>
                  <radialGradient id="domeGrad" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
                  </radialGradient>
                </defs>
                
                <ellipse cx="70" cy="50" rx="60" ry="18" fill="url(#saucerGrad)" />
                <ellipse cx="70" cy="47" rx="58" ry="15" fill="#d1d5db" opacity="0.3" />
                <ellipse cx="70" cy="38" rx="28" ry="20" fill="url(#domeGrad)" />
                
                <ellipse cx="70" cy="38" rx="8" ry="10" fill="#22c55e" />
                <ellipse cx="67" cy="36" rx="2.5" ry="3" fill="#000" />
                <ellipse cx="73" cy="36" rx="2.5" ry="3" fill="#000" />
                
                <ellipse cx="70" cy="35" rx="20" ry="14" fill="#e0f2fe" opacity="0.5" />
                <ellipse cx="70" cy="53" rx="60" ry="8" fill="#374151" opacity="0.5" />
                
                <circle cx="30" cy="52" r="4" fill="#ef4444" opacity="0.9" />
                <circle cx="50" cy="54" r="4" fill="#eab308" opacity="0.9" />
                <circle cx="70" cy="55" r="4" fill="#22c55e" opacity="0.9" />
                <circle cx="90" cy="54" r="4" fill="#3b82f6" opacity="0.9" />
                <circle cx="110" cy="52" r="4" fill="#a855f7" opacity="0.9" />
              </svg>
            </div>

            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className="absolute w-3 h-1.5 md:w-4 md:h-2 bg-yellow-400 rounded-full z-15"
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  boxShadow: '0 0 15px #fbbf24'
                }}
              />
            ))}

            {coins.map(coin => (
              <div
                key={coin.id}
                className="absolute z-15"
                style={{
                  left: `${coin.x}%`,
                  top: `${coin.y}%`,
                  transform: `translate(-50%, -50%) rotateY(${coin.rotation}deg)`
                }}
              >
                <svg width="32" height="32" viewBox="0 0 40 40" className="md:w-[40px] md:h-[40px]">
                  <defs>
                    <radialGradient id="coinGrad">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                  </defs>
                  <circle cx="20" cy="20" r="15" fill="url(#coinGrad)" stroke="#92400e" strokeWidth="2" />
                  <text x="20" y="25" fontSize="16" fontWeight="bold" fill="#92400e" textAnchor="middle">$</text>
                </svg>
              </div>
            ))}

            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute z-15"
                style={{
                  left: `${enemy.x}%`,
                  top: `${enemy.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {enemy.type === 'missile1' ? (
                  <svg width="40" height="16" viewBox="0 0 50 20" className="md:w-[50px] md:h-[20px]">
                    <defs>
                      <linearGradient id="missile1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#991b1b" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <path d="M 5 10 L 40 4 L 48 10 L 40 16 Z" fill="url(#missile1Grad)" />
                    <circle cx="42" cy="10" r="2" fill="#fbbf24">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <polygon points="2,10 8,7 8,13" fill="#7f1d1d" />
                  </svg>
                ) : enemy.type === 'missile2' ? (
                  <svg width="40" height="16" viewBox="0 0 50 20" className="md:w-[50px] md:h-[20px]">
                    <defs>
                      <linearGradient id="missile2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#581c87" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <path d="M 5 10 L 40 5 L 48 10 L 40 15 Z" fill="url(#missile2Grad)" />
                    <circle cx="42" cy="10" r="2" fill="#22d3ee">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
                    </circle>
                    <polygon points="2,10 8,8 8,12" fill="#4c1d95" />
                  </svg>
                ) : enemy.type === 'missile3' ? (
                  <svg width="40" height="16" viewBox="0 0 50 20" className="md:w-[50px] md:h-[20px]">
                    <defs>
                      <linearGradient id="missile3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#065f46" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <path d="M 5 10 L 40 6 L 48 10 L 40 14 Z" fill="url(#missile3Grad)" />
                    <circle cx="42" cy="10" r="2" fill="#fbbf24">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="0.7s" repeatCount="indefinite" />
                    </circle>
                    <polygon points="2,10 8,8.5 8,11.5" fill="#064e3b" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 40 40" className="md:w-[40px] md:h-[40px]">
                    <circle cx="20" cy="20" r="16" fill="#78716c" />
                    <circle cx="15" cy="15" r="4" fill="#57534e" />
                    <circle cx="26" cy="22" r="5" fill="#57534e" />
                    <circle cx="17" cy="26" r="3" fill="#57534e" />
                  </svg>
                )}
              </div>
            ))}

            {explosions.map(explosion => {
              const scale = 1 + (explosion.frame * 0.1);
              const opacity = 1 - (explosion.frame / 15);
              return (
                <div
                  key={explosion.id}
                  className="absolute z-25"
                  style={{
                    left: `${explosion.x}%`,
                    top: `${explosion.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: opacity
                  }}
                >
                  <svg width={50 * scale} height={50 * scale} viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="25" fill="#ff4500" opacity="0.8" />
                    <circle cx="30" cy="30" r="20" fill="#ff6347" opacity="0.9" />
                    <circle cx="30" cy="30" r="15" fill="#ffa500" />
                    <circle cx="30" cy="30" r="10" fill="#ffff00" />
                    <circle cx="30" cy="30" r="5" fill="#ffffff" />
                    <circle cx="20" cy="20" r="4" fill="#ff4500" opacity="0.7" />
                    <circle cx="40" cy="25" r="3" fill="#ffa500" opacity="0.8" />
                    <circle cx="25" cy="40" r="3" fill="#ff6347" opacity="0.6" />
                    <circle cx="35" cy="38" r="4" fill="#ff4500" opacity="0.7" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Controller Area - fixed 100px */}
          <div className="h-[100px] bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-purple-500/50 flex items-center justify-center gap-4 md:gap-12 px-4 md:px-8 flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={moveUp}
                className="w-12 h-12 md:w-14 md:h-14 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-lg md:text-xl font-bold active:scale-95 transition-all shadow-lg"
              >
                ▲
              </button>
              <button
                onClick={moveDown}
                className="w-12 h-12 md:w-14 md:h-14 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-lg md:text-xl font-bold active:scale-95 transition-all shadow-lg"
              >
                ▼
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/" 
                onClick={() => setGameStarted(false)}
                className="text-purple-300/70 hover:text-purple-300 text-xs md:text-sm transition-colors block"
              >
                ← Exit
              </Link>
            </div>
            
            <button
              onClick={shoot}
              className="w-16 h-16 md:w-20 md:h-20 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm md:text-base font-bold active:scale-95 transition-all shadow-2xl"
            >
              SHOOT
            </button>
          </div>
        </>
      )}

      {status === 'received' && receivedMessage && !showLanding && (
        <>
          <div className="fixed inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white moving-star-slow"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDuration: `${star.speed * 15}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              <div className="border-2 border-green-400/50 rounded-lg p-6 md:p-8 bg-green-400/5 backdrop-blur">
                <div className="mb-6 text-center">
                  <h2 className="text-xl md:text-2xl font-semibold text-green-300">
                    ✓ Match Found
                  </h2>
                  <p className="text-green-200/60 text-xs md:text-sm mt-1">
                    A resonant frequency has reached you
                  </p>
                  <p className="text-cyan-400 text-base md:text-lg mt-2 font-bold">
                    Final Score: {score} 🏆
                  </p>
                </div>

                <div className="bg-black/40 rounded-lg p-4 md:p-6 border border-purple-400/20 mb-6">
                  <p className="text-white leading-relaxed text-base md:text-lg">
                    {receivedMessage}
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-purple-300/60 text-xs md:text-sm">
                    Send another message tomorrow to receive a new match
                  </p>
                  <button
                    onClick={handleReport}
                    className="text-red-400/70 hover:text-red-400 text-xs underline transition-colors"
                  >
                    Report inappropriate content
                  </button>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm">
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {status === 'no_message_sent' && (
        <>
          <div className="fixed inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white moving-star-slow"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDuration: `${star.speed * 15}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              <div className="border-2 border-purple-400/30 rounded-lg p-6 md:p-8 bg-purple-400/5 backdrop-blur text-center">
                <h2 className="text-lg md:text-xl font-semibold text-purple-300 mb-4">
                  Share Your Message First
                </h2>
                <p className="text-purple-200/60 mb-6 text-sm md:text-base">
                  Send a message to receive one that resonates with your energy.
                </p>
                <Link
                  href="/send"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Send a Message
                </Link>
              </div>

              <div className="text-center mt-8">
                <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm">
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {status === 'no_match_found' && (
        <>
          <div className="fixed inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white moving-star-slow"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDuration: `${star.speed * 15}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              <div className="border-2 border-purple-400/30 rounded-lg p-6 md:p-8 bg-purple-400/5 backdrop-blur text-center">
                <h2 className="text-lg md:text-xl font-semibold text-purple-300 mb-4">
                  No Match Today
                </h2>
                <p className="text-purple-200/60 mb-6 text-sm md:text-base">
                  Your frequency couldn't find a resonant match in today's pool. Try again tomorrow!
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Back to Home
                </Link>
              </div>

              <div className="text-center mt-8">
                <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm">
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
