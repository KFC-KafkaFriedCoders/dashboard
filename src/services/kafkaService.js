import { fetchClusterState, updateBrokerStatus, fetchClusterAlerts } from '../api/clusterApi';

/**
 * 클러스터 상태를 가져오는 서비스 함수
 * @returns {Promise<Object>} 클러스터 상태 정보
 */
export const getClusterState = async () => {
  try {
    const clusterData = await fetchClusterState();
    return clusterData;
  } catch (error) {
    console.error('클러스터 상태 조회 중 오류 발생:', error);
    // 오류 발생 시 기본 상태 반환
    return {
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
    };
  }
};

/**
 * 클러스터 알림을 가져오는 서비스 함수
 * @returns {Promise<Array>} 알림 목록
 */
export const getClusterAlerts = async () => {
  try {
    const alertsData = await fetchClusterAlerts();
    return alertsData;
  } catch (error) {
    console.error('클러스터 알림 조회 중 오류 발생:', error);
    return [];
  }
};

/**
 * 브로커 상태를 변경하는 서비스 함수
 * @param {number} brokerId 브로커 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<Object>} 응답 객체
 */
export const toggleBroker = async (brokerId, isActive) => {
  try {
    const response = await updateBrokerStatus(brokerId, isActive);
    return {
      success: true,
      message: response.message || `Broker ${brokerId} has been ${isActive ? 'started' : 'stopped'}.`,
      data: response
    };
  } catch (error) {
    console.error(`브로커 ${brokerId} 상태 업데이트 중 오류 발생:`, error);
    return {
      success: false,
      message: '브로커 상태 업데이트 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 컨트롤러 상태를 변경하는 서비스 함수
 * @param {number} controllerId 컨트롤러 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<Object>} 응답 객체
 */
export const toggleController = async (controllerId, isActive) => {
  try {
    // 실제 API가 구현되면 여기서 호출
    return {
      success: true,
      message: `Controller ${controllerId} has been ${isActive ? 'started' : 'stopped'}.`
    };
  } catch (error) {
    console.error(`컨트롤러 ${controllerId} 상태 업데이트 중 오류 발생:`, error);
    return {
      success: false,
      message: '컨트롤러 상태 업데이트 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 커넥터 상태를 변경하는 서비스 함수
 * @param {number} connectorId 커넥터 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<Object>} 응답 객체
 */
export const toggleConnector = async (connectorId, isActive) => {
  try {
    // 실제 API가 구현되면 여기서 호출
    return {
      success: true,
      message: `Connector ${connectorId} has been ${isActive ? 'started' : 'stopped'}.`
    };
  } catch (error) {
    console.error(`커넥터 ${connectorId} 상태 업데이트 중 오류 발생:`, error);
    return {
      success: false,
      message: '커넥터 상태 업데이트 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 스키마 레지스트리 상태를 변경하는 서비스 함수
 * @param {number} srId 스키마 레지스트리 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<Object>} 응답 객체
 */
export const toggleSchemaRegistry = async (srId, isActive) => {
  try {
    // 실제 API가 구현되면 여기서 호출
    return {
      success: true,
      message: `Schema Registry ${srId} has been ${isActive ? 'started' : 'stopped'}.`
    };
  } catch (error) {
    console.error(`스키마 레지스트리 ${srId} 상태 업데이트 중 오류 발생:`, error);
    return {
      success: false,
      message: '스키마 레지스트리 상태 업데이트 중 오류가 발생했습니다.',
      error
    };
  }
};

/**
 * 실시간 토픽 데이터를 가져오는 서비스 함수 (모의 데이터)
 * @returns {Object} 토픽 데이터
 */
export const generateTopicData = () => {
  return {
    timestamp: new Date().toLocaleTimeString(),
    messagesPerSecond: Math.floor(Math.random() * 1000) + 500,
    latency: Math.random() * 5 + 1,
    topicName: ['payments', 'logs', 'users', 'events'][Math.floor(Math.random() * 4)],
    partition: Math.floor(Math.random() * 5) + 1
  };
};

/**
 * 실시간 에러 로그를 생성하는 서비스 함수 (모의 데이터)
 * @returns {Object} 에러 로그
 */
export const generateErrorLog = () => {
  return {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    level: Math.random() > 0.3 ? 'ERROR' : 'WARN',
    source: ['broker-1', 'connector-mysql', 'schema-registry'][Math.floor(Math.random() * 3)],
    message: [
      'Connection timeout occurred during operation',
      'Out of memory exception in worker thread',
      'Failed to process message batch',
      'Unexpected connection close',
      'Resource limit exceeded'
    ][Math.floor(Math.random() * 5)]
  };
}; 