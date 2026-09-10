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
| name | string (필수) | 소문자/숫자/-/_ 한글 허용, 1~32자. 대문자는 라틴 포함 모든 문자(키릴·그리스 등) 불가 |
| description | string (필수) | 1~100자 |
| options | array | 최대 25개. 아래 옵션 형식 참고 |

### options

```js
options: [{ name, description, type, required?, choices? }]
```

| 필드 | 설명 |
|---|---|
| name | 커맨드 이름과 동일한 규칙 (소문자/숫자/한글 1~32자), 중복 불가 |
| description | 1~100자 |
| type | 문자열 이름 권장: `string` `integer` `boolean` `user` `channel` `role` `mentionable` `number` `attachment` (Discord 숫자 3~11도 허용) |
| required | 필수 옵션은 선택 옵션보다 앞에 와야 해요 (Discord 규칙) |
| choices | `string`/`integer`/`number` 타입에만. 최대 25개의 `{ name, value }`, value는 타입과 일치 |

계약을 벗어난 모듈은 봇이 로드를 건너뛰어요. 등록은 all-or-nothing이라
잘못된 값 하나가 내장 커맨드까지 포함한 전체 등록을 깨뜨리지 않게 하려는
안전장치예요.

## execute(interaction, ctx)

모듈의 핵심 로직이에요. `ctx`는 봇이 제공하는 안전한 기능 모음이에요:

| ctx 필드 | 설명 |
|---|---|
| ctx.user | { id, username, displayName } 스냅샷. displayName은 서버 닉네임 우선, 없으면 글로벌 표시명 |
| ctx.option.getString(name, required?) | 슬래시 옵션 문자열 조회 |
| ctx.option.getInteger(name, required?) | 정수 옵션 조회 |
| ctx.option.getBoolean(name, required?) | 불리언 옵션 조회 |
| ctx.reply(payload) | deferred reply를 edit해요. string 또는 { embeds: [...] } |
| ctx.log(...args) | `[모듈:이름]` 프리픽스로 콘솔 로그 |
| ctx.economy | 원장 **읽기 전용** 헬퍼 모음 (아래 표) |

로더는 execute 전에 `deferReply`를 호출해요. 그래서 `ctx.reply`는 항상
`editReply`예요 — 3초 타임아웃 race가 없어요.

### ctx.economy (원장 읽기 전용)

economy-api가 서빙하는 것과 **동일한 감사된 SELECT 쿼리**예요. 쓰기 경로가
존재하지 않고, pool이나 db 모듈은 노출되지 않아요. 계정 id를 생략하면
커맨드를 호출한 유저가 기본값이에요. 잘못된 인자(빈도 범위 밖 limit, 숫자가
아닌 id)는 에러를 던져요 — execute를 try/catch로 감싸 주세요.

| 메서드 | 반환 | 설명 |
|---|---|---|
| ctx.economy.wallet(discordId?) | { discordId, balance, linked, mcUsername, rank } \| null | 지갑 + 서버 순위 |
| ctx.economy.transactions(discordId?, { limit?, before? }) | { transactions, nextBefore } | 최신순 거래 페이지 (limit 1~50, 기본 10) |
| ctx.economy.leaderboard(limit?) | [{ rank, discordId, mcUsername, balance }] | 잔액 상위권 (1~50, 기본 10) |
| ctx.economy.events() | [{ name, kind, multiplier, startsAt, endsAt }] | 진행 중인 이벤트 (최대 25개) |
| ctx.economy.guilds() | [{ name, fund, members }] | 기금 순 길드 목록 (최대 25개) |
| ctx.economy.casinoToday() | [{ game, wagered, paidOut, netBurn }] | 오늘(UTC) 게임별 집계 |
| ctx.economy.casinoHistory(days?) | [{ date, wagered, paidOut, netBurn }] | 일별 집계 (1~90일, 기본 30) |

예시 — `/잔액표` 같은 커맨드가 한 줄로 완성돼요:

```js
export async function execute(interaction, ctx) {
  const w = await ctx.economy.wallet();
  if (!w) return ctx.reply('먼저 /연동코드로 계정을 만들어 주세요.');
  await ctx.reply(`**${ctx.user.displayName}님** — ${w.balance.toLocaleString('ko-KR')}원 (서버 ${w.rank ?? '-'}위)`);
}
```

## 금지 사항

- `eval`, `new Function`, 동적 `import(변수)`
- `child_process`, `fetch`(외부 네트워크), `process.env` 접근
- 난독화, minified 코드, 500줄 초과 파일
- 원장 쓰기 (잔액 지급/차감 — 읽기 전용 API로 조회만 가능)
