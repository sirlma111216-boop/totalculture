# 학교 기준 교통안내와 놀이공원

2026-10-18 추가.

## 교통안내

학교·선택 시설의 좌표로 외부 길찾기 URL을 만들며 학교 변경을 즉시 반영한다. 복귀 경로는 출발·도착을 역전한다. Google 지도는 `travelmode=transit`, 카카오맵은 공식 웹 출발/도착 링크를 사용한다. 카카오맵에서는 대중교통 탭 선택이 필요함을 UI에 표시한다. API 키나 외부 경로 자동 조회는 사용하지 않는다. 자체 환승 지도·소요시간·버스 번호를 생성하지 않는다.

- https://developers.google.com/maps/documentation/urls/get-started
- https://apis.map.kakao.com/web/guide/

## 놀이공원

롯데월드 잠실, 에버랜드, 서울랜드를 교육·체험 분류 및 놀이공원 태그로 등록했다. 일반 공원·소풍 분류와 구분한다. 에버랜드와 서울랜드는 서울 밖 필터에 표시한다. 학교별 견적 가격은 미확인으로 두고 학생단체 공식 조건을 소개에 기록했다.

각 항목의 sourceUrl 외 연락처·위치 교차 확인:

- 롯데월드 대표 고객센터: https://adventure.lotteworld.com/price/benefit/view?bnftSeq=3463
- 에버랜드 학생단체 031-320-8600: https://grp.everland.com/everedu/pick/pc/index.html
- 에버랜드 주소: https://reservation.everland.com/web/main.do?method=index
- 서울랜드 학생단체 인솔자 조건: https://seoulland.co.kr/?p=25_receipt
- 서울랜드 교통: https://seoulland.co.kr/?p=35
