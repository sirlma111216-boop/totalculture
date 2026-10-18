# 학교밖 아틀라스

학교 주변의 공연·영화, 미술·전시, 박물관·역사, 체육·야외, 교육·체험, 공간·대관을 지도에서 발견하고 비교·계획하는 실제 업무용 웹앱입니다.

## 실행

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite 개발 서버는 화면을 제공합니다. 서버 API까지 로컬 검증하려면 빌드 후 `npm run pages:dev`를 사용합니다. `.dev.vars`에 `SEOUL_API_KEY`를 등록할 수 있으며 이 파일은 Git에 포함되지 않습니다.

## 배포

- GitHub: https://github.com/sirlma111216-boop/totalculture
- Cloudflare Pages 프로젝트: `totalculture`
- Production branch: `main`
- Build command: `npm run build`
- Output: `dist`
- `main`에 push하면 Cloudflare Git integration이 자동 배포합니다. GitHub Actions는 별도로 테스트·빌드를 검증합니다. Actions 성공이 Pages 배포의 선행 조건은 아닙니다.
- 환경변수 설정은 [docs/SETUP.md](docs/SETUP.md)를 참고하세요.

## 구현 범위

지도 중심 탐색, 학교명·주소 검색/지도 지정, 1~50km 반경, 분야별 마커·범례·군집, 조건 검색, 목록 보기, 보관함, 최대 4개 후보 비교, 일정 순서·방문 시간·예상 비용·인쇄, 시설 추가·수정, 상태 확인 근거·이력, JSON 백업 병합, 교육 지원·할인·협약 이력.

초기 공식 공개 안내 조사 19개 시설/3개 기회. 서울 전체 시설 목록을 의미하지 않습니다. 서울시 인증키 연결 후 문화행사와 공공예약 자료를 추가합니다. 실시간 잔여석·학교 단체 수용 가능은 원자료로 보장하지 않습니다. 가격 미확인은 무료로 취급하지 않습니다.

현재 저장 방식은 브라우저 localStorage입니다. 개인 수정 사항은 서버/GitHub에 전송되지 않으며 기기 간 자동 동기화되지 않습니다. 다른 교사와 공동 편집하는 기능은 아직 없습니다. 공동 아카이브 확장 설계는 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)에 있습니다.

## 이미지와 출처

- 이미지 생성: 내장 image_gen (사용자가 요청한 이미지 기반 디자인).
- [메인 화면 설계](public/assets/design-board.png), [보조 화면 설계](public/assets/design-board-secondary.png)
- [문화도시 마스트헤드](public/assets/culture-city.png), [6분야 일러스트 아틀라스](public/assets/category-atlas.png)
- 이미지 갤러리: `/image-gallery.html`
- 생성 이미지 안의 예시 전화·가격·시설 정보는 디자인용 가상 표현이며 앱 데이터로 사용하지 않습니다.
- 실제 초기 데이터 및 조사 근거: [data/research.json](data/research.json), [조사 메모](data/RESEARCH-NOTES.md)
- 공공자료: 서울특별시 서울 열린데이터광장. 공공누리 1유형 출처표시.
- 지도: © OpenStreetMap contributors. 지도와 타일은 이미지 생성 결과가 아닙니다.

## 검증

`npm test`: 반경·중복·복원 검증·미확인 비용·문화행사 좌표/연락처·예약 종료일·자료 근거.
`npm run build`: TypeScript 검증 + Vite 프로덕션 빌드.
브라우저에서 필터, 상세, 보관, 일정 담기, 시설 추가를 검증합니다.
