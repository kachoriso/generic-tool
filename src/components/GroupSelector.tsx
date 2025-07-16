import React, { useState } from 'react';
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
  Circle,
  Settings,
} from '@mui/icons-material';
import type { TodoGroup } from '../types';

interface GroupSelectorProps {
  groups: TodoGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const groupColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

const generateGroupName = (existingGroups: TodoGroup[]): string => {
  const animalNames = [
    'パンダ', 'ライオン', 'トラ', 'ゾウ', 'キリン',
    'ペンギン', 'コアラ', 'カンガルー', 'ウサギ', 'ネコ',
    'イヌ', 'ハムスター', 'フクロウ', 'イルカ', 'クジラ',
    'シマウマ', 'サル', 'クマ', 'オオカミ', 'キツネ',
    'リス', 'ハリネズミ', 'カメ', 'フラミンゴ', 'ペリカン'
  ];
  
  const flowerNames = [
    'サクラ', 'バラ', 'ヒマワリ', 'コスモス', 'チューリップ',
    'アジサイ', 'カーネーション', 'ユリ', 'ガーベラ', 'スイートピー'
  ];
  
  const colorNames = [
    'ブルー', 'グリーン', 'オレンジ', 'パープル', 'ピンク',
    'イエロー', 'レッド', 'ミント', 'ラベンダー', 'アクア'
  ];
  
  const allNames = [...animalNames, ...flowerNames, ...colorNames];
  
  // 既存のグループ名を取得
  const existingNames = existingGroups.map(group => group.name);
  
  // 使われていない名前を探す
  const availableNames = allNames.filter(name => !existingNames.includes(name));
  
  if (availableNames.length > 0) {
    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    return availableNames[randomIndex];
  }
  
  // すべて使われている場合は番号付きで生成
  let counter = 1;
  let newName = `グループ${counter}`;
  while (existingNames.includes(newName)) {
    counter++;
    newName = `グループ${counter}`;
  }
  
  return newName;
};

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(groupColors[0]);
  const [suggestedName, setSuggestedName] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const groupName = newGroupName.trim() || suggestedName;
    onCreateGroup(groupName, selectedColor);
    setNewGroupName('');
    setSelectedColor(groupColors[0]);
    setShowCreateForm(false);
    setSuggestedName(''); // Clear suggested name
  };

  const handleExpandChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const handleCreateFormToggle = () => {
    const newShowCreateForm = !showCreateForm;
    setShowCreateForm(newShowCreateForm);
    if (newShowCreateForm) {
      // Generate suggested name only when opening the form
      setSuggestedName(generateGroupName(groups));
    } else {
      // Reset form when closing
      setNewGroupName('');
      setSelectedColor(groupColors[0]);
      setSuggestedName('');
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2, 
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={handleExpandChange}
        elevation={0}
        sx={{
          '&:before': {
            display: 'none',
          },
          '& .MuiAccordionSummary-root': {
            minHeight: 48,
          },
          bgcolor: 'transparent',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'grey.600' }} />}
          sx={{
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Settings sx={{ fontSize: 18, color: 'grey.600' }} />
            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.95rem', color: 'grey.700' }}>
              グループ設定
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              ({groups.length}個)
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Create Group Button */}
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleCreateFormToggle}
              size="small"
              sx={{
                py: 0.8,
                fontWeight: 500,
                borderColor: 'grey.300',
                color: 'grey.700',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.100',
                },
              }}
            >
              新しいグループを作成
            </Button>

            {/* Create Group Form */}
            {showCreateForm && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Box component="form" onSubmit={handleCreateGroup} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={suggestedName}
                    label="グループ名（省略可）"
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        opacity: 0.6,
                        fontStyle: 'italic',
                      },
                    }}
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      カラーを選択:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {groupColors.map((color) => (
                        <IconButton
                          key={color}
                          size="small"
                          onClick={() => setSelectedColor(color)}
                          sx={{
                            width: 28,
                            height: 28,
                            border: selectedColor === color ? 2 : 1,
                            borderColor: selectedColor === color ? 'primary.main' : 'grey.300',
                            bgcolor: color,
                            '&:hover': {
                              bgcolor: color,
                              opacity: 0.8,
                            },
                          }}
                        >
                          {selectedColor === color && (
                            <Box sx={{ width: 6, height: 6, bgcolor: 'white', borderRadius: '50%' }} />
                          )}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      sx={{ 
                        flex: 1,
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      作成
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCreateFormToggle}
                      sx={{ flex: 1 }}
                    >
                      キャンセル
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Groups List */}
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List disablePadding>
                {groups.map((group) => (
                  <ListItem key={group.id} disablePadding>
                    <ListItemButton
                      selected={selectedGroupId === group.id}
                      onClick={() => onSelectGroup(group.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        minHeight: 40,
                        '&.Mui-selected': {
                          bgcolor: 'primary.50',
                          '&:hover': {
                            bgcolor: 'primary.100',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Circle sx={{ color: group.color, fontSize: 14 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={group.name}
                        primaryTypographyProps={{
                          fontWeight: selectedGroupId === group.id ? 600 : 500,
                          fontSize: '0.9rem',
                        }}
                      />
                      {group.id !== 'general' && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteGroup(group.id);
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'error.main',
                              bgcolor: 'error.50',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}; 