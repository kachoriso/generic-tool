import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  SportsEsports,
} from '@mui/icons-material';
import { PartyApiClient } from '../lib/api';
import type { PvpPartyDetail } from '../types/database';

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [party, setParty] = useState<PvpPartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('パーティIDが指定されていません');
      setLoading(false);
      return;
    }

    loadPartyDetail();
  }, [id]);

  const loadPartyDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const partyData = await PartyApiClient.getParty(id);
      setParty(partyData);
    } catch (err) {
      console.error('Error loading party detail:', err);
      setError('パーティの詳細を取得できませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (party) {
      navigate(`/parties/${party.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!party || !window.confirm('このパーティを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await PartyApiClient.deleteParty(party.id);
      navigate('/parties');
    } catch (err) {
      console.error('Error deleting party:', err);
      setError('パーティの削除に失敗しました');
    }
  };

  const handleBack = () => {
    navigate('/parties');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          パーティ詳細を読み込み中...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          一覧に戻る
        </Button>
      </Container>
    );
  }

  if (!party) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          パーティが見つかりませんでした
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          一覧に戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* ページタイトル */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <SportsEsports sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography 
          variant="h5"
          component="h1" 
          sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
        >
          パーティ詳細
        </Typography>
      </Box>

      {/* 戻るボタンと操作ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleEdit} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* パーティ情報カード */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
              {party.title}
            </Typography>
            <Chip
              label={party.custom_league || party.league}
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* 画像表示（切り抜き画像のみ） */}
          {party.cropped_image_url && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                パーティ画像
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CardMedia
                  component="img"
                  image={party.cropped_image_url}
                  alt="パーティ画像"
                  sx={{
                    width: 200,
                    height: 'auto',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
        </CardContent>
      </Card>

      {/* ポケモン情報 */}
      <Typography variant="h6" gutterBottom>
        ポケモン構成
      </Typography>
      {party.pokemon && party.pokemon.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {party.pokemon.map((pokemon, index) => (
            <Paper key={pokemon.id} elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {index + 1}番目のポケモン
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ノーマルアタック
                  </Typography>
                  <Typography variant="body1">
                    {pokemon.normal_move || '未設定'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    スペシャルアタック1
                  </Typography>
                  <Typography variant="body1">
                    {pokemon.special_move_1 || '未設定'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    スペシャルアタック2
                  </Typography>
                  <Typography variant="body1">
                    {pokemon.special_move_2 || '未設定'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            ポケモン情報が登録されていません
          </Typography>
        </Paper>
      )}

      {/* 作成・更新日時（最下部） */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                作成日時
              </Typography>
              <Typography variant="body1">
                {new Date(party.created_at).toLocaleString('ja-JP')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                更新日時
              </Typography>
              <Typography variant="body1">
                {new Date(party.updated_at).toLocaleString('ja-JP')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          一覧に戻る
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          編集する
        </Button>
      </Box>
    </Container>
  );
} 