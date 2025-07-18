import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { PartyApiClient, useApiState } from '../lib/api';
import type { PvpParty, League } from '../types/database';

interface PartyListProps {
  onNavigateToForm?: () => void;
  onViewParty?: (id: string) => void;
  onEditParty?: (id: string) => void;
}

const LEAGUES: League[] = [
  'スーパーリーグ',
  'ハイパーリーグ',
  'マスターリーグ',
  'マスタークラシック',
  'ジョウトカップ',
  'シンオウカップ',
  'ホウエンカップ',
  'カントーカップ',
  'その他'
];

export default function PartyList({ 
  onNavigateToForm, 
  onViewParty, 
  onEditParty 
}: PartyListProps) {
  const [parties, setParties] = useState<PvpParty[]>([]);
  const [filteredParties, setFilteredParties] = useState<PvpParty[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<League | ''>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; party: PvpParty | null }>({
    open: false,
    party: null
  });

  const { loading, error, execute } = useApiState<{ parties: PvpParty[]; total: number }>();
  const { loading: deleteLoading, execute: executeDelete } = useApiState<void>();

  // パーティ一覧を取得
  const loadParties = async () => {
    try {
      const result = await execute(() => PartyApiClient.getParties());
      setParties(result.parties);
      setFilteredParties(result.parties);
    } catch (err) {
      console.error('パーティ一覧の取得に失敗しました:', err);
    }
  };

  // 初回ロード
  useEffect(() => {
    loadParties();
  }, []);

  // フィルター処理
  useEffect(() => {
    let filtered = parties;

    if (searchTitle) {
      filtered = filtered.filter(party =>
        party.title?.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (selectedLeague) {
      filtered = filtered.filter(party => party.league === selectedLeague);
    }

    setFilteredParties(filtered);
  }, [parties, searchTitle, selectedLeague]);

  // パーティ削除
  const handleDeleteParty = async (party: PvpParty) => {
    try {
      await executeDelete(() => PartyApiClient.deleteParty(party.id));
      setDeleteDialog({ open: false, party: null });
      await loadParties(); // 一覧を再取得
    } catch (err) {
      console.error('パーティの削除に失敗しました:', err);
    }
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (party: PvpParty) => {
    setDeleteDialog({ open: true, party });
  };

  // 削除確認ダイアログを閉じる
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, party: null });
  };

  // フィルターリセット
  const resetFilters = () => {
    setSearchTitle('');
    setSelectedLeague('');
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // リーグのカラー
  const getLeagueColor = (league: League): "primary" | "secondary" | "success" | "warning" | "error" => {
    switch (league) {
      case 'スーパーリーグ': return 'primary';
      case 'ハイパーリーグ': return 'secondary';
      case 'マスターリーグ': return 'warning';
      case 'マスタークラシック': return 'error';
      default: return 'success';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      {/* ページタイトル */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <ListIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography 
          variant="h5"
          component="h1" 
          sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
        >
          PvPパーティ一覧
        </Typography>
      </Box>

      {/* 新規作成ボタン */}
      {onNavigateToForm && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNavigateToForm}
            size="large"
          >
            新しいパーティを作成
          </Button>
        </Box>
      )}

      {/* フィルター */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔍 検索・フィルター
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="パーティ名で検索"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flex: 1 }}
            />
            
            <FormControl sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>リーグ</InputLabel>
              <Select
                value={selectedLeague}
                label="リーグ"
                onChange={(e) => setSelectedLeague(e.target.value as League | '')}
              >
                <MenuItem value="">全てのリーグ</MenuItem>
                {LEAGUES.map((league) => (
                  <MenuItem key={league} value={league}>
                    {league}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              onClick={resetFilters}
              disabled={!searchTitle && !selectedLeague}
              sx={{ minWidth: 140 }}
            >
              フィルターをリセット
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ローディング */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* パーティ一覧 */}
      {!loading && (
        <>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {filteredParties.length}件のパーティが見つかりました
          </Typography>

          {filteredParties.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  パーティが見つかりませんでした
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  新しいパーティを作成してみましょう！
                </Typography>
                {onNavigateToForm && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onNavigateToForm}
                    sx={{ mt: 2 }}
                  >
                    パーティを作成
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filteredParties.map((party) => (
                <Box key={party.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* パーティタイトル */}
                      <Typography variant="h6" component="h2" gutterBottom>
                        {party.title || '無題のパーティ'}
                      </Typography>

                      {/* リーグ */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={party.league}
                          color={getLeagueColor(party.league)}
                          size="small"
                        />
                        {party.custom_league && (
                          <Chip
                            label={party.custom_league}
                            variant="outlined"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      {/* 作成日時 */}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        作成: {formatDate(party.created_at.toString())}
                      </Typography>

                      {/* 更新日時 */}
                      {party.updated_at !== party.created_at && (
                        <Typography variant="body2" color="text.secondary">
                          更新: {formatDate(party.updated_at.toString())}
                        </Typography>
                      )}

                      {/* 画像プレビュー */}
                      {party.cropped_image_url && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <img
                            src={party.cropped_image_url}
                            alt="パーティ画像"
                            style={{
                              maxWidth: '100%',
                              maxHeight: 120,
                              borderRadius: 8,
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>

                    {/* アクションボタン */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        {onViewParty && (
                          <IconButton
                            color="primary"
                            onClick={() => onViewParty(party.id)}
                            title="詳細を見る"
                          >
                            <ViewIcon />
                          </IconButton>
                        )}
                        
                        {onEditParty && (
                          <IconButton
                            color="secondary"
                            onClick={() => onEditParty(party.id)}
                            title="編集"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(party)}
                          title="削除"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>パーティの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{deleteDialog.party?.title || '無題のパーティ'}」を削除してもよろしいですか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>
            キャンセル
          </Button>
          <Button
            onClick={() => deleteDialog.party && handleDeleteParty(deleteDialog.party)}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : undefined}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 