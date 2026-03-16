import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import ComparePage from './pages/ComparePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;