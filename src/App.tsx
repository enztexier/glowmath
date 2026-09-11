import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MenuPresetsPage from './pages/MenuPresetsPage'
import ModePage from './pages/ModePage'
import ScolairePage from './pages/ScolairePage'
import ScolaireModePage from './pages/ScolaireModePage'
import ConfigPage from './pages/ConfigPage'
import SessionPage from './pages/SessionPage'
import ResultsPage from './pages/ResultsPage'
import SavoirPage from './pages/SavoirPage'
import SavoirMethodPage from './pages/SavoirMethodPage'
import TablesPage from './pages/TablesPage'
import TableDetailPage from './pages/TableDetailPage'
import TableItemDetailPage from './pages/TableItemDetailPage'
import TableSeriesSetupPage from './pages/TableSeriesSetupPage'
import TableSeriesPlayPage from './pages/TableSeriesPlayPage'
import ConnexionPage from './pages/ConnexionPage'
import NotFoundPage from './pages/NotFoundPage'
import AppLayout from './components/layout/AppLayout'
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/modes" element={<MenuPresetsPage />} />
            <Route path="/scolaire" element={<ScolairePage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/savoir" element={<SavoirPage />} />
            <Route path="/savoir/:operationKey/:slug" element={<SavoirMethodPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/tables/:slug" element={<TableDetailPage />} />
            <Route path="/tables/:slug/:itemId" element={<TableItemDetailPage />} />
            <Route path="/tables/:slug/:itemId/serie" element={<TableSeriesSetupPage />} />
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/session" element={<SessionPage />} />
          <Route path="/modes/:slug" element={<ModePage />} />
          <Route path="/scolaire/:slug" element={<ScolaireModePage />} />
          <Route path="/resultats" element={<ResultsPage />} />
          <Route path="/tables/:slug/:itemId/jouer" element={<TableSeriesPlayPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
