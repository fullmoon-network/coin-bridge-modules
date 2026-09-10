# 모듈 API 계약 (ctx)

모듈은 3개의 named export를 제공해요:

```js
export const meta = { author, version, ephemeral? };
export const command = { name, description, options? };
export async function execute(interaction, ctx);
```

## meta

| 필드 | 타입 | 설명 |
|---|---|---|
| author | string (필수) | 크레딧에 표시돼요 |
| version | string | 세맨틱 버전 |
| ephemeral | boolean | true(기본) = 에페머럴 응답. false면 전체 채널 공개 |

## command

Discord 슬래시 커맨드 JSON의 부분집합이에요:

| 필드 | 타입 | 설명 |
|---|---|---|
| name | string (필수) | 소문자/숫자/-/_ 한글 허용, 1~32자 |
| description | string (필수) | 1~100자 |
| options | array | 슬래시 옵션 (name, description, type, required) |

## execute(interaction, ctx)

모듈의 핵심 로직이에요. `ctx`는 봇이 제공하는 안전한 기능 모음이에요:

| ctx 필드 | 설명 |
|---|---|
| ctx.user | { id, username, displayName } 스냅샷 |
| ctx.option.getString(name, required?) | 슬래시 옵션 문자열 조회 |
| ctx.option.getInteger(name, required?) | 정수 옵션 조회 |
| ctx.option.getBoolean(name, required?) | 불리언 옵션 조회 |
| ctx.reply(payload) | deferred reply를 edit해요. string 또는 { embeds: [...] } |
| ctx.log(...args) | `[모듈:이름]` 프리픽스로 콘솔 로그 |

로더는 execute 전에 `deferReply`를 호출해요. 그래서 `ctx.reply`는 항상
`editReply`예요 — 3초 타임아웃 race가 없어요.

## 금지 사항

- `eval`, `new Function`, 동적 `import(변수)`
- `child_process`, `fetch`(외부 네트워크), `process.env` 접근
- 난독화, minified 코드, 500줄 초과 파일
- 원장 쓰기 (잔액 지급/차감 — 읽기 전용 API로 조회만 가능)
