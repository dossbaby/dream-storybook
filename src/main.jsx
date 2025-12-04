import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ContentPage from './pages/ContentPage.jsx'
import ContentListPage from './pages/ContentListPage.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* SEO 개별 콘텐츠 페이지 */}
          <Route path="/dream/:id" element={<ContentPage type="dream" />} />
          <Route path="/tarot/:id" element={<ContentPage type="tarot" />} />
          <Route path="/fortune/:id" element={<ContentPage type="fortune" />} />

          {/* SEO 목록 페이지 */}
          <Route path="/dreams" element={<ContentListPage type="dream" />} />
          <Route path="/dreams/category/:categoryId" element={<ContentListPage type="dream" />} />
          <Route path="/tarots" element={<ContentListPage type="tarot" />} />
          <Route path="/tarots/category/:categoryId" element={<ContentListPage type="tarot" />} />
          <Route path="/fortunes" element={<ContentListPage type="fortune" />} />
          <Route path="/fortunes/category/:categoryId" element={<ContentListPage type="fortune" />} />

          {/* 메인 앱 */}
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
