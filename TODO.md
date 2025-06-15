# 🚧 개발 TODO 리스트

## 🔥 우선순위 높음 (백엔드 연동)

### 1. Spring Boot 백엔드 개발
- [ ] **프로젝트 초기 설정**
  - [ ] Spring Boot 3.x 프로젝트 생성
  - [ ] PostgreSQL/MySQL 데이터베이스 설정
  - [ ] JPA/Hibernate 설정
  - [ ] JWT 인증 설정

- [ ] **데이터베이스 스키마 설계**
  - [ ] 사용자 테이블 (users)
  - [ ] 주식 정보 테이블 (stocks)
  - [ ] 포트폴리오 테이블 (portfolios)
  - [ ] 거래 내역 테이블 (transactions)
  - [ ] 일일 거래 제한 테이블 (daily_limits)

### 2. REST API 개발
- [ ] **인증 API**
  - [ ] `POST /api/auth/login` - 로그인
  - [ ] `POST /api/auth/register` - 회원가입
  - [ ] `POST /api/auth/logout` - 로그아웃
  - [ ] `GET /api/auth/me` - 사용자 정보

- [ ] **주식 API**
  - [ ] `GET /api/stocks/today` - 오늘의 주식 5개
  - [ ] `GET /api/stocks/{id}` - 주식 상세 정보
  - [ ] 외부 주식 API 연동 (한국투자증권, 키움증권 등)

- [ ] **거래 API**
  - [ ] `POST /api/trading/buy` - 주식 구매
  - [ ] `POST /api/trading/sell` - 주식 판매
  - [ ] `GET /api/trading/limits` - 거래 제한 조회
  - [ ] `GET /api/trading/history` - 거래 내역

- [ ] **포트폴리오 API**
  - [ ] `GET /api/portfolio` - 포트폴리오 조회
  - [ ] `GET /api/portfolio/balance` - 잔고 조회

### 3. WebSocket 실시간 통신
- [ ] **WebSocket 서버 설정**
  - [ ] `/ws` 엔드포인트 구현
  - [ ] JWT 토큰 기반 인증
  - [ ] 채널별 구독 시스템

- [ ] **실시간 데이터 전송**
  - [ ] 주식 가격 업데이트 (`STOCK_UPDATE`)
  - [ ] 포트폴리오 변경 (`PORTFOLIO_UPDATE`)
  - [ ] 잔고 변경 (`BALANCE_UPDATE`)
  - [ ] 거래 제한 상태 (`TRADING_LIMITS_UPDATE`)

## 🔧 프론트엔드 수정사항

### 4. API 연동 코드 수정
- [ ] **services/api.ts**
  - [ ] 모든 모킹 함수 제거
  - [ ] 실제 HTTP 요청 구현
  - [ ] 에러 처리 강화
  - [ ] 토큰 갱신 로직

- [ ] **services/websocket.ts**
  - [ ] 모킹 인터벌 제거
  - [ ] 실제 WebSocket 연결
  - [ ] 재연결 로직 구현
  - [ ] 메시지 타입 검증

- [ ] **types/index.ts**
  - [ ] 백엔드 API 응답 형식에 맞게 타입 수정
  - [ ] 에러 응답 타입 추가

## 🚀 배포 및 인프라

### 5. 백엔드 배포
- [ ] **Docker 설정**
  - [ ] Dockerfile 작성
  - [ ] docker-compose.yml (DB 포함)
  - [ ] 환경별 설정 파일

- [ ] **클라우드 배포**
  - [ ] AWS/GCP/Azure 선택
  - [ ] 데이터베이스 설정 (RDS/Cloud SQL)
  - [ ] 로드밸런서 설정
  - [ ] SSL 인증서 설정

### 6. 프론트엔드 배포
- [ ] **Vercel 배포 최적화**
  - [ ] 환경 변수 설정
  - [ ] 빌드 최적화
  - [ ] CDN 설정

## 🎯 추가 기능 개발

### 7. 고급 기능
- [ ] **알림 시스템**
  - [ ] 가격 알림 설정
  - [ ] 푸시 알림 (PWA)
  - [ ] 이메일 알림

- [ ] **차트 기능**
  - [ ] 실시간 가격 차트
  - [ ] 기술적 지표
  - [ ] 과거 데이터 조회

- [ ] **소셜 기능**
  - [ ] 투자 성과 공유
  - [ ] 랭킹 시스템
  - [ ] 커뮤니티 기능

### 8. 보안 및 성능
- [ ] **보안 강화**
  - [ ] Rate Limiting
  - [ ] CORS 설정
  - [ ] SQL Injection 방지
  - [ ] XSS 방지

- [ ] **성능 최적화**
  - [ ] 데이터베이스 인덱싱
  - [ ] 캐싱 전략 (Redis)
  - [ ] API 응답 최적화
  - [ ] 이미지 최적화

## 📊 모니터링 및 분석

### 9. 운영 도구
- [ ] **로깅 시스템**
  - [ ] 구조화된 로그
  - [ ] 에러 추적 (Sentry)
  - [ ] 성능 모니터링

- [ ] **분석 도구**
  - [ ] 사용자 행동 분석
  - [ ] 거래 패턴 분석
  - [ ] A/B 테스트 도구

## 🧪 테스트

### 10. 테스트 코드
- [ ] **백엔드 테스트**
  - [ ] 단위 테스트 (JUnit)
  - [ ] 통합 테스트
  - [ ] API 테스트

- [ ] **프론트엔드 테스트**
  - [ ] 컴포넌트 테스트 (Jest)
  - [ ] E2E 테스트 (Playwright)
  - [ ] 접근성 테스트

---

## 📅 개발 일정 (예상)

| 단계 | 예상 기간 | 우선순위 |
|------|-----------|----------|
| 백엔드 기본 구조 | 1-2주 | 🔥 높음 |
| API 개발 | 2-3주 | 🔥 높음 |
| WebSocket 구현 | 1주 | 🔥 높음 |
| 프론트엔드 연동 | 1주 | 🔥 높음 |
| 배포 및 테스트 | 1주 | 🔥 높음 |
| 추가 기능 | 2-4주 | 🟡 중간 |

**총 예상 기간**: 8-12주
