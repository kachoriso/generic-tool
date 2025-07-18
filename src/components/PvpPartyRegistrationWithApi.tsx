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
import { CheckCircle, List as ListIcon, SportsEsports } from '@mui/icons-material';
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
          console.log('📖 編集モード: パーティデータ読み込み開始', partyId);
          const dbParty = await executeLoad(async () => {
            return await PartyApiClient.getParty(partyId);
          });
          
          console.log('📖 データベースから取得したパーティ:', dbParty);
          const convertedParty = convertDbToForm(dbParty);
          console.log('📖 フォーム形式に変換したパーティ:', {
            id: convertedParty.id,
            title: convertedParty.title,
            league: convertedParty.league,
            pokemon1: convertedParty.pokemon1,
            pokemon2: convertedParty.pokemon2,
            pokemon3: convertedParty.pokemon3,
            hasImage: !!convertedParty.image,
            hasCroppedImage: !!convertedParty.croppedImage
          });
          
          setFormParty(convertedParty);
          console.log('✅ 編集フォームにデータ設定完了');
        } catch (error) {
          console.error('❌ パーティの読み込みに失敗しました:', error);
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

    // フロントエンドからの生データをそのままサーバーに送信
    // サーバー側でconvertFormToDbInputが実行される
    console.log('📤 サーバーに送信するデータ:', {
      title: party.title,
      league: party.league,
      hasPokemon1: !!party.pokemon1,
      hasPokemon2: !!party.pokemon2,
      hasPokemon3: !!party.pokemon3,
      pokemon1Details: party.pokemon1,
      pokemon2Details: party.pokemon2,
      pokemon3Details: party.pokemon3,
      hasImage: !!party.image,
      hasCroppedImage: !!party.croppedImage
    });

    // API呼び出し
    try {
      console.log('📡 API呼び出し開始...');
      const result = await executeSave(async () => {
        console.log('🚀 executeSave内部開始');
        if (partyId) {
          console.log('📝 更新モード:', partyId);
          // 更新時：フロントエンドデータをそのまま送信
          return await PartyApiClient.updateParty(partyId, party as any);
        } else {
          console.log('✨ 新規作成モード');
          // 新規作成時：フロントエンドデータをそのまま送信
          return await PartyApiClient.createParty(party as any);
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
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: { xs: 1, sm: 3 } }}>
      {/* ページタイトル */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <SportsEsports sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography 
          variant="h5"
          component="h1" 
          sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
        >
          PvPパーティ登録
        </Typography>
      </Box>

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
      {(partyId && loadLoading) ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            パーティデータを読み込み中...
          </Typography>
        </Paper>
      ) : (partyId && !formParty) ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            パーティデータの読み込みに失敗しました
          </Typography>
        </Paper>
      ) : (
        <PvpPartyRegistration
          party={formParty}
          onSave={handleSave}
          onNavigateToList={onNavigateToList}
        />
      )}

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