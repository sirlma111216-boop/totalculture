# API와 배포 설정

## 서울시 자료

1. https://data.seoul.go.kr/together/mypage/actkeyMain.do 에서 서울시 계정으로 로그인합니다.
2. 일반 인증키를 신청합니다. 지하철 전용 키가 아닙니다.
3. Cloudflare → Workers & Pages → totalculture → Settings → Variables and Secrets → Production.
4. Secret 타입, 이름 `SEOUL_API_KEY`, 값에 발급받은 키를 입력하고 저장합니다. UI에 Encrypt가 보이면 암호화합니다.
5. 재배포합니다. 이후 앱 하단 `공공자료 새로고침`을 누릅니다.

키는 채팅, 소스 코드, GitHub, 프런트엔드 환경변수(`VITE_` 접두사)에 넣지 않습니다. 인증키는 Pages Function에서만 사용합니다.

API: `culturalEventInfo` (OA-15486), `tvYeyakCOllect` (OA-20497). 공식 공개 명세 및 sample 응답을 2026-10-18 확인했습니다. 한 요청은 1,000행, 자료원별 최대 5,000행까지 읽으며, 제한에 도달하면 앱이 부분 수집임을 표시합니다. 응답은 30분 캐시합니다. 원자료가 하루 1회 갱신되므로 실시간 좌석 조회가 아닙니다.

공식 문서가 제공하는 서울시 API 전송 주소는 HTTP :8088입니다. 앱 브라우저에는 인증키가 없고 HTTPS로 Pages Function에 접근합니다. 향후 공급자 HTTPS 지원이 확인되면 서버 upstream을 변경할 수 있습니다.

## 학교 검색

키 없이 명시적 검색 버튼으로 OpenStreetMap Nominatim을 사용합니다. 자동완성·일괄 지오코딩을 하지 않으며 하루 동안 캐시합니다. 한국 학교 검색 누락 시 도로명 주소 검색 또는 지도 지정이 가능합니다.

더 많은 사용자를 대상으로 운영하기 전에는 자체 지오코더 또는 계약된 제공자를 사용하는 것이 좋습니다. 선택적으로 `KAKAO_REST_API_KEY` Secret을 등록하면 카카오 장소 검색을 사용하도록 서버가 전환합니다. 이 키도 프런트엔드에 노출하지 않습니다. 공급자 이용약관·쿼터를 확인하세요.

## 배포 연결

Cloudflare Git integration에 `sirlma111216-boop/totalculture`가 연결됩니다. `main` push → `npm run build` → `dist`와 `functions/` 배포. Pages Functions는 Cloudflare가 별도로 컴파일합니다.

## 백업

정보 관리 또는 데이터와 설정 → 전체 백업. JSON 파일에는 장소·보관함·일정 ID와 학교 기준점이 포함됩니다. 현재 브라우저의 개인 정보이므로 본인이 보관하세요. 백업 병합은 ID가 같은 시설을 가져온 내용으로 갱신하고 기존의 다른 시설은 유지합니다.
