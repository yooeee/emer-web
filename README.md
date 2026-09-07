# EMER

지역별 응급실과 외상센터의 위치·주소·연락처를 찾는 React / TypeScript / OpenLayers 웹 애플리케이션입니다.

## 화면과 기능

- PC: 검색·병원 목록과 지도를 나란히 배치합니다.
- 태블릿: 화면 폭에 맞춰 검색 패널을 줄이고 지도 영역을 확보합니다.
- 휴대폰: 검색·목록 / 지도 보기 전환, 터치 조작, 하단 상세정보 창을 제공합니다.
- 지역·의료기관 종류·병원 이름 검색, 번호가 연결된 목록·지도, 전화 연결, 주소 복사, 외부 지도 검색을 지원합니다.
- 로딩·빈 결과·통신 실패·위치 권한 거부·지도 오류를 화면에서 안내합니다.
- API를 연결하기 전에는 안내 화면을 표시하며, 임의의 병원이나 실시간 병상 정보를 생성하지 않습니다.

## 실행

기존 Create React App 빌드 체계를 유지합니다. Node.js LTS와 npm으로 실행하세요.

```bash
npm ci
cp .env.example .env.local
npm start
```

로컬 API가 3030 포트에서 실행 중이면 `.env.local`에서 `REACT_APP_API_BASE_URL=http://localhost:3030` 줄의 주석을 해제하세요. 변경 후 개발 서버를 다시 시작합니다.

```bash
npm run build
CI=true npm test -- --watchAll=false --runInBand
npx tsc --noEmit
```

배포 산출물은 `build/`입니다. API 연결 주소는 **빌드할 때** 반영됩니다. GitHub 저장소 수정만으로 실행 중인 서버 파일이 자동 교체되지는 않습니다.

## GitHub Pages 배포

`.github/workflows/deploy-pages.yml`은 `main` 변경 시 TypeScript 검사, 테스트, React 빌드를 거쳐 GitHub Pages에 배포합니다. PR에서는 검사·빌드만 실행합니다.

최초 한 번 [저장소 Pages 설정](https://github.com/yooeee/emer-web/settings/pages)에서 **Build and deployment → Source → GitHub Actions**를 선택하세요. 이후 [배포 작업](https://github.com/yooeee/emer-web/actions/workflows/deploy-pages.yml)의 **Run workflow → main → Run workflow**로 첫 배포를 실행합니다. 그다음부터는 `main`에 반영할 때 자동으로 배포합니다.

이 저장소의 기본 Pages 주소는 `https://yooeee.github.io/emer-web/`입니다. 워크플로는 `PUBLIC_URL=/emer-web`로 빌드하여 JavaScript·CSS·아이콘이 이 하위 경로에서 로드되게 합니다. 로컬 및 EC2 빌드는 기존처럼 `npm run build`로 루트(`/`)에 배포할 수 있습니다.

GitHub Pages는 React 정적 파일을 제공하며 Spring 서버를 실행하지 않습니다. 지도와 화면은 확인할 수 있고, 병원 검색에는 별도 HTTPS API가 필요합니다. 연결할 때는 저장소의 **Settings → Secrets and variables → Actions → Variables**에 `EMER_API_BASE_URL`을 등록하고 다시 배포하세요. 값은 API 출처(예: `https://api.your-domain.example`)이며 `/api`는 코드에서 붙입니다. 해당 Spring 서버의 CORS 허용 출처에는 `https://yooeee.github.io`를 추가합니다. 공공데이터 API 키는 서버에만 설정하세요.

배포 방법은 [GitHub Pages 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 따릅니다.

## API 연결

기본값은 현재 웹사이트와 같은 호스트의 `/api`입니다. Nginx에서 `/api/`를 기존 Spring 서버로 프록시하면 됩니다. 별도 API 도메인을 사용하려면 `REACT_APP_API_BASE_URL`에 출처 주소만 설정하고, Spring에서도 해당 웹 출처의 CORS를 허용하세요.

| 요청               | 파라미터                                        | 응답                                                          |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------- |
| `GET /api/sigungu` | `siCd`                                          | `{ resultCode: 200, result: [{ admCode, lowestAdmCodeNm }] }` |
| `GET /api/search`  | `Q0`, `Q1`, `QN`, `type`, `pageNo`, `numOfRows` | `{ resultCode: 200, result: [...] }`                          |

`Q0`는 시·도 이름이며 필수입니다. `Q1`(시·군·구)과 `QN`(병원 이름)은 비워 전체 지역을 검색할 수 있습니다. `type`은 기존 API의 `getEgytListInfoInqire` 또는 `getStrmListInfoInqire`를 사용합니다. 검색은 최대 999건을 요청하며 화면에는 실제 반환된 건수를 표시합니다.

병원 응답의 `hpid`, `dutyName`, `dutyAddr`, `dutyEmclsName`, `dutyTel1`, `dutyTel3`, `wgs84Lon`, `wgs84Lat`를 사용합니다. 단일 결과 객체와 배열을 모두 지원합니다. 좌표가 없는 의료기관은 목록에 유지하고 지도 표시에서만 제외합니다. 새 검색과 초기화는 이전 요청을 취소합니다.

저장소에는 Spring 프로젝트가 두 개 있습니다. 검색 구현은 `demo/`에 있으며, `main/`의 검색 컨트롤러는 미구현 상태입니다. 이번 화면은 `demo/`의 기존 응답 규격에 연결됩니다. 실제 조회를 위해서는 해당 서버와 공공데이터·VWorld 키 설정이 필요합니다. 키는 서버 환경에서만 관리하고 프런트엔드의 `REACT_APP_*` 변수에 넣지 마세요. 상위 API가 반환하는 실제 데이터와 운영 서버 연결은 별도로 확인해야 합니다.

## Nginx 배포 예시

`build/` 내부 파일을 `/var/www/emer-web/`에 업로드하고 서버 설정에 적용합니다. 포트는 실제 Spring 실행 포트에 맞춥니다.

```nginx
server {
    listen 80;
    server_name your-domain.example;
    root /var/www/emer-web;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

브라우저의 내 위치·주소 자동 복사를 사용하려면 운영 사이트에 HTTPS를 설정하세요. 위치를 허용하지 않아도 지역 검색은 사용할 수 있습니다. 위치는 브라우저 지도 표시 용도로만 사용하며 API에 전송하거나 저장하지 않습니다.

## 지도

기본 지도는 HTTPS OpenStreetMap 타일을 사용합니다. 지도 저작자 표시를 유지하며 타일 미리받기를 사용하지 않습니다. [OpenStreetMap 타일 이용 정책](https://operations.osmfoundation.org/policies/tiles/)을 확인하고, 운영 규모에 맞는 지도 제공자를 선택하세요. 병원·시군구 데이터 조회는 기존 Spring API에서 처리합니다.

## 프런트엔드 구조

| 경로                                 | 역할                                  |
| ------------------------------------ | ------------------------------------- |
| `src/pages/home/`                    | 반응형 화면 구성·스타일               |
| `src/components/`                    | 검색, 목록, 지도, 상세정보, 이용 안내 |
| `src/hooks/useHospitalSearch.ts`     | 검색 상태·요청 취소                   |
| `src/services/hospitalApi.ts`        | API 통신·응답 변환                    |
| `src/types/hospital.ts`              | 의료기관·검색 조건 타입               |
| `src/utils/HospitalMapController.ts` | 지도 표시·선택·위치·이벤트 정리       |
| `src/data/regions.ts`                | 시·도 목록과 지도 중심 좌표           |
