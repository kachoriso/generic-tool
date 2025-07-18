import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { PvpPartyRegistrationWithApi } from './components/PvpPartyRegistrationWithApi';
import PartyList from './components/PartyList';
import TodoList from './components/TodoList';
import HomePage from './components/HomePage';
import PartyDetail from './components/PartyDetail';
import { PriceCalculator } from './components/PriceCalculator';
import { Navigation } from './components/Navigation';

// テーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navigation currentPath={window.location.pathname} />
          
          <Box sx={{ pt: 8 }}> {/* ナビゲーションバーの高さ分のパディング */}
            <Routes>
              {/* ホームページ */}
              <Route path="/" element={<HomePage />} />
              
              {/* パーティ一覧ページ */}
              <Route 
                path="/parties" 
                element={
                  <PartyList 
                    onNavigateToForm={() => window.location.href = '/parties/new'}
                    onViewParty={(id) => window.location.href = `/parties/${id}`}
                    onEditParty={(id) => window.location.href = `/parties/${id}/edit`}
                  />
                } 
              />
              
              {/* 新規パーティ作成ページ */}
              <Route 
                path="/parties/new" 
                element={
                  <PvpPartyRegistrationWithApi 
                    onNavigateToList={() => window.location.href = '/parties'}
                  />
                } 
              />
              
              {/* パーティ編集ページ */}
              <Route 
                path="/parties/:id/edit" 
                element={<PartyEditPage />}
              />
              
              {/* パーティ詳細ページ */}
              <Route 
                path="/parties/:id" 
                element={<PartyDetail />}
              />
              
              {/* TODOリストページ */}
              <Route 
                path="/todos" 
                element={<TodoList />}
              />
              
              {/* 価格計算機ページ */}
              <Route 
                path="/calculator" 
                element={<PriceCalculator />}
              />
              
              {/* 404ページ */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

// パーティ編集ページコンポーネント
function PartyEditPage() {
  const partyId = window.location.pathname.split('/')[2]; // URLからIDを取得
  
  return (
    <PvpPartyRegistrationWithApi 
      partyId={partyId}
      onNavigateToList={() => window.location.href = '/parties'}
    />
  );
}

// パーティ詳細ページ（プレースホルダー）
function PartyDetailPage() {
  const partyId = window.location.pathname.split('/')[2];
  
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <h1>パーティ詳細</h1>
      <p>パーティID: {partyId}</p>
      <p>この機能は今後実装予定です。</p>
      <button onClick={() => window.location.href = '/parties'}>
        一覧に戻る
      </button>
    </Box>
  );
}

// 404ページ
function NotFoundPage() {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <h1>ページが見つかりません</h1>
      <p>お探しのページは存在しません。</p>
      <button onClick={() => window.location.href = '/parties'}>
        パーティ一覧に戻る
      </button>
    </Box>
  );
}

export default App;
