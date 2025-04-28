import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import { CompareArrows, CheckCircle, NotificationsActive, ErrorOutline } from '@mui/icons-material';
import { NightCard, themeColors, styles, floatingEffect, pulse } from './NightThemeProvider';

// 에러 로그 아이템 컴포넌트
export const ErrorLogItem = ({ log }) => (
  <Box 
    sx={{
      borderLeft: `3px solid ${log.level === 'ERROR' ? themeColors.error : themeColors.warning}`,
      backgroundColor: `${log.level === 'ERROR' ? themeColors.error : themeColors.warning}10`,
      padding: '8px 12px',
      borderRadius: '4px',
      marginBottom: '8px',
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    }}
  >
    <Box display="flex" justifyContent="space-between" mb={0.5}>
      <Typography variant="caption" sx={{ color: log.level === 'ERROR' ? themeColors.error : themeColors.warning, fontWeight: 'bold' }}>
        {log.level} [{log.source}]
      </Typography>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
        {log.timestamp}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ color: themeColors.text, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {log.message}
    </Typography>
  </Box>
);

// 에러 로그 컴포넌트
export const ErrorLogsPanel = ({ isEmergency, errorLogs, errorLogsRef }) => (
  <NightCard isEmergency={isEmergency}>
    <Box display="flex" alignItems="center" mb={2}>
      <ErrorOutline className={isEmergency ? 'emergency-icon' : ''} sx={{ 
        color: isEmergency ? themeColors.error : themeColors.warning,
        mr: 1,
        animation: isEmergency ? 
                  `${floatingEffect} 2s infinite ease-in-out` : 
                  `${floatingEffect} 3s infinite ease-in-out`,
        filter: isEmergency ? 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.6))' : 'none'
      }} />
      <Typography variant="h6" sx={{ 
        fontWeight: '600', 
        color: isEmergency ? themeColors.error : themeColors.text
      }}>
        Error Logs
      </Typography>
    </Box>
    <Divider sx={{ borderColor: isEmergency ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 143, 171, 0.1)', mb: 2 }} />
    <Box sx={{
      ...styles.alertsContainer,
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      height: '250px',
      overflowY: 'auto'
    }} ref={errorLogsRef}>
      {errorLogs.length > 0 ? (
        errorLogs.map((log) => (
          <ErrorLogItem key={log.id} log={log} />
        ))
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
          opacity: 0.6
        }}>
          <CheckCircle sx={{ 
            fontSize: 40, 
            color: themeColors.success, 
            mb: 1,
            animation: `${floatingEffect} 4s infinite ease-in-out`
          }} />
          <Typography variant="subtitle2" sx={{ color: themeColors.textSecondary }}>
            No error logs at this time
          </Typography>
        </Box>
      )}
    </Box>
  </NightCard>
);

// 토픽 데이터 스트림 컴포넌트
export const TopicDataStreamPanel = ({ isEmergency, topicData, lastTimestamp }) => (
  <NightCard isEmergency={isEmergency}>
    <Box display="flex" alignItems="center" mb={2}>
      <CompareArrows sx={{ 
        color: isEmergency ? themeColors.error : themeColors.warning,
        mr: 1,
        animation: `${floatingEffect} 3s infinite ease-in-out`,
      }} />
      <Typography variant="h6" sx={{ 
        fontWeight: '600', 
        color: isEmergency ? themeColors.error : themeColors.text
      }}>
        Topic Data Stream
      </Typography>
    </Box>
    <Divider sx={{ borderColor: isEmergency ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 143, 171, 0.1)', mb: 2 }} />
    <Box sx={{
      ...styles.alertsContainer,
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      maxHeight: '250px',
      overflowY: 'auto'
    }}>
      {topicData.length > 0 ? (
        topicData.map((data, index) => (
          <Box 
            key={index}
            sx={{
              backgroundColor: `${themeColors.cardBg}80`,
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              animation: Date.now() - lastTimestamp < 500 && index === 0
                ? `${pulse} 1s`
                : 'none',
              opacity: 1 - (index * 0.02)
            }}
          >
            <Typography variant="caption" sx={{ color: themeColors.warning, fontWeight: 'bold' }}>
              Topic: {data.topicName} (P{data.partition})
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
              {data.timestamp}
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.success }}>
              {data.messagesPerSecond} msg/s
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.primary }}>
              {data.latency.toFixed(2)} ms
            </Typography>
          </Box>
        ))
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
          opacity: 0.6
        }}>
          <Typography variant="subtitle2" sx={{ color: themeColors.textSecondary }}>
            No data streaming
          </Typography>
        </Box>
      )}
    </Box>
  </NightCard>
);

// 카프카 모니터링 컴포넌트
export const KafkaMonitoringPanel = ({ isEmergency, hasErrors, hasWarnings, brokerActive }) => (
  <NightCard isEmergency={isEmergency}>
    <Box display="flex" alignItems="center" mb={2}>
      <NotificationsActive className={hasErrors || !brokerActive ? 'emergency-icon' : ''} sx={{ 
        color: hasErrors || !brokerActive ? themeColors.error : 
               hasWarnings ? themeColors.warning : themeColors.primary,
        mr: 1,
        animation: hasErrors || !brokerActive ? 
                  `${floatingEffect} 2s infinite ease-in-out` : 
                  `${floatingEffect} 3s infinite ease-in-out`,
        filter: hasErrors || !brokerActive ? 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.6))' : 'none'
      }} />
      <Typography variant="h6" sx={{ 
        fontWeight: '600', 
        color: hasErrors || !brokerActive ? themeColors.error : themeColors.text
      }}>
        Kafka Monitoring
      </Typography>
    </Box>
    <Divider sx={{ borderColor: isEmergency ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 143, 171, 0.1)', mb: 2 }} />
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 2,
      height: '250px',
      overflowY: 'auto'
    }}>
      <Box sx={{
        backgroundColor: `${themeColors.cardBg}90`,
        borderRadius: '8px',
        padding: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: themeColors.warning, mb: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
          서비스 가용성
        </Typography>
        <Typography variant="h5" sx={{ color: themeColors.success, fontWeight: 'bold' }}>
          99.999%
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
          무중단 서비스 시간: 143일
        </Typography>
      </Box>
      
      <Box sx={{
        backgroundColor: `${themeColors.cardBg}90`,
        borderRadius: '8px',
        padding: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: themeColors.warning, mb: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
          처리량
        </Typography>
        <Typography variant="h5" sx={{ color: themeColors.warning, fontWeight: 'bold' }}>
          8.2K/s
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
          최대: 12.5K/s
        </Typography>
      </Box>
      
      <Box sx={{
        backgroundColor: `${themeColors.cardBg}90`,
        borderRadius: '8px',
        padding: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: themeColors.warning, mb: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
          레이턴시
        </Typography>
        <Typography variant="h5" sx={{ color: themeColors.primary, fontWeight: 'bold' }}>
          2.3ms
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
          P99: 5.1ms
        </Typography>
      </Box>
      
      <Box sx={{
        backgroundColor: `${themeColors.cardBg}90`,
        borderRadius: '8px',
        padding: 2
      }}>
        <Typography variant="subtitle2" sx={{ color: themeColors.warning, mb: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
          컨슈머 랙
        </Typography>
        <Typography variant="h5" sx={{ color: themeColors.success, fontWeight: 'bold' }}>
          0.05s
        </Typography>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
          복제 지연: 0ms
        </Typography>
      </Box>
    </Box>
  </NightCard>
);

// 비상 모드 표시 컴포넌트
export const EmergencyModeDisplay = ({ isEmergency }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    gap: 1,
    backgroundColor: isEmergency ? 'rgba(255, 82, 82, 0.2)' : 'transparent',
    padding: isEmergency ? '8px 16px' : 0,
    borderRadius: '8px',
    animation: isEmergency ? `${pulse} 2s infinite` : 'none'
  }}>
    {isEmergency && (
      <>
        <NotificationsActive sx={{ 
          color: themeColors.error,
          animation: `${floatingEffect} 2s infinite ease-in-out`,
          filter: 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.6))'
        }} />
        <Typography variant="h6" className="emergency-text" sx={{ 
          fontWeight: 'bold', 
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '1px',
          color: themeColors.error,
          fontSize: '1.75rem'
        }}>
          EMERGENCY MODE
        </Typography>
      </>
    )}
  </Box>
);

// 푸터 컴포넌트
export const DashboardFooter = () => (
  <Box 
    component="footer" 
    sx={{ 
      py: 2, 
      px: { xs: '16px', md: '24px' },
      backgroundColor: 'rgba(42, 42, 62, 0.8)',
      borderTop: '1px solid rgba(255, 143, 171, 0.1)',
      backdropFilter: 'blur(8px)',
      width: '100%',
      marginTop: 'auto',
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px'
    }}
  >
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
          © 2025 SK Shields Rookies. All rights reserved.
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2" sx={{ color: themeColors.textSecondary, display: 'flex', alignItems: 'center' }}>
          Powered by KFC™ Monitoring System
        </Typography>
      </Grid>
    </Grid>
  </Box>
); 