import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { CheckCircle, List as ListIcon } from '@mui/icons-material';
import { PvpPartyRegistration } from './PvpPartyRegistration';
import { PartyApiClient, useApiState, handleApiError } from '../lib/api';
import { convertFormToDbInput, convertDbToForm, validatePartyInput, getSuccessMessage, getErrorMessage } from '../utils/partyDataAdapter';
import type { PvpParty } from '../types';

interface PvpPartyRegistrationWithApiProps {
  partyId?: string; // 編集モードの場合のパーティID
  onNavigateToList?: () => void;
}

export const PvpPartyRegistrationWithApi: React.FC<PvpPartyRegistrationWithApiProps> = ({
  partyId,
  onNavigateToList
}) => {
  // API状態管理
  const { loading: saveLoading, error: saveError, execute: executeSave } = useApiState<any>();
  const { loading: loadLoading, error: loadError, execute: executeLoad } = useApiState<any>();
  
  // UI状態
  const [formParty, setFormParty] = useState<PvpParty | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 編集モードの場合、パーティデータを読み込み
  React.useEffect(() => {
    if (partyId) {
      const loadParty = async () => {
        try {
          const dbParty = await PartyApiClient.getParty(partyId);
          const convertedParty = convertDbToForm(dbParty);
          setFormParty(convertedParty);
        } catch (error) {
          console.error('パーティの読み込みに失敗しました:', error);
        }
      };
      loadParty();
    }
  }, [partyId]);

  // フォームの保存処理
  const handleSave = async (party: Omit<PvpParty, 'id' | 'createdAt'>) => {
    console.log('🎮 パーティ保存開始:', party);
    
    // バリデーション
    const errors = validatePartyInput(party);
    if (errors.length > 0) {
      console.log('❌ バリデーションエラー:', errors);
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    console.log('✅ バリデーション通過');

    // データベース形式に変換
    const dbInput = convertFormToDbInput(party);
    console.log('🔄 変換後のデータ:', dbInput);

    // API呼び出し
    try {
      console.log('📡 API呼び出し開始...');
      const result = await executeSave(async () => {
        console.log('🚀 executeSave内部開始');
        if (partyId) {
          console.log('📝 更新モード:', partyId);
          // 更新
          return await PartyApiClient.updateParty(partyId, dbInput);
        } else {
          console.log('✨ 新規作成モード');
          // 新規作成
          return await PartyApiClient.createParty(dbInput);
        }
      });

      if (result) {
        // 成功ダイアログを表示
        setShowSuccess(true);
        console.log('🎉 パーティ保存成功:', result);
      }
    } catch (error) {
      console.error('💥 パーティ保存エラー:', error);
      // エラーは useApiState で自動的に設定される
    }
  };

  // 成功ダイアログを閉じる
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  // 一覧ページに遷移
  const handleNavigateToList = () => {
    setShowSuccess(false);
    if (onNavigateToList) {
      onNavigateToList();
    }
  };

  // ローディング表示
  if (loadLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          パーティを読み込み中...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      {/* ページヘッダー */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {partyId ? '📝 パーティ編集' : '🎮 新しいパーティを作成'}
        </Typography>
        <Typography variant="body1">
          {partyId 
            ? 'パーティの情報を編集できます。変更後は保存ボタンを押してください。'
            : 'ポケモンGO PvP用のパーティを登録しましょう！'
          }
        </Typography>
      </Paper>

      {/* エラー表示 */}
      {(loadError || saveError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            エラーが発生しました
          </Typography>
          <Typography variant="body2">
            {loadError || saveError}
          </Typography>
        </Alert>
      )}

      {/* バリデーションエラー */}
      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            入力内容に問題があります
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <Typography variant="body2">{error}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* ローディング表示 */}
      {saveLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2">
              パーティを保存中...
            </Typography>
          </Box>
        </Alert>
      )}

      {/* メインフォーム */}
      <PvpPartyRegistration
        party={formParty}
        onSave={handleSave}
        onNavigateToList={onNavigateToList}
      />

      {/* 成功ダイアログ */}
      <Dialog
        open={showSuccess}
        onClose={handleCloseSuccess}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle 
            sx={{ 
              fontSize: 64, 
              color: 'success.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h5" gutterBottom>
            {getSuccessMessage(!!partyId)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            データベースに正常に保存されました。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleCloseSuccess}
            variant="outlined"
            size="large"
          >
            続けて編集
          </Button>
          {onNavigateToList && (
            <Button
              onClick={handleNavigateToList}
              variant="contained"
              size="large"
              startIcon={<ListIcon />}
            >
              一覧を見る
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 