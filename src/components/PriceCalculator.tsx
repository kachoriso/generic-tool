import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Calculate } from '@mui/icons-material';
import type { PriceItem, VolumeUnit } from '../types';
import { generateId } from '../utils/storage';

const VOLUME_UNITS: { value: VolumeUnit; label: string }[] = [
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'グラム' },
  { value: 'piece', label: '個' },
  { value: 'L', label: 'リットル' },
  { value: 'kg', label: 'kg' }
];

const StyledTableRow = styled(TableRow)<{ $isBest?: boolean; $isWorst?: boolean }>(({ theme, $isBest, $isWorst }) => ({
  backgroundColor: $isBest ? '#e8f5e8' : $isWorst ? '#ffebee' : 'white',
  '&:hover': {
    backgroundColor: $isBest ? '#c8e6c9' : $isWorst ? '#ffcdd2' : '#f5f5f5',
  },
}));

const StyledTableCell = styled(TableCell)<{ $isBest?: boolean; $isWorst?: boolean }>(({ theme, $isBest, $isWorst }) => ({
  backgroundColor: $isBest ? '#c8e6c9' : $isWorst ? '#ffcdd2' : 'transparent',
  fontWeight: $isBest || $isWorst ? 'bold' : 'normal',
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
    fontSize: '0.875rem',
  },
}));

export const PriceCalculator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: generateId(), volume: 100, price: 50 },
    { id: generateId(), volume: 700, price: 313 }
  ]);
  const [calculationVolume, setCalculationVolume] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<VolumeUnit>('ml');

  const addPriceItem = () => {
    setPriceItems([...priceItems, { id: generateId(), volume: 0, price: 0 }]);
  };

  const removePriceItem = (id: string) => {
    if (priceItems.length > 1) {
      setPriceItems(priceItems.filter(item => item.id !== id));
    }
  };

  const updatePriceItem = (id: string, field: 'volume' | 'price', value: number) => {
    setPriceItems(priceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const clearAllInputs = () => {
    setPriceItems([
      { id: generateId(), volume: 0, price: 0 },
      { id: generateId(), volume: 0, price: 0 }
    ]);
    setCalculationVolume(1);
  };

  const calculatePriceForVolume = (item: PriceItem): number => {
    if (item.volume <= 0 || item.price <= 0 || calculationVolume <= 0) return 0;
    return (item.price / item.volume) * calculationVolume;
  };

  const getBestAndWorstDealIds = (): { bestId: string | null; worstId: string | null } => {
    const validItems = priceItems.filter(item => item.volume > 0 && item.price > 0);
    if (validItems.length === 0) return { bestId: null, worstId: null };

    const bestItem = validItems.reduce((best, current) => {
      const bestRatio = best.price / best.volume;
      const currentRatio = current.price / current.volume;
      return currentRatio < bestRatio ? current : best;
    });

    const worstItem = validItems.reduce((worst, current) => {
      const worstRatio = worst.price / worst.volume;
      const currentRatio = current.price / current.volume;
      return currentRatio > worstRatio ? current : worst;
    });

    return { 
      bestId: bestItem.id, 
      worstId: validItems.length > 1 ? worstItem.id : null 
    };
  };

  const { bestId, worstId } = getBestAndWorstDealIds();

  return (
    <Container maxWidth={isMobile ? "sm" : "lg"} sx={{ py: 2, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <Calculate sx={{ fontSize: { xs: 32, sm: 40 }, color: '#6366f1' }} />
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          sx={{ fontWeight: 600, color: '#1f2937', textAlign: 'center' }}
        >
          容量あたりの値段計算機
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: 4, border: '1px solid #e5e7eb' }}>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
            単位選択
          </FormLabel>
          <RadioGroup
            row
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as VolumeUnit)}
            sx={{ 
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 }
            }}
          >
            {VOLUME_UNITS.map((unit) => (
              <FormControlLabel
                key={unit.value}
                value={unit.value}
                control={<Radio size="small" />}
                label={unit.label}
                sx={{ 
                  mr: 0,
                  mb: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f9fafb', minWidth: { xs: 80, sm: 120 } }}>
                  容量({selectedUnit === 'piece' ? '個' : selectedUnit})
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f9fafb', minWidth: { xs: 80, sm: 120 } }}>
                  値段(円)
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f9fafb', textAlign: 'center', minWidth: { xs: 100, sm: 150 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                    <TextField
                      type="number"
                      value={calculationVolume || ''}
                      onChange={(e) => setCalculationVolume(Number(e.target.value))}
                      inputProps={{ min: 0, step: selectedUnit === 'piece' ? 1 : 0.1 }}
                      variant="outlined"
                      size="small"
                      sx={{ width: { xs: 60, sm: 80 } }}
                    />
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {selectedUnit === 'piece' ? '個' : selectedUnit}の値段
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f9fafb', width: { xs: 40, sm: 80 } }}>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceItems.map((item) => {
                const isBest = item.id === bestId && item.volume > 0 && item.price > 0;
                const isWorst = item.id === worstId && item.volume > 0 && item.price > 0;
                const calculatedPrice = calculatePriceForVolume(item);
                return (
                  <StyledTableRow key={item.id} $isBest={isBest} $isWorst={isWorst}>
                    <StyledTableCell $isBest={isBest} $isWorst={isWorst}>
                      <TextField
                        type="number"
                        value={item.volume || ''}
                        onChange={(e) => updatePriceItem(item.id, 'volume', Number(e.target.value))}
                        inputProps={{ min: 0, step: selectedUnit === 'piece' ? 1 : 0.1 }}
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: 70, sm: 120 } }}
                      />
                    </StyledTableCell>
                    <StyledTableCell $isBest={isBest} $isWorst={isWorst}>
                      <TextField
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => updatePriceItem(item.id, 'price', Number(e.target.value))}
                        inputProps={{ min: 0, step: 1 }}
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: 70, sm: 120 } }}
                      />
                    </StyledTableCell>
                    <StyledTableCell $isBest={isBest} $isWorst={isWorst} sx={{ textAlign: 'center' }}>
                      {calculatedPrice > 0 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: isBest || isWorst ? 'bold' : 'normal',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {calculatedPrice.toFixed(2)}円
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell $isBest={isBest} $isWorst={isWorst} sx={{ textAlign: 'center' }}>
                      <IconButton
                        onClick={() => removePriceItem(item.id)}
                        disabled={priceItems.length <= 1}
                        size="small"
                        sx={{ color: '#dc2626', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        ✖
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={addPriceItem}
            sx={{ 
              minWidth: { xs: 80, sm: 120 },
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#374151',
              '&:hover': {
                backgroundColor: '#e5e7eb',
                border: '1px solid #9ca3af'
              }
            }}
          >
            ＋
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={clearAllInputs}
            sx={{ 
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#374151',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: '#e5e7eb',
                border: '1px solid #9ca3af'
              }
            }}
          >
            入力内容をすべて削除する
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 