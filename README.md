# 주식 거래 앱

모바일 중심의 주식 거래 애플리케이션입니다.

## 🚀 실제 API 연동 가이드

### 1. Spring Boot 백엔드 연동 준비사항

#### 필요한 API 엔드포인트:
\`\`\`
POST /api/auth/login          - 로그인
POST /api/auth/register       - 회원가입  
POST /api/auth/logout         - 로그아웃
GET  /api/stocks/today        - 오늘의 주식 목록
GET  /api/stocks/{id}         - 주식 상세 정보
POST /api/trading/buy         - 주식 구매
POST /api/trading/sell        - 주식 판매
GET  /api/portfolio           - 포트폴리오 조회
GET  /api/portfolio/balance   - 잔고 조회
GET  /api/user/profile        - 사용자 프로필
\`\`\`

#### WebSocket 엔드포인트:
\`\`\`
/ws - 실시간 데이터 수신 (주식 가격, 포트폴리오 업데이트)
\`\`\`

### 2. 코드 수정 필요 부분

#### `services/api.ts`:
- 모든 모킹 함수 제거
- 실제 fetch 요청 활성화
- 에러 처리 강화

#### `services/websocket.ts`:
- 모킹 인터벌 제거
- 실제 WebSocket 연결 활성화
- Spring Boot 메시지 형식에 맞게 수정

#### `types/index.ts`:
- Spring Boot API 응답 형식에 맞게 타입 수정
- 필요한 필드 추가/제거

### 3. 환경 변수 설정

`.env.local` 파일 생성:
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api
NEXT_PUBLIC_WS_URL=wss://your-api-server.com/ws
\`\`\`

### 4. 배포 전 체크리스트

- [ ] 모든 모킹 코드 제거
- [ ] 실제 API 엔드포인트 연결 확인
- [ ] WebSocket 연결 테스트
- [ ] 에러 처리 강화
- [ ] 환경 변수 설정
- [ ] CORS 설정 확인
- [ ] JWT 토큰 처리 확인
- [ ] 실시간 데이터 수신 테스트

## 🛠️ 개발 환경 실행

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📱 주요 기능

- 하루 한 번 주식 구매 제한
- 실시간 주식 가격 업데이트
- 포트폴리오 관리
- 수익률 계산
- 다크 테마 UI
