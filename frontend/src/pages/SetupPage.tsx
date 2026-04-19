import { useNavigate } from 'react-router-dom';
import { StadiumButton } from '../components/StadiumButton';

export function SetupPage() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="stencil-label text-arc-cyan">▒ Welcome to the broadcast booth</div>
        <h1 className="font-display text-6xl uppercase leading-[0.95] md:text-8xl">
          <span className="block text-white">Pokémon</span>
          <span className="block text-arc-yellow">Stadium Lite</span>
        </h1>
        <p className="max-w-md font-mono text-base leading-relaxed text-white/70">
          A real-time Pokémon battle arena.
        </p>
        <StadiumButton variant="primary" pulse onClick={() => navigate('/join')}>
          Battle Now ▸
        </StadiumButton>
      </div>
    </div>
  );
}
