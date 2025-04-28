import React from 'react';
import { Box, Typography, Grow } from '@mui/material';
import { CheckCircle, Warning, Error, Info } from '@mui/icons-material';
import { themeColors, styles, floatingEffect } from './NightThemeProvider';

const AlertCard = ({ alert }) => {
  const getIcon = (severity) => {
    switch(severity) {
      case 'error': return <Error fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      case 'success': return <CheckCircle fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };
  
  const getColor = (severity) => {
    switch(severity) {
      case 'error': return themeColors.error;
      case 'warning': return themeColors.warning;
      case 'success': return themeColors.success;
      default: return themeColors.primary;
    }
  };
  
  return (
    <Grow in={true} timeout={500}>
      <Box 
        sx={{
          ...styles.alertCard,
          borderLeft: `3px solid ${getColor(alert.severity)}`,
          boxShadow: `0 5px 15px ${getColor(alert.severity)}20`
        }}
      >
        <Box display="flex" alignItems="flex-start">
          <Box sx={{ 
            width: 30, 
            height: 30, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: `${getColor(alert.severity)}20`,
            color: getColor(alert.severity),
            mr: 1.5,
            animation: `${floatingEffect} 3s infinite ease-in-out`,
            boxShadow: `0 0 10px ${getColor(alert.severity)}40`
          }}>
            {getIcon(alert.severity)}
          </Box>
          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ color: getColor(alert.severity), fontWeight: '600' }}>
                {alert.title}
              </Typography>
              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                {alert.timestamp}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
              {alert.message}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grow>
  );
};

export default AlertCard; 