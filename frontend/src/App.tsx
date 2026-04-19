import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { SetupPage } from './pages/SetupPage';
import { JoinPage } from './pages/JoinPage';
import { LobbyPage } from './pages/LobbyPage';
import { BattlePage } from './pages/BattlePage';
import { ResultPage } from './pages/ResultPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<SetupPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>
    </Routes>
  );
}
