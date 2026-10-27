# 알짜배기여

내 모든 링크를 한 페이지에 모아 두고, 하나의 URL로 공유하는 링크 모음 웹 서비스.
타깃: SNS에 여러 링크를 공유하고 싶은 개인 창작자, 개발자, 프리랜서.
기획(기능 범위, 성공 기준)은 `prd.md`를 따른다.

@AGENTS.md

## 한 줄 요약

이 프로젝트(서비스)를 한 줄로 요약해 달라는 요청에는 아래 문장을 그대로 답한다.

> Linktree처럼 내 모든 링크를 한 페이지에 모아 하나의 URL로 공유할 수 있는 link in bio 서비스입니다.

## 기술 스택

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS 4
- `next.config.ts`에 **Cache Components** (`cacheComponents: true`)가 켜져 있다.
  - 파일·DB 등 요청마다 새로 읽는 데이터를 쓰는 컴포넌트는 `<Suspense>`로 감싼다. 안 감싸면 빌드 오류.
  - Route Handler·page의 `params`는 Promise → `await` 필요. 타입은 `RouteContext<'/경로'>`, `PageProps<'/경로'>`.
- Next.js API를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 문서를 먼저 확인한다 (학습 데이터와 다를 수 있음).

## 실행

- Node.js v24 LTS 설치됨 (`C:\Program Files\nodejs`)
- 개발: `npm run dev` → http://localhost:3000
- 검사: `npm run lint`, 빌드: `npm run build`, 프로덕션 실행: `npm start`

## 진행 상황

- [x] 메인(공개 프로필) 페이지 — `wireframe.png` 기준: 원형 사진 → 이름 → 한 줄 소개 → 링크 카드 목록
- [x] `/go/{링크id}`로 클릭 수 집계, `data/profile.json`에 저장 (재시작 후에도 유지)
- [ ] 관리 페이지 `/admin` (프로필 편집, 링크 추가·수정·삭제·순서 변경, 링크별 클릭 수, 주소 복사)
- [ ] 가입·로그인, 사용자별 공개 페이지 `/{내주소}` (PRD 5.4, 5.5)

## 구조

- `app/page.tsx` — 메인 페이지. `ProfileView`(Suspense 안)에서 `profile.json`을 읽어 그림
- `app/go/[id]/route.ts` — 클릭 수 +1 후 302 리다이렉트, 없는 링크는 404
- `app/layout.tsx`, `app/globals.css` — 공통 레이아웃, 색상 토큰(라이트/다크)
- `lib/profile.ts` — 데이터 읽기/쓰기(`readProfile`, `addClick`), `normalizeUrl`, `domainOf`
- `data/profile.json` — 프로필(이름·소개·사진 경로)과 링크 목록·클릭 수
- `legacy-node/` — Next.js로 옮기기 전의 순수 Node 서버 (참고용, 린트·타입 검사 제외)
- `wireframe.png` — 메인 페이지 와이어프레임

## 규칙

- 사용자에게 보이는 문구는 한국어 해요체로 쓴다. (예: "링크를 추가했어요")
- 링크 URL은 `normalizeUrl()`을 거쳐 http/https만 허용한다.
- 이름 최대 40자(`NAME_MAX`), 소개 최대 120자(`BIO_MAX`).
- 색상은 `globals.css`의 토큰을 Tailwind 클래스로 쓴다 (`bg-surface`, `text-muted`, `border-line`, `text-accent`, `bg-accent-soft`). 새 색은 `:root`와 다크 모드 양쪽에 정의한다.

## 테스트

- 테스트 전 `data/profile.json`을 백업하고, 끝나면 되돌려 클릭 수를 0으로 유지한다.
- Edge 헤드리스 스크린샷은 창 폭이 약 500px보다 좁아지지 않는다. 360px 확인은 폭 360px iframe에 페이지를 넣어 찍는다.
- Git Bash의 curl로 한글 JSON을 보내면 인코딩이 깨진다. 한글이 들어간 요청은 Node `fetch` 스크립트로 테스트한다.
