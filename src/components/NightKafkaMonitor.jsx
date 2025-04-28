import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Typography, Alert, Snackbar, Box, Card, Switch } from '@mui/material';
import { Storage, Memory, CompareArrows, DataObject, TerminalIcon, ListAltIcon, ClearAllIcon, ErrorIcon, WarningIcon, InfoIcon, DoneAllIcon, BugReportIcon, CheckCircleOutlineIcon } from '@mui/icons-material';
import { NightContainer, themeColors } from './NightThemeProvider';
import MetricCard from './MetricCard';
import { 
  ErrorLogsPanel, 
  TopicDataStreamPanel, 
  KafkaMonitoringPanel, 
  EmergencyModeDisplay,
  DashboardFooter
} from './MetricComponents';
import { 
  getClusterState, 
  getClusterAlerts,
  toggleBroker, 
  toggleController, 
  toggleConnector, 
  toggleSchemaRegistry,
  generateTopicData,
  generateErrorLog
} from '../services/kafkaService';

function NightSystemMonitor() {
  const [clusterState, setClusterState] = useState({
    brokers: [
      { id: 1, status: 'active', health: 100 },
      { id: 2, status: 'active', health: 100 },
      { id: 3, status: 'active', health: 100 }
    ],
    controllers: [
      { id: 1, status: 'active', isLeader: true },
      { id: 2, status: 'active', isLeader: false },
      { id: 3, status: 'active', isLeader: false }
    ],
    connectors: [
      { id: 1, name: 'mysql-sink', status: 'active', type: 'sink' },
      { id: 2, name: 'stream-processor', status: 'active', type: 'processor' }
    ],
    schemaRegistry: [
      { id: 1, status: 'active', mode: 'primary' },
      { id: 2, status: 'active', mode: 'backup' }
    ]
  });

  const [alerts, setAlerts] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [brokerActive, setBrokerActive] = useState(true);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const errorLogsRef = useRef(null);
  const emergencyTimerRef = useRef(null);

  // 토픽 데이터 처리 시각화를 위한 더미 데이터 생성
  const [topicData, setTopicData] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(Date.now());

  // 시스템 상태를 확인하는 함수
  const checkSystemStatus = (
    brokers = clusterState.brokers,
    controllers = clusterState.controllers,
    connectors = clusterState.connectors,
    schemaRegistry = clusterState.schemaRegistry
  ) => {
    const anyBrokerDown = brokers.some(b => b.status !== 'active');
    const anyControllerDown = controllers.some(c => c.status !== 'active');
    const anyConnectorDown = connectors.some(c => c.status !== 'active');
    const anySRDown = schemaRegistry.some(s => s.status !== 'active');
    
    const shouldBeEmergency = anyBrokerDown || anyControllerDown || anyConnectorDown || anySRDown;
    setIsEmergency(shouldBeEmergency);

    // 비상 모드가 활성화되면 배너 표시
    if (shouldBeEmergency && !showEmergencyBanner) {
      setShowEmergencyBanner(true);
      
      // 4초 후 배너 숨기기
      clearTimeout(emergencyTimerRef.current);
      emergencyTimerRef.current = setTimeout(() => {
        setShowEmergencyBanner(false);
      }, 4000);
    } else if (!shouldBeEmergency) {
      setShowEmergencyBanner(false);
      clearTimeout(emergencyTimerRef.current);
    }
    
    setBrokerActive(!anyBrokerDown);
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 클러스터 상태 및 알림 정보 조회
    const loadClusterData = async () => {
      try {
        const clusterData = await getClusterState();
        setClusterState(clusterData);
        
        const alertsData = await getClusterAlerts();
        if (alertsData.length > 0) {
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('클러스터 데이터 로드 중 오류 발생:', error);
      }
    };

    loadClusterData();
    
    // 샘플 에러 로그 데이터 생성
    setErrorLogs([
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        level: 'ERROR',
        source: 'broker-1',
        message: 'Connection refused to zookeeper instance at 10.0.1.5:2181'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
        level: 'WARN',
        source: 'connector-mysql',
        message: 'Slow query execution detected, took 4.3s to complete'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
        level: 'ERROR',
        source: 'schema-registry',
        message: 'Failed to serialize schema for topic payment-events'
      }
    ]);
  }, []);

  // 새 에러 로그를 주기적으로 추가하는 모의 기능
  useEffect(() => {
    if (isEmergency) {
      const interval = setInterval(() => {
        const newErrorLog = generateErrorLog();
        setErrorLogs(prev => [newErrorLog, ...prev.slice(0, 50)]);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isEmergency]);

  useEffect(() => {
    // 모든 컴포넌트의 상태를 확인하여 비상 모드 결정
    checkSystemStatus(
      clusterState.brokers,
      clusterState.controllers,
      clusterState.connectors,
      clusterState.schemaRegistry
    );
  }, [clusterState]);

  useEffect(() => {
    // 토픽 처리량 데이터 생성
    const interval = setInterval(() => {
      const newData = generateTopicData();
      setTopicData(prev => [newData, ...prev.slice(0, 49)]);
      setLastTimestamp(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setHasErrors(alerts.some(alert => alert.severity === 'error'));
    setHasWarnings(alerts.some(alert => alert.severity === 'warning'));
  }, [alerts]);

  const toggleBrokerStatus = async (index) => {
    // 인덱스 유효성 검사
    if (index < 0 || index >= clusterState.brokers.length) {
      console.error(`유효하지 않은 브로커 인덱스: ${index}`);
      setSnackbar({
        open: true,
        message: `유효하지 않은 브로커 인덱스: ${index}`,
        severity: 'error'
      });
      return;
    }
    
    try {
      // 브로커 상태 변경
      const updatedBrokers = [...clusterState.brokers];
      const currentStatus = updatedBrokers[index].status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // 상태 업데이트
      updatedBrokers[index] = { 
        ...updatedBrokers[index], 
        status: newStatus
      };
      
      // 클러스터 상태 업데이트
      setClusterState(prev => ({
        ...prev,
        brokers: updatedBrokers
      }));
      
      // 시스템 상태 확인
      checkSystemStatus(updatedBrokers);
      
      // 알림 추가
      const brokerId = updatedBrokers[index].id;
      const newAlert = {
        id: Date.now(),
        severity: newStatus === 'active' ? 'success' : 'error',
        title: `Broker ${brokerId} ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        message: `Broker ${brokerId} has been ${newStatus === 'active' ? 'started' : 'stopped'}.`,
        timestamp: new Date().toLocaleTimeString(),
        isRead: false
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
    } catch (error) {
      console.error(`브로커 상태 업데이트 중 오류 발생:`, error);
      setSnackbar({
        open: true,
        message: `Failed to update broker status: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const toggleControllerStatus = async (index) => {
    // 컨트롤러 상태 변경
    const updatedControllers = [...clusterState.controllers];
    const currentStatus = updatedControllers[index].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // 상태 업데이트
      updatedControllers[index] = { 
        ...updatedControllers[index], 
        status: newStatus
      };
      
      // 클러스터 상태 업데이트
      setClusterState(prev => ({
        ...prev,
        controllers: updatedControllers
      }));
      
      // 알림 추가
      const controllerId = updatedControllers[index].id;
      const newAlert = {
        id: Date.now(),
        severity: newStatus === 'active' ? 'success' : 'error',
        title: `Controller ${controllerId} ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        message: `Controller ${controllerId} has been ${newStatus === 'active' ? 'started' : 'stopped'}.`,
        timestamp: new Date().toLocaleTimeString(),
        isRead: false
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
    } catch (error) {
      console.error(`컨트롤러 상태 업데이트 중 오류 발생:`, error);
      setSnackbar({
        open: true,
        message: `Failed to update controller status: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const toggleConnectorStatus = async (index) => {
    // 커넥터 상태 변경
    const updatedConnectors = [...clusterState.connectors];
    const currentStatus = updatedConnectors[index].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // 상태 업데이트
      updatedConnectors[index] = { 
        ...updatedConnectors[index], 
        status: newStatus
      };
      
      // 클러스터 상태 업데이트
      setClusterState(prev => ({
        ...prev,
        connectors: updatedConnectors
      }));
      
      // 알림 추가
      const connectorId = updatedConnectors[index].id;
      const connectorName = updatedConnectors[index].name;
      const newAlert = {
        id: Date.now(),
        severity: newStatus === 'active' ? 'success' : 'error',
        title: `Connector ${connectorName} ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        message: `Connector ${connectorName} has been ${newStatus === 'active' ? 'started' : 'stopped'}.`,
        timestamp: new Date().toLocaleTimeString(),
        isRead: false
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
    } catch (error) {
      console.error(`커넥터 상태 업데이트 중 오류 발생:`, error);
      setSnackbar({
        open: true,
        message: `Failed to update connector status: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const toggleSchemaRegistryStatus = async (index) => {
    // 스키마 레지스트리 상태 변경
    const updatedRegistry = [...clusterState.schemaRegistry];
    const currentStatus = updatedRegistry[index].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // 상태 업데이트
      updatedRegistry[index] = { 
        ...updatedRegistry[index], 
        status: newStatus
      };
      
      // 클러스터 상태 업데이트
      setClusterState(prev => ({
        ...prev,
        schemaRegistry: updatedRegistry
      }));
      
      // 알림 추가
      const srId = updatedRegistry[index].id;
      const srMode = updatedRegistry[index].mode;
      const newAlert = {
        id: Date.now(),
        severity: newStatus === 'active' ? 'success' : 'error',
        title: `Schema Registry ${srId} (${srMode}) ${newStatus === 'active' ? 'Started' : 'Stopped'}`,
        message: `Schema Registry ${srId} has been ${newStatus === 'active' ? 'started' : 'stopped'}.`,
        timestamp: new Date().toLocaleTimeString(),
        isRead: false
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
    } catch (error) {
      console.error(`스키마 레지스트리 상태 업데이트 중 오류 발생:`, error);
      setSnackbar({
        open: true,
        message: `Failed to update schema registry status: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 각 항목에 shortName 추가
  const getBrokerItems = () => {
    return clusterState.brokers.map(broker => ({
      ...broker,
      shortName: `B${broker.id}`
    }));
  };

  const getControllerItems = () => {
    return clusterState.controllers.map(controller => ({
      ...controller,
      shortName: `C${controller.id}`
    }));
  };

  const getConnectorItems = () => {
    return clusterState.connectors.map(connector => ({
      ...connector,
      shortName: connector.name.substring(0, 4)
    }));
  };

  const getSchemaRegistryItems = () => {
    return clusterState.schemaRegistry.map(sr => ({
      ...sr,
      shortName: `SR${sr.id}`
    }));
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

  const BrokerControls = ({ brokers, onToggle }) => {
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {brokers.map((broker, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ 
              bgcolor: broker.status === 'active' ? 'rgba(35, 166, 97, 0.2)' : 'rgba(255, 82, 82, 0.2)', 
              p: 1, 
              borderRadius: 1,
              border: `1px solid ${broker.status === 'active' ? 'rgba(35, 166, 97, 0.5)' : 'rgba(255, 82, 82, 0.5)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">{broker.id}</Typography>
                <Switch 
                  size="small"
                  checked={broker.status === 'active'}
                  onChange={() => onToggle(index)}
                  color="success"
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                {broker.status === 'active' ? 'Active' : 'Inactive'}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <NightContainer isEmergency={isEmergency} showEmergencyBanner={showEmergencyBanner}>
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
                title="Broker Status"
                value={`${clusterState.brokers.filter(b => b.status === 'active').length}/3`}
                trend={brokerActive ? "All Brokers Active" : "Some Brokers Down"}
                icon={Storage}
                color={themeColors.primary}
                health={clusterState.brokers.filter(b => b.status === 'active').length / clusterState.brokers.length * 100}
                isAlertActive={!brokerActive}
                isEmergency={isEmergency}
                items={getBrokerItems()}
                onItemToggle={toggleBrokerStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Controller Status"
                value={`${clusterState.controllers.filter(c => c.status === 'active').length}/3`}
                trend="Leader Active"
                icon={Memory}
                color={themeColors.success}
                health={clusterState.controllers.filter(c => c.status === 'active').length / clusterState.controllers.length * 100}
                isEmergency={isEmergency}
                items={getControllerItems()}
                onItemToggle={toggleControllerStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Connectors"
                value={`${clusterState.connectors.filter(c => c.status === 'active').length}/2`}
                trend="Data Flow Status"
                icon={CompareArrows}
                color={themeColors.warning}
                health={clusterState.connectors.filter(c => c.status === 'active').length / clusterState.connectors.length * 100}
                isEmergency={isEmergency}
                items={getConnectorItems()}
                onItemToggle={toggleConnectorStatus}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Schema Registry"
                value={`${clusterState.schemaRegistry.filter(s => s.status === 'active').length}/2`}
                trend="Schema Service"
                icon={DataObject}
                color={themeColors.primary}
                health={clusterState.schemaRegistry.filter(s => s.status === 'active').length / clusterState.schemaRegistry.length * 100}
                isEmergency={isEmergency}
                items={getSchemaRegistryItems()}
                onItemToggle={toggleSchemaRegistryStatus}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ErrorLogsPanel 
                isEmergency={isEmergency} 
                errorLogs={errorLogs} 
                errorLogsRef={errorLogsRef} 
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TopicDataStreamPanel 
                isEmergency={isEmergency} 
                topicData={topicData} 
                lastTimestamp={lastTimestamp} 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <KafkaMonitoringPanel 
                isEmergency={isEmergency} 
                hasErrors={hasErrors} 
                hasWarnings={hasWarnings} 
                brokerActive={brokerActive} 
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