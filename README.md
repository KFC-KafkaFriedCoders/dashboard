# NightMonitor 시스템

## 소개
NightMonitor는 시스템 상태를 실시간으로 모니터링하는 대시보드 애플리케이션입니다. Kafka 시스템의 상태를 시각화하고 비상 상황을 감지하여 사용자에게 알림을 제공합니다.

## 주요 기능
- 시스템 지표 실시간 모니터링
- 비상 상황 자동 감지 및 알림
- 다크 테마 기반의 모던한 UI
- 반응형 대시보드 레이아웃

## 기술 스택
- React
- Material-UI
- Styled Components
- Chart.js

## 시작하기

### 사전 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 설치 방법
```bash
# 저장소 클론
git clone https://github.com/your-username/night-monitor.git
cd night-monitor

# 의존성 설치
npm install
# 또는
yarn install

# 개발 서버 실행
npm start
# 또는
yarn start
```

## 주요 컴포넌트

### NightKafkaMonitor
- 메인 대시보드 컴포넌트
- 시스템 상태 모니터링 및 비상 상황 감지

### MetricComponents
- 다양한 메트릭 시각화 컴포넌트
- 그래프, 차트 및 알림 표시기 포함

### NightThemeProvider
- 다크 테마 제공 및 비상 모드 시각적 효과 적용

## 비상 모드
시스템은 다음과 같은 경우 비상 모드로 전환됩니다:
- 시스템 구성 요소 중 하나가 오프라인 상태일 때
- 지정된 임계값을 초과하는 이상 현상이 감지될 때

비상 모드에서는:
- 화면 상단에 "EMERGENCY ALERT" 배너가 4초간 표시됩니다
- 대시보드 배경이 빨간색으로 변경됩니다
- "EMERGENCY MODE" 표시가 화면에 유지됩니다

## 라이센스
MIT