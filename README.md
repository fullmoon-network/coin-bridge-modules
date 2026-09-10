# Fullmoon Bot Modules — 커뮤니티 커맨드 모듈

풀문 디스코드 봇에 슬래시 커맨드를 **직접 붙이는** 커뮤니티 기여 리포예요.
운영자가 코드를 줄단위로 리뷰하고 머지하면, 다음 배포 때 봇이 당신의
커맨드를 실제로 실행해요.

## 어떻게 기여하나요

1. [template/module.template.mjs](./template/module.template.mjs)를 복사해서
   커맨드를 만드세요.
2. `modules/`에 `<이름>.mjs`로 저장하고 PR을 보내세요.
3. 운영자가 코드를 줄단위로 리뷰해요 (REVIEW.md 참고).
4. 머지되면 다음 봇 배포 때 커맨드가 디스코드에 등록돼요.

git 없이 [이슈](https://github.com/Fullmoon-OSS/coin-bridge-modules/issues/new)로
아이디어만 제안하는 것도 환영이에요.

## 보안 (중요)

모듈은 **봇 프로세스 안에서 실행**돼요. 운영자의 줄단위 리뷰가 유일한 보안
경계예요. 그래서:

- 모듈은 **한 파일, 짧게** 유지해 주세요.
- 금지: `eval`, `child_process`, `fetch`(외부 호출), `process.env` 접근,
  난독화, 동적 `import()`
- 허용: `discord.js`, `node:` 빌트인 (crypto, path 등)
- 경제 **쓰기**는 커뮤니티 모듈에서 불가능해요 (읽기 전용 API만 제공).

자세한 ctx 계약: [MODULE_API.md](./MODULE_API.md)

## 라이선스

MIT
