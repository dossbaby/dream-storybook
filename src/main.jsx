import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ContentPage from './pages/ContentPage.jsx'
import TarotResultPage from './pages/TarotResultPage.jsx'
import ContentListPage from './pages/ContentListPage.jsx'
import TagPage from './pages/TagPage.jsx'
import TagsPage from './pages/TagsPage.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
// Blog/Guide pages (Headless WordPress)
import BlogListPage from './pages/blog/BlogListPage.jsx'
import BlogPostPage from './pages/blog/BlogPostPage.jsx'
import GuidePage from './pages/blog/GuidePage.jsx'
import './styles/index.css'

// /fortune/:id → /saju/:id 리다이렉트 컴포넌트
const FortuneRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/saju/${id}`} replace />;
};

// /fortunes → /sajus 리다이렉트 컴포넌트
const FortunesRedirect = () => {
  return <Navigate to="/sajus" replace />;
};

// /fortunes/category/:id → /sajus/category/:id 리다이렉트
const FortunesCategoryRedirect = () => {
  const { categoryId } = useParams();
  return <Navigate to={`/sajus/category/${categoryId}`} replace />;
};

// Service Worker 등록
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            {/* SEO 개별 콘텐츠 페이지 */}
            <Route path="/dream/:id" element={<ContentPage type="dream" />} />
            <Route path="/tarot/:id" element={<TarotResultPage />} />
            <Route path="/saju/:id" element={<ContentPage type="saju" />} />

            {/* 태그 페이지 */}
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tag/:tagSlug" element={<TagPage />} />

            {/* SEO 목록 페이지 */}
            <Route path="/dreams" element={<ContentListPage type="dream" />} />
            <Route path="/dreams/category/:categoryId" element={<ContentListPage type="dream" />} />
            <Route path="/tarots" element={<ContentListPage type="tarot" />} />
            <Route path="/tarots/category/:categoryId" element={<ContentListPage type="tarot" />} />
            <Route path="/sajus" element={<ContentListPage type="saju" />} />
            <Route path="/sajus/category/:categoryId" element={<ContentListPage type="saju" />} />

            {/* /fortune → /saju 리다이렉트 (301 영구 리다이렉트) */}
            <Route path="/fortune/:id" element={<FortuneRedirect />} />
            <Route path="/fortunes" element={<FortunesRedirect />} />
            <Route path="/fortunes/category/:categoryId" element={<FortunesCategoryRedirect />} />

            {/* 블로그/가이드 페이지 (Headless WordPress) */}
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/:slug" element={<GuidePage />} />

            {/* 메인 앱 */}
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
