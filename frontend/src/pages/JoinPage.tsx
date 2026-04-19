import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobbyStore } from '../store/lobbyStore';
import { connect } from '../services/socketService';
import { StadiumButton } from '../components/StadiumButton';

export function JoinPage() {
  const navigate = useNavigate();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const myNickname = useLobbyStore((s) => s.myNickname);
  const isRehydrating = useLobbyStore((s) => s.isRehydrating);
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);
  const joinLobby = useLobbyStore((s) => s.joinLobby);
  const setError = useLobbyStore((s) => s.setError);

  const [nickname, setNickname] = useState(myNickname || '');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && myPlayerId) navigate('/lobby');
  }, [submitted, myPlayerId, navigate]);

  if (isRehydrating) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedNick = nickname.trim();
    if (!trimmedNick) {
      setError('Pick a trainer name first');
      return;
    }
    setMyNickname(trimmedNick);
    try {
      connect();
    } catch {
      setError('Could not open the broadcast channel');
      return;
    }
    setSubmitted(true);
    joinLobby(trimmedNick);
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[2fr_3fr]">
      <aside className="panel relative overflow-hidden p-6">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="relative space-y-4">
          <div className="hud-tag text-arc-magenta">CHECK-IN</div>
          <h2 className="font-display text-2xl tracking-widest text-white uppercase leading-tight">
            Booth's wired.
            <br />
            Drop your name.
          </h2>
          <p className="font-mono text-sm text-white/65">
            Two trainers per arena. First in, first slot. The opponent pop-ups the moment they take
            the field.
          </p>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="stencil-label text-arc-magenta">▒ Step 02 / Trainer Identity</div>
        <h1 className="text-5xl uppercase md:text-7xl">
          <span className="block text-white">Sign the</span>
          <span className="block text-arc-cyan">Roster.</span>
        </h1>

        <form onSubmit={submit} className="panel space-y-5 p-6">
          <div className="space-y-3">
            <label className="stencil-label block text-arc-cyan">▼ Trainer Name</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ASH, MISTY, RED…"
              maxLength={20}
              className="w-full border-2 border-stadium-edge bg-stadium-deep px-4 py-4 font-display text-3xl tracking-[0.2em] text-arc-yellow uppercase placeholder-white/20 outline-none transition focus:border-arc-cyan focus:shadow-[0_0_0_3px_rgba(33,212,253,0.2)]"
              autoFocus
              spellCheck={false}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.7rem] tracking-widest text-white/45 uppercase">
              ▸ Trainer name saved locally so you can rejoin
            </p>
            <StadiumButton type="submit" variant="cyan" disabled={submitted && !myPlayerId}>
              {submitted && !myPlayerId ? 'Waiting…' : 'Take the Field ▸'}
            </StadiumButton>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {['LIVE', 'ARENA', '2/2', 'GO'].map((tag, i) => (
            <div
              key={tag}
              className="panel flex flex-col items-center justify-center gap-1 p-3 text-center"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="font-display text-xl tracking-widest text-arc-yellow">{tag}</span>
              <span className="stencil-label">CHECK 0{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
