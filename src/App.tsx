/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Encode from './pages/Encode';
import Decode from './pages/Decode';
import Analysis from './pages/Analysis';
import Models from './pages/Models';
import Keys from './pages/Keys';
import Settings from './pages/Settings';
import { AppProvider } from '@/src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="encode" element={<Encode />} />
            <Route path="decode" element={<Decode />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="models" element={<Models />} />
            <Route path="keys" element={<Keys />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
