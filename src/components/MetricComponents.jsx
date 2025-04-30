import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Grid, Card } from '@mui/material';
import { CompareArrows, NotificationsActive, ErrorOutline } from '@mui/icons-material';
import { NightCard, themeColors, floatingEffect, pulse } from './NightThemeProvider';
import axios from 'axios';
// sum(kafka_server_brokertopicmetrics_messagesinpersec) by (topic)
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
export const ErrorLogsPanel = ({ isEmergency, clusterState }) => {
  const [errorLogs, setErrorLogs] = useState([]);

  useEffect(() => {
    const newErrorLogs = [];
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 브로커 상태 확인
    clusterState.brokers.forEach(broker => {
      if (broker.status === 'inactive') {
        newErrorLogs.push({
          id: `broker-${broker.id}`,
          message: `${broker.id}번 브로커 down ${timestamp}`,
          type: 'error'
        });
      }
    });

    // 컨트롤러 상태 확인
    clusterState.controllers.forEach(controller => {
      if (controller.status === 'inactive') {
        newErrorLogs.push({
          id: `controller-${controller.id}`,
          message: `${controller.id}번 컨트롤러 down ${timestamp}`,
          type: 'error'
        });
      }
    });

    // 커넥터 상태 확인
    clusterState.connectors.forEach(connector => {
      if (connector.status === 'inactive') {
        newErrorLogs.push({
          id: `connector-${connector.id}`,
          message: `${connector.id}번 커넥터 down ${timestamp}`,
          type: 'error'
        });
      }
    });

    // 스키마 레지스트리 상태 확인
    clusterState.schemaRegistries.forEach(sr => {
      if (sr.status === 'inactive') {
        newErrorLogs.push({
          id: `schema-${sr.id}`,
          message: `${sr.id}번 스키마레지스트리 down ${timestamp}`,
          type: 'error'
        });
      }
    });

    // 최대 10개까지만 유지
    setErrorLogs(newErrorLogs.slice(0, 10));
  }, [clusterState]);

  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: isEmergency ? 'rgba(255, 82, 82, 0.1)' : 'rgba(42, 42, 62, 0.8)',
      border: `1px solid ${isEmergency ? themeColors.error : 'rgba(255, 255, 255, 0.1)'}`,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ 
          color: isEmergency ? themeColors.error : themeColors.text,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ErrorOutline sx={{ color: isEmergency ? themeColors.error : themeColors.primary }} />
          Error Logs
        </Typography>
      </Box>
      
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        maxHeight: '300px',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.4)'
          }
        }
      }}>
        {errorLogs.length > 0 ? (
          errorLogs.map((log) => (
            <Box key={log.id} sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              <Typography variant="body2" sx={{ 
                color: themeColors.error,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {log.message}
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
              No errors detected
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

// 토픽 데이터 스트림 컴포넌트
export const TopicDataStreamPanel = ({ isEmergency }) => {
  
  const [topicData, setTopicData] = useState([]);


  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/v1/query?query=kafka_server_brokertopicmetrics_messagesinpersec")
        const metricsData = response.data.data.result
        setTopicData(metricsData);
      } catch (error) {
        console.error('토픽 데이터를 가져오는 중 오류 발생:', error);
      }
    };
    fetchTopicData();
    setInterval(() => {fetchTopicData();}, 10000);
    return () => clearInterval(fetchTopicData);
  }, []);

  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: isEmergency ? 'rgba(255, 82, 82, 0.1)' : 'rgba(42, 42, 62, 0.8)',
      border: `1px solid ${isEmergency ? themeColors.error : 'rgba(255, 255, 255, 0.1)'}`,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ 
          color: isEmergency ? themeColors.error : themeColors.text,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CompareArrows sx={{ color: isEmergency ? themeColors.error : themeColors.primary }} />
          Topic Data Stream
        </Typography>
      </Box>
      
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        maxHeight: '300px',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.4)'
          }
        }
      }}>
        {
        topicData.length > 0 ? (
          topicData.filter(data => data.metric.job === "kafka-broker")
          .map((data, index) => (
            <Box key={index} sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' }
            }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: themeColors.text }}>
                    Topic: {data.metric.topic}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: themeColors.text }}>
                    hostname: {data.metric.hostname}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: themeColors.text }}>
                    Messagesbytes/s: {data.value[1]}
                  </Typography>
                </Grid>
              </Grid>
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
              No data available
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export const KafkaMonitoringPanel = ({ isEmergency, hasErrors, hasWarnings, brokerActive }) => {
  
  const [logSize, setLogSize] = useState([])
  const [partitionData, setPartitionData] = useState([]);
  const [sum, setSum] = useState(0);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/v1/query?query=kafka_server_replicamanager_partitioncount");
        setPartitionData(response.data.data.result);
      } catch (error) {
        console.error('토픽 데이터를 가져오는 중 오류 발생:', error);
      }
    };
    const fetchLogSize = async () => {
      try {
        const response = await axios.get(
          'http://localhost:9090/api/v1/query',
          {
            params: {
              query: 'sum(kafka_log_log_size{job="kafka-broker"}) by (instance)'
            }
          }
        );
        setLogSize(response);
      } catch (error) {
        console.log('error / 로그 사이즈 수집');
      }
    }
    fetchLogSize();
    fetchTopicData();
    const intervalId = setInterval(fetchTopicData, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const getAllPartition = () => {
    setSum(0);
    if(partitionData.length > 0){
      for(let i = 0; i < partitionData.length; i++){
        setSum(prevSum => prevSum + parseInt(partitionData[i].value[1]));
      }
    }

  }
  useEffect(() => {
    getAllPartition();
  },[partitionData]);

  return (
    <NightCard isEmergency={isEmergency}>
      <Box display="flex" alignItems="center" mb={2}>
        <NotificationsActive
          className={hasErrors || !brokerActive ? 'emergency-icon' : ''}
          sx={{
            color: hasErrors || !brokerActive
              ? themeColors.error
              : hasWarnings
              ? themeColors.warning
              : themeColors.primary,
            mr: 1,
            animation: hasErrors || !brokerActive
              ? `${floatingEffect} 2s infinite ease-in-out`
              : `${floatingEffect} 3s infinite ease-in-out`,
            filter: hasErrors || !brokerActive
              ? 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.6))'
              : 'none'
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: hasErrors || !brokerActive ? themeColors.error : themeColors.text
          }}
        >
          Kafka Monitoring
        </Typography>
      </Box>
      <Divider
        sx={{
          borderColor: isEmergency
            ? 'rgba(255, 82, 82, 0.2)'
            : 'rgba(255, 143, 171, 0.1)',
          mb: 2
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
          height: '250px',
          overflowY: 'auto'
        }}
      >
        <Box sx={{ backgroundColor: `${themeColors.cardBg}90`, borderRadius: '8px', padding: 2 }}>
          <Typography variant="subtitle2" sx={{ color: themeColors.warning, mb: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
            All Partitions
          </Typography>
          <Typography variant="h5" sx={{ color: themeColors.success, fontWeight: 'bold' }}>
            {sum}
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: `${themeColors.cardBg}90`, borderRadius: '8px', padding: 2 }}>
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

        <Box sx={{ backgroundColor: `${themeColors.cardBg}90`, borderRadius: '8px', padding: 2 }}>
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

        <Box sx={{ backgroundColor: `${themeColors.cardBg}90`, borderRadius: '8px', padding: 2 }}>
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
};

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

