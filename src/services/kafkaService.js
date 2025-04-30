import { 
  statusBroker, 
  statusController, 
  statusConnect, 
  statusSchema,
  startBroker,
  shutDownBroker,
  startController,
  shutDownController,
  startConnect,
  shutDownConnect,
  startSchema,
  shutDownSchema
} from '../api/clusterApi';

// 상태 변경 후 확인을 위한 대기 시간 (ms)
const STATUS_CHECK_DELAY = 1000;
// 최대 재시도 횟수
const MAX_RETRIES = 3;

/**
 * 상태 변경 후 실제 상태 확인을 위한 함수
 * @param {Function} checkFn 상태 확인 함수
 * @param {number} id 컴포넌트 ID
 * @param {boolean} expectedStatus 예상되는 상태
 * @returns {Promise<boolean>} 최종 상태
 */
const waitForStatus = async (checkFn, id, expectedStatus, retries = 0) => {
  try {
    const status = await checkFn(id);
    if (status === expectedStatus || retries >= MAX_RETRIES) {
      return status;
    }
    await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_DELAY));
    return waitForStatus(checkFn, id, expectedStatus, retries + 1);
  } catch (error) {
    console.error('상태 확인 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 클러스터 상태를 가져오는 서비스 함수
 * @returns {Promise<Object>} 클러스터 상태 정보
 */
export const getClusterState = async () => {
  try {
    const [brokerStatuses, controllerStatuses, connectStatuses, schemaStatuses] = await Promise.all([
      Promise.all([1, 2, 3].map(id => statusBroker(id))),
      Promise.all([1, 2, 3].map(id => statusController(id))),
      Promise.all([1, 2].map(id => statusConnect(id))),
      Promise.all([1, 2].map(id => statusSchema(id)))
    ]);

    return {
      brokers: brokerStatuses.map((status, index) => ({
        id: index + 1,
        status: status ? 'active' : 'inactive',
        health: status ? 100 : 0
      })),
      controllers: controllerStatuses.map((status, index) => ({
        id: index + 1,
        status: status ? 'active' : 'inactive',
        health: status ? 100 : 0
      })),
      connectors: connectStatuses.map((status, index) => ({
        id: index + 1,
        status: status ? 'active' : 'inactive',
        health: status ? 100 : 0
      })),
      schemaRegistries: schemaStatuses.map((status, index) => ({
        id: index + 1,
        status: status ? 'active' : 'inactive',
        health: status ? 100 : 0
      }))
    };
  } catch (error) {
    console.error('클러스터 상태 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 클러스터 알림을 가져오는 서비스 함수
 * @returns {Promise<Array>} 알림 목록
 */
export const getClusterAlerts = async () => {
  try {
    const [brokerStatuses, controllerStatuses, connectStatuses, schemaStatuses] = await Promise.all([
      Promise.all([1, 2, 3].map(id => statusBroker(id))),
      Promise.all([1, 2, 3].map(id => statusController(id))),
      Promise.all([1, 2].map(id => statusConnect(id))),
      Promise.all([1, 2].map(id => statusSchema(id)))
    ]);

    const alerts = [];
    
    // 브로커 상태 확인
    brokerStatuses.forEach((status, index) => {
      if (!status) {
        alerts.push({
          id: `broker-${index + 1}`,
          type: 'error',
          message: `브로커 ${index + 1}이 비활성화 상태입니다`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 컨트롤러 상태 확인
    controllerStatuses.forEach((status, index) => {
      if (!status) {
        alerts.push({
          id: `controller-${index + 1}`,
          type: 'error',
          message: `컨트롤러 ${index + 1}이 비활성화 상태입니다`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 커넥터 상태 확인
    connectStatuses.forEach((status, index) => {
      if (!status) {
        alerts.push({
          id: `connector-${index + 1}`,
          type: 'error',
          message: `커넥터 ${index + 1}이 비활성화 상태입니다`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 스키마 레지스트리 상태 확인
    schemaStatuses.forEach((status, index) => {
      if (!status) {
        alerts.push({
          id: `schema-${index + 1}`,
          type: 'error',
          message: `스키마 레지스트리 ${index + 1}이 비활성화 상태입니다`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return alerts;
  } catch (error) {
    console.error('클러스터 알림 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 브로커 상태를 변경하는 서비스 함수
 * @param {number} brokerId 브로커 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<boolean>} 최종 상태
 */
export const toggleBroker = async (brokerId, isActive) => {
  try {
    if (isActive) {
      await startBroker(brokerId);
    } else {
      await shutDownBroker(brokerId);
    }
    return await waitForStatus(statusBroker, brokerId, isActive);
  } catch (error) {
    console.error('브로커 상태 변경 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 컨트롤러 상태를 변경하는 서비스 함수
 * @param {number} controllerId 컨트롤러 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<boolean>} 최종 상태
 */
export const toggleController = async (controllerId, isActive) => {
  try {
    if (isActive) {
      await startController(controllerId);
    } else {
      await shutDownController(controllerId);
    }
    return await waitForStatus(statusController, controllerId, isActive);
  } catch (error) {
    console.error('컨트롤러 상태 변경 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 커넥터 상태를 변경하는 서비스 함수
 * @param {number} connectorId 커넥터 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<boolean>} 최종 상태
 */
export const toggleConnector = async (connectorId, isActive) => {
  try {
    if (isActive) {
      await startConnect(connectorId);
    } else {
      await shutDownConnect(connectorId);
    }
    return await waitForStatus(statusConnect, connectorId, isActive);
  } catch (error) {
    console.error('커넥터 상태 변경 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 스키마 레지스트리 상태를 변경하는 서비스 함수
 * @param {number} srId 스키마 레지스트리 ID
 * @param {boolean} isActive 활성화 여부
 * @returns {Promise<boolean>} 최종 상태
 */
export const toggleSchemaRegistry = async (srId, isActive) => {
  try {
    if (isActive) {
      await startSchema(srId);
    } else {
      await shutDownSchema(srId);
    }
    return await waitForStatus(statusSchema, srId, isActive);
  } catch (error) {
    console.error('스키마 레지스트리 상태 변경 중 오류 발생:', error);
    throw error;
  }
}; 