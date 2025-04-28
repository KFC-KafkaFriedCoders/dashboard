import React from 'react';
import { Box, Paper } from '@mui/material';
import { keyframes, styled } from '@mui/system';

// Night 테마 색상
export const themeColors = {
  primary: '#FF8FAB',
  secondary: '#614E6E',
  success: '#81C784',
  warning: '#FFB74D',
  error: '#FF5252',
  bg: '#1A1A2E',
  cardBg: '#2A2A3E',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  glowPrimary: '0 0 20px rgba(255, 143, 171, 0.3)',
  glowError: '0 0 20px rgba(255, 82, 82, 0.3)'
};

// 애니메이션 정의 - 비상 상황용 애니메이션 강화
export const emergencyPulse = keyframes`
  0% {
    background-color: ${themeColors.error};
  }
  50% {
    background-color: ${themeColors.error}DD;
  }
  100% {
    background-color: ${themeColors.error};
  }
`;

export const alarmBlink = keyframes`
  0%, 19%, 21%, 23%, 40%, 42%, 44%, 65%, 67%, 69% { 
    background: rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.6);
  }
  20%, 22%, 41%, 43%, 66%, 68% { 
    background: rgba(255, 0, 0, 0);
    box-shadow: 0 0 30px rgba(255, 0, 0, 0);
  }
  70%, 100% { 
    background: rgba(255, 0, 0, 0);
    box-shadow: 0 0 30px rgba(255, 0, 0, 0);
  }
`;

export const redTextFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 88%, 90%, 92% { 
    color: #FF5252; 
    text-shadow: 0 0 8px rgba(255, 82, 82, 0.8);
  }
  20%, 24%, 55%, 89%, 91% { 
    color: #FFCDD2; 
    text-shadow: 0 0 15px rgba(255, 82, 82, 0.4);
  }
`;

export const moonlightGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(255, 143, 171, 0.2); }
  50% { box-shadow: 0 0 30px rgba(255, 143, 171, 0.3); }
  100% { box-shadow: 0 0 20px rgba(255, 143, 171, 0.2); }
`;

export const redAlertGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(255, 82, 82, 0.3); }
  25% { box-shadow: 0 0 25px rgba(255, 82, 82, 0.6); }
  50% { box-shadow: 0 0 20px rgba(255, 82, 82, 0.4); }
  75% { box-shadow: 0 0 25px rgba(255, 82, 82, 0.6); }
  100% { box-shadow: 0 0 15px rgba(255, 82, 82, 0.3); }
`;

export const floatingEffect = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

export const rotatingEffect = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

// 스타일드 컴포넌트
export const NightContainer = styled(Box)(({ isEmergency, showEmergencyBanner }) => ({
  minHeight: '100vh',
  width: '100vw',
  maxWidth: '100%',
  margin: 0,
  padding: 0,
  color: themeColors.text,
  position: 'relative',
  overflow: 'hidden',
  animation: 'none',
  background: isEmergency 
              ? `linear-gradient(135deg, rgba(45, 25, 30, 1) 0%, rgba(42, 42, 78, 1) 100%)`
              : `linear-gradient(135deg, ${themeColors.bg} 0%, #2A2A4E 100%)`,
  transition: 'all 0.5s ease',
  willChange: 'background, box-shadow',
  border: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  '&::before': isEmergency ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255, 82, 82, 0.15) 0%, rgba(255, 82, 82, 0) 70%)',
    pointerEvents: 'none',
    zIndex: 0
  } : {},
  '&::after': showEmergencyBanner ? {
    content: '"EMERGENCY ALERT"',
    position: 'fixed',
    top: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: themeColors.error,
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 'bold',
    fontSize: '26px',
    letterSpacing: '4px',
    padding: '8px 24px',
    borderRadius: '4px',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    border: `1px solid ${themeColors.error}`,
    zIndex: 1000,
    animation: `${redTextFlicker} 3s infinite`
  } : {},
  '& *': {
    boxSizing: 'border-box'
  }
}));

export const NightCard = styled(Paper)(({ isGlowing, isEmergency }) => ({
  background: themeColors.cardBg,
  borderRadius: '15px',
  padding: '20px',
  color: themeColors.text,
  transition: 'all 0.3s ease',
  border: 'none',
  outline: 'none',
  animation: isEmergency ? `${redAlertGlow} 2s infinite ease-in-out` : (isGlowing ? `${moonlightGlow} 3s infinite ease-in-out` : 'none'),
  '&:hover': {
    boxShadow: isEmergency ? themeColors.glowError : themeColors.glowPrimary,
    transform: 'translateY(-2px)'
  },
  willChange: 'transform, box-shadow',
  position: 'relative',
  zIndex: 1,
  '& *': {
    border: 'none',
    outline: 'none'
  }
}));

// 스타일 정의
export const styles = {
  header: {
    background: `linear-gradient(135deg, ${themeColors.cardBg} 0%, #353555 100%)`,
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '24px',
  },
  pulse: pulse,
  alertCard: {
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '8px',
    background: `${themeColors.cardBg}90`,
    backdropFilter: 'blur(8px)',
    border: 'none',
    outline: 'none'
  },
  cardIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `${floatingEffect} 4s infinite ease-in-out`,
  },
  actionButton: {
    background: `linear-gradient(45deg, ${themeColors.error} 30%, ${themeColors.primary} 90%)`,
    color: themeColors.text,
    boxShadow: '0 0 15px rgba(255, 82, 82, 0.3)',
    border: 'none',
    outline: 'none',
    '&:hover': {
      background: `linear-gradient(45deg, ${themeColors.error} 30%, ${themeColors.error} 90%)`,
      boxShadow: '0 0 20px rgba(255, 82, 82, 0.4)',
    }
  },
  actionButtonStart: {
    background: `linear-gradient(45deg, ${themeColors.success} 30%, ${themeColors.primary} 90%)`,
    color: themeColors.text,
    boxShadow: '0 0 15px rgba(129, 199, 132, 0.3)',
    border: 'none',
    outline: 'none',
    '&:hover': {
      background: `linear-gradient(45deg, ${themeColors.success} 30%, ${themeColors.success} 90%)`,
      boxShadow: '0 0 20px rgba(129, 199, 132, 0.4)',
    }
  },
  alertsContainer: {
    height: '280px',
    overflowY: 'auto',
    pr: 1,
    '&::-webkit-scrollbar': {
      width: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 143, 171, 0.2)',
      borderRadius: '3px'
    }
  },
};

const EmergencyIndicator = styled(Box)(({ theme }) => ({
  color: '#FFFFFF',
  textAlign: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.error.main,
  fontWeight: 'bold',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  '& .alertText': {
    fontSize: '1.75rem',
    letterSpacing: '1px',
    textShadow: '0 0 10px rgba(255,0,0,0.7)'
  },
  '& .alertDetails': {
    fontSize: '0.9rem',
    marginTop: theme.spacing(0.5)
  }
}));

const NightThemeProvider = ({ children, isEmergency = false, showEmergencyBanner = false }) => {
  // 전역 스타일 적용
  React.useEffect(() => {
    // 문서 전체에 스타일 적용
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.boxSizing = 'border-box';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.boxSizing = 'border-box';
    
    const htmlStyle = document.createElement('style');
    htmlStyle.innerHTML = `
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        max-width: 100vw;
        border: none !important;
        outline: none !important;
      }

      @keyframes sirenspin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .emergency-icon {
        animation: sirenspin 1.5s linear infinite;
      }
    `;
    document.head.appendChild(htmlStyle);
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.boxSizing = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.boxSizing = '';
      document.head.removeChild(htmlStyle);
    };
  }, []);

  return (
    <NightContainer isEmergency={isEmergency} showEmergencyBanner={showEmergencyBanner}>
      {children}
    </NightContainer>
  );
};

export default NightThemeProvider; 