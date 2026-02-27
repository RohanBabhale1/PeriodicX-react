import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider }   from './context/ThemeContext';
import { ElementProvider } from './context/ElementContext';
import Header      from './components/layout/Header';
import Footer      from './components/layout/Footer';
import ChatWidget  from './components/chat/ChatWidget'; 

const HomePage     = lazy(() => import('./pages/HomePage'));
const ComparePage  = lazy(() => import('./pages/ComparePage'));
const QuizPage     = lazy(() => import('./pages/QuizPage'));   
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ width:36, height:36, border:'3px solid var(--border-medium)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ElementProvider>
          <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
            <Header />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"        element={<HomePage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/quiz"    element={<QuizPage />} />    {/* ← NEW */}
                <Route path="*"        element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Footer />
            <ChatWidget />   {/* ← NEW — floats on every page */}
          </div>
        </ElementProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}