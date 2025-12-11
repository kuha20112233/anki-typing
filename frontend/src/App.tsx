import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Game, Result } from "./pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/game/:mode" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
