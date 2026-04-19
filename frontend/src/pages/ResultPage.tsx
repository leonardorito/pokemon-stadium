import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobbyStore } from '../store/lobbyStore';
import { useBattleStore } from '../store/battleStore';
import { StadiumButton } from '../components/StadiumButton';
import { spriteFor } from '../utils/sprites';

export function ResultPage() {
  const navigate = useNavigate();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);

  const winnerId = useBattleStore((s) => s.winnerId);
  const winnerNickname = useBattleStore((s) => s.winnerNickname);
  const teams = useBattleStore((s) => s.teams);
  const battleOver = useBattleStore((s) => s.battleOver);
  const playAgain = useBattleStore((s) => s.playAgain);

  useEffect(() => {
    if (!battleOver && !winnerNickname) {
      navigate('/');
    }
  }, [battleOver, winnerNickname, navigate]);

  const champion = useMemo(() => {
    if (!winnerId) return null;
    const team = teams[winnerId] ?? [];
    return team.find((p) => !p.defeated) ?? team[0] ?? null;
  }, [winnerId, teams]);

  const iWon = !!winnerId && winnerId === myPlayerId;
  const accentText = iWon ? 'text-arc-lime' : 'text-arc-magenta';

  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (champion) setSrc(spriteFor(champion, 'front'));
    else setSrc(null);
  }, [champion?.pokemonId]);

  const onPlayAgain = () => {
    playAgain();
    navigate('/join');
  };

  return (
    <div
      className="relative grid min-h-[70vh] place-items-center overflow-hidden"
      role="dialog"
      aria-label="Match result"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: iWon
            ? 'radial-gradient(ellipse at center, rgba(184,255,60,0.22), transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(255,46,151,0.22), transparent 70%)',
        }}
      />

      <div className="flex flex-col items-center gap-6 text-center">
        <div className={`stencil-label ${accentText}`}>▒ Final Bell</div>

        {champion && src && (
          <div className="animate-sprite-bob">
            <img
              key={champion.pokemonId}
              src={src}
              alt={champion.name}
              onError={(e) => {
                if (e.currentTarget.src !== champion.sprite) {
                  e.currentTarget.src = champion.sprite;
                }
              }}
              className="h-48 w-48 object-contain md:h-56 md:w-56"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}

        <div className="font-display text-5xl uppercase tracking-[0.18em] text-white md:text-7xl">
          {winnerNickname ?? 'Stadium'}
        </div>

        <div
          className={`font-pixel animate-victory-glow text-2xl tracking-[0.05em] uppercase ${accentText} md:text-4xl`}
          style={{ lineHeight: 1.2 }}
        >
          {iWon ? 'VICTORY' : 'KNOCKOUT'}
        </div>

        <StadiumButton variant={iWon ? 'lime' : 'magenta'} pulse onClick={onPlayAgain}>
          Play Again ↺
        </StadiumButton>
      </div>
    </div>
  );
}
