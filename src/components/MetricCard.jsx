import React from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { NightCard, themeColors, styles } from './NightThemeProvider';
import { PowerSettingsNew } from '@mui/icons-material';

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon: IconComponent, 
  color, 
  health, 
  isAlertActive,
  isEmergency,
  items = [],
  onItemToggle = null
}) => {
  const getHealthColor = (health) => {
    if (health >= 90) return themeColors.success;
    if (health >= 70) return themeColors.warning;
    return themeColors.error;
  };

  return (
    <NightCard isEmergency={isEmergency}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              ...styles.cardIcon, 
              bgcolor: `${color}20`, 
              color: color,
              mr: 2,
            }}>
              <IconComponent />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: '600', color: themeColors.text }}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ my: 1 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: '700', 
            color: isAlertActive ? themeColors.error : themeColors.text,
            animation: isAlertActive ? `${styles.pulse} 2s infinite` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {value}
          </Typography>
          <Typography variant="body2" 
            sx={{ 
              color: isAlertActive ? themeColors.error : themeColors.textSecondary,
              textAlign: 'center',
              mb: 1
            }}
          >
            {trend}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <LinearProgress 
            variant="determinate" 
            value={health} 
            sx={{ 
              height: 8, 
              borderRadius: '4px',
              mb: 1,
              backgroundColor: `${getHealthColor(health)}20`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getHealthColor(health),
                transition: 'transform 0.5s ease'
              }
            }}
          />
          
          {items.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              mt: 2,
              justifyContent: 'center' 
            }}>
              {items.map((item, index) => (
                <Button
                  key={item.id}
                  variant="contained"
                  size="small"
                  startIcon={<PowerSettingsNew />}
                  onClick={() => onItemToggle && onItemToggle(item.type, item.id, item.status === 'active')}
                  sx={{
                    backgroundColor: item.status === 'active' 
                      ? `${color}90`
                      : 'rgba(82, 82, 102, 0.6)',
                    color: themeColors.text,
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    minWidth: 0,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: item.status === 'active' 
                        ? color
                        : 'rgba(82, 82, 102, 0.8)',
                    },
                    animation: item.status !== 'active' && isEmergency
                      ? `${styles.pulse} 2s infinite`
                      : 'none',
                  }}
                  className={item.status !== 'active' && isEmergency ? 'emergency-filter' : ''}
                >
                  {item.status === 'active' ? `Stop ${item.shortName || `#${item.id}`}` : `Start ${item.shortName || `#${item.id}`}`}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </NightCard>
  );
};

export default MetricCard;
