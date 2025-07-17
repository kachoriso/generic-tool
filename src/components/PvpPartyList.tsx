import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Delete,
  Visibility,
  Close,
  Add,
  Edit
} from '@mui/icons-material';
import type { PvpParty, Pokemon } from '../types';

interface PvpPartyListProps {
  parties: PvpParty[];
  onDelete: (partyId: string) => void;
  onEdit: (party: PvpParty) => void;
  onNavigateToRegistration: () => void;
}

export const PvpPartyList: React.FC<PvpPartyListProps> = ({ 
  parties, 
  onDelete, 
  onEdit,
  onNavigateToRegistration 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedParty, setSelectedParty] = useState<PvpParty | null>(null);
  const [deleteConfirmParty, setDeleteConfirmParty] = useState<PvpParty | null>(null);

  const handleViewDetails = (party: PvpParty) => {
    setSelectedParty(party);
  };

  const handleEdit = (party: PvpParty) => {
    onEdit(party);
  };

  const handleDeleteConfirm = (party: PvpParty) => {
    setDeleteConfirmParty(party);
  };

  const handleDeleteExecute = () => {
    if (deleteConfirmParty) {
      onDelete(deleteConfirmParty.id);
      setDeleteConfirmParty(null);
    }
  };

  const getLeagueColor = (league: string) => {
    switch (league) {
      case 'スーパーリーグ': return 'success';
      case 'ハイパーリーグ': return 'warning';
      case 'マスターリーグ': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderPokemonInfo = (pokemon: Pokemon, index: number) => (
    <Box key={index} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
        ポケモン{index + 1}
      </Typography>
      <Box sx={{ ml: 2 }}>
        <Typography variant="body2" color="text.secondary">
          通常ワザ: {pokemon.normalMove || '未設定'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          SPワザ1: {pokemon.specialMove1 || '未設定'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          SPワザ2: {pokemon.specialMove2 || '未設定'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1000, mx: 'auto' }}>
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            📋 PvPパーティ一覧
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onNavigateToRegistration}
            size={isMobile ? "small" : "medium"}
          >
            新規登録
          </Button>
        </Box>

        {parties.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              登録されたパーティがありません
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              最初のPvPパーティを登録してみましょう！
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onNavigateToRegistration}
            >
              パーティを登録
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {parties.map((party) => (
              <Card 
                key={party.id} 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'grey.200',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  {/* 画像部分 */}
                  {(party.croppedImage || party.image) && (
                    <CardMedia
                      component="img"
                      sx={{
                        width: { xs: '100%', sm: 200 },
                        height: { xs: 150, sm: 150 },
                        objectFit: 'cover'
                      }}
                      image={party.croppedImage || party.image}
                      alt={party.title}
                    />
                  )}
                  
                  {/* コンテンツ部分 */}
                  <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {party.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={party.league} 
                            color={getLeagueColor(party.league) as any}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(party.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(party)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(party)}
                          sx={{ color: 'info.main' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteConfirm(party)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* ポケモンワザ一覧 */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[party.pokemon1, party.pokemon2, party.pokemon3].map((pokemon, index) => {
                        const displayMoves = [pokemon.normalMove, pokemon.specialMove1, pokemon.specialMove2]
                          .filter(move => move && move.trim())
                          .slice(0, 2); // 最大2つまで表示
                        
                        return displayMoves.length > 0 ? (
                          <Chip
                            key={index}
                            label={`${index + 1}: ${displayMoves.join(', ')}`}
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ) : null;
                      })}
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Paper>

      {/* 詳細表示ダイアログ */}
      <Dialog
        open={!!selectedParty}
        onClose={() => setSelectedParty(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedParty && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{selectedParty.title}</Typography>
                <Chip 
                  label={selectedParty.league} 
                  color={getLeagueColor(selectedParty.league) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <IconButton onClick={() => setSelectedParty(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              {(selectedParty.croppedImage || selectedParty.image) && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img
                    src={selectedParty.croppedImage || selectedParty.image}
                    alt={selectedParty.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      border: '1px solid #ddd'
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                パーティ構成
              </Typography>
              
              {renderPokemonInfo(selectedParty.pokemon1, 0)}
              <Divider sx={{ my: 2 }} />
              {renderPokemonInfo(selectedParty.pokemon2, 1)}
              <Divider sx={{ my: 2 }} />
              {renderPokemonInfo(selectedParty.pokemon3, 2)}
              
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  登録日時: {formatDate(selectedParty.createdAt)}
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setSelectedParty(null)}>
                閉じる
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={!!deleteConfirmParty}
        onClose={() => setDeleteConfirmParty(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>パーティの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{deleteConfirmParty?.title}」を削除しますか？
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmParty(null)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteExecute} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 