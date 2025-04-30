import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Alert, Snackbar, Box, } from '@mui/material';
import { Storage, Memory, CompareArrows, DataObject, } from '@mui/icons-material';
import { NightContainer, themeColors } from './NightThemeProvider';
import MetricCard from './MetricCard';
import axios from 'axios';

import { 
  ErrorLogsPanel, 
  TopicDataStreamPanel, 
  KafkaMonitoringPanel, 
  EmergencyModeDisplay,
} from './MetricComponents';
import { 
  getClusterState, 
  getClusterAlerts,
  toggleBroker, 
  toggleController, 
  toggleConnector, 
  toggleSchemaRegistry
} from '../services/kafkaService';

// 초기 상태
const INITIAL_STATE = {
  brokers: Array(3).fill().map((_, i) => ({ id: i + 1, status: 'inactive', health: 0 })),
  controllers: Array(3).fill().map((_, i) => ({ id: i + 1, status: 'inactive', health: 0 })),
  connectors: Array(2).fill().map((_, i) => ({ id: i + 1, status: 'inactive', health: 0 })),
  schemaRegistries: Array(2).fill().map((_, i) => ({ id: i + 1, status: 'inactive', health: 0 }))
};

function NightSystemMonitor() {
  const [clusterState, setClusterState] = useState(INITIAL_STATE);
  const [alerts, setAlerts] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isEmergency, setIsEmergency] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 시스템 상태를 확인하는 함수
  const checkSystemStatus = (
    brokers = clusterState.brokers,
    controllers = clusterState.controllers,
    connectors = clusterState.connectors,
    schemaRegistries = clusterState.schemaRegistries
  ) => {
    const anyBrokerDown = brokers.some(b => b.status !== 'active');
    const anyControllerDown = controllers.some(c => c.status !== 'active');
    const anyConnectorDown = connectors.some(c => c.status !== 'active');
    const anySRDown = schemaRegistries.some(s => s.status !== 'active');
    
    setIsEmergency(anyBrokerDown || anyControllerDown || anyConnectorDown || anySRDown);
  };

  // 클러스터 데이터 로드
  const loadClusterData = async () => {
    try {
      const [state, alertsData] = await Promise.all([
        getClusterState(),
        getClusterAlerts()
      ]);
      
      setClusterState(state);
      setAlerts(alertsData);
      
      const hasError = alertsData.some(alert => alert.type === 'error');
      const hasWarning = alertsData.some(alert => alert.type === 'warning');
      
      setHasErrors(hasError);
      setHasWarnings(hasWarning);
      
      checkSystemStatus(state.brokers, state.controllers, state.connectors, state.schemaRegistries);
    } catch (error) {
      console.error('클러스터 데이터 로드 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '클러스터 데이터를 불러오는 중 오류가 발생했습니다.',
        severity: 'error'
      });
      setClusterState(INITIAL_STATE);
    }
  };

  useEffect(() => {
    const getII = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/v1/query?query=kafka_server_brokertopicmetrics_messagesinpersec")
        const metricsData = response.data.data.result
        console.log(metricsData.length);
      } catch (error) {
        console.log(error)
      }
    }
    getII();
  })

  // 주기적인 데이터 갱신
  useEffect(() => {
    
    loadClusterData();
    const interval = setInterval(loadClusterData, 30000); // 30초마다 갱신
    
    return () => clearInterval(interval);
  }, []);

  // 상태 변경 시 시스템 상태 확인
  useEffect(() => {
    checkSystemStatus();
  }, [clusterState]);

  // 알림 상태 업데이트
  useEffect(() => {
    setHasErrors(alerts.some(alert => alert.type === 'error'));
    setHasWarnings(alerts.some(alert => alert.type === 'warning'));
  }, [alerts]);
  
  // 상태 토글 함수들
  const toggleStatus = async (type, id, isActive) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      let newStatus;
      
      // 상태 변경 처리
      switch (type) {
        case 'broker':
          newStatus = await toggleBroker(id, !isActive);
          break;
        case 'controller':
          newStatus = await toggleController(id, !isActive);
          break;
        case 'connector':
          newStatus = await toggleConnector(id, !isActive);
          break;
        case 'schemaRegistry':
          newStatus = await toggleSchemaRegistry(id, !isActive);
          break;
        default:
          console.error(`알 수 없는 컴포넌트 타입: ${type}`);
          throw new Error('알 수 없는 컴포넌트 타입');
      }
      
      // 메시지 설정: `newStatus`가 `true`이면 활성화되었고, `false`이면 비활성화됨
      setSnackbar({
        open: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
        severity: 'success'
      });
      
      // 상태 업데이트 후 전체 데이터 갱신
      await loadClusterData();
    } catch (error) {
      console.error(`${type} 상태 변경 중 오류 발생:`, error);
      setSnackbar({
        open: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} 상태 변경 중 오류가 발생했습니다.`,
        severity: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 각 항목에 shortName 추가
  const getBrokerItems = () => {
    return clusterState.brokers.map(broker => ({
      ...broker,
      shortName: `B${broker.id}`,
      type: 'broker' // 추가: 타입 정보 설정
    }));
  };

  const getControllerItems = () => {
    return clusterState.controllers.map(controller => ({
      ...controller,
      shortName: `C${controller.id}`,
      type: 'controller' // 추가: 타입 정보 설정
    }));
  };

  const getConnectorItems = () => {
    return clusterState.connectors.map(connector => ({
      ...connector,
      shortName: `K${connector.id}`,
      type: 'connector' // 추가: 타입 정보 설정
    }));
  };

  const getSchemaRegistryItems = () => {
    return clusterState.schemaRegistries.map(sr => ({
      ...sr,
      shortName: `SR${sr.id}`,
      type: 'schemaRegistry' // 추가: 타입 정보 설정
    }));
  };

  // Snackbar 닫기 함수
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const Footer = () => {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 2, 
        opacity: 0.7, 
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        mt: 4 
      }}>
        © 2025 SK Shields Rookies
      </Box>
    );
  };

  return (
    <NightContainer isEmergency={isEmergency}>
      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        justifyContent: 'space-between',
        padding: 0,
        margin: 0,
        maxWidth: '100% !important',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}>
        <Box sx={{ padding: { xs: '16px', md: '24px' }, paddingBottom: 0 }}>
          <Box sx={{ 
            backgroundColor: 'rgba(42, 42, 62, 0.8)', 
            borderRadius: '16px',
            padding: '16px 24px',
            marginBottom: '24px'
          }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h4" sx={{ 
                  fontWeight: '700', 
                  color: themeColors.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  fontFamily: "'Orbitron', sans-serif"
                }}>
                  Night System Monitor
                </Typography>
                <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, mt: 1 }}>
                  Real-time distributed system health dashboard
                </Typography>
              </Grid>
              <Grid item>
                <EmergencyModeDisplay isEmergency={isEmergency} />
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={3}>
              <MetricCard
                type="broker"
                title="Broker Status"
                value={`${clusterState.brokers.filter(b => b.status === 'active').length}/3`}
                trend={isEmergency ? "Some Brokers Down" : "All Brokers Active"}
                icon={Storage}
                color={themeColors.primary}
                health={clusterState.brokers.filter(b => b.status === 'active').length / clusterState.brokers.length * 100}
                isAlertActive={!isEmergency}
                isEmergency={isEmergency}
                items={getBrokerItems()}
                onItemToggle={toggleStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                type="controller"
                title="Controller Status"
                value={`${clusterState.controllers.filter(c => c.status === 'active').length}/3`}
                trend="Leader Active"
                icon={Memory}
                color={themeColors.success}
                health={clusterState.controllers.filter(c => c.status === 'active').length / clusterState.controllers.length * 100}
                isEmergency={isEmergency}
                items={getControllerItems()}
                onItemToggle={toggleStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                type="connector"
                title="Connectors"
                value={`${clusterState.connectors.filter(c => c.status === 'active').length}/2`}
                trend="Data Flow Status"
                icon={CompareArrows}
                color={themeColors.warning}
                health={clusterState.connectors.filter(c => c.status === 'active').length / clusterState.connectors.length * 100}
                isEmergency={isEmergency}
                items={getConnectorItems()}
                onItemToggle={toggleStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                type="schemaRegistry"
                title="Schema Registry"
                value={`${clusterState.schemaRegistries.filter(s => s.status === 'active').length}/2`}
                trend="Schema Service"
                icon={DataObject}
                color={themeColors.primary}
                health={clusterState.schemaRegistries.filter(s => s.status === 'active').length / clusterState.schemaRegistries.length * 100}
                isEmergency={isEmergency}
                items={getSchemaRegistryItems()}
                onItemToggle={toggleStatus}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ErrorLogsPanel 
                isEmergency={isEmergency} 
                clusterState={clusterState}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TopicDataStreamPanel 
                isEmergency={isEmergency} 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <KafkaMonitoringPanel 
                isEmergency={isEmergency} 
                hasErrors={hasErrors} 
                hasWarnings={hasWarnings} 
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* 푸터 */}
        <Footer />
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: snackbar.severity === 'error' ? themeColors.error : themeColors.success,
            boxShadow: `0 0 20px ${snackbar.severity === 'error' ? themeColors.error : themeColors.success}40`,
            border: 'none'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NightContainer>
  );
}

export default NightSystemMonitor;
