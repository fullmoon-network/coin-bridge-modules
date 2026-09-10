# 모듈 API 계약 (ctx)

모듈은 3개의 필수 named export를 제공하고, 선택 훅 2개를 더 쓸 수 있어요:

```js
export const meta = { author, version, ephemeral? };
export const command = { name, description, options? };
export async function execute(interaction, ctx);
// 선택:
export async function onButton(interaction, ctx);          // 이 모듈 버튼 클릭 처리
export const schedules = [{ everyMinutes, run(tools) }];   // 타이머 (모듈당 최대 2개)
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
| ctx.componentId(action) | 이 모듈 전용 버튼 customId 생성 — `cm:커맨드이름:action` |
| ctx.economy | 원장 **읽기 전용** 헬퍼 모음 (아래 표) |

로더는 execute 전에 `deferReply`를 호출해요. 그래서 `ctx.reply`는 항상
`editReply`예요 — 3초 타임아웃 race가 없어요.

### ctx.economy (원장 읽기 전용)

economy-api가 서빙하는 것과 **동일한 감사된 SELECT 쿼리**예요. 쓰기 경로가
존재하지 않고, pool이나 db 모듈은 노출되지 않아요. 계정 id를 생략하면
커맨드를 호출한 유저가 기본값이에요. 범위 밖 limit·days와 무효한 before
커서는 에러가 아니라 경계값(첫 페이지)으로 조정돼요 — 에러를 던지는 건
숫자가 아닌 discordId뿐이에요. execute는 try/catch로 감싸 주세요.

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

### 버튼 (onButton)

모듈이 보낸 응답에 버튼을 달면, 클릭이 `onButton`으로 돌아와요:

```js
export async function execute(interaction, ctx) {
  await ctx.reply({
    content: '골드를 던졌어요!',
    components: [{ type: 1, components: [{
      type: 2, style: 1,
      customId: ctx.componentId('다시'),   // 반드시 ctx.componentId로 생성
      label: '한 번 더',
    }] }],
  });
}

export async function onButton(interaction, ctx) {
  // interaction.customId는 'cm:커맨드이름:다시' — action 부분만 자르면 돼요.
  const action = interaction.customId.split(':')[2];
  await interaction.update({ content: `다시 던져서 ${roll()}이 나왔어요!` });
}
```

- customId는 **반드시 `ctx.componentId()`로** 만들어요. 다른 접두사를 흉내
  내면 거절 대상이에요.
- 3초 안에 `interaction.update()`/`reply()`/`deferUpdate()` 중 하나를
  호출해야 해요 (execute와 달리 로더가 대신 defer하지 않아요).
- 모듈이 비활성화된 뒤 남은 버튼은 “더 이상 활성 모듈에 연결되어 있지 않아요”
  에페머럴로 응답돼요.

### 스케줄 (schedules)

봇이 살아 있는 동안 주기적으로 도는 타이머예요. 재시작하면 다시 시작돼요:

```js
export const schedules = [{
  everyMinutes: 30,
  run: async (tools) => {
    const top = await tools.economy.leaderboard(3);
    await tools.send('채널ID', `현재 1위: ${top[0]?.mcUsername ?? '없음'}`);
  },
}];
```

- 모듈당 최대 2개, 전체 합계 16개 상한. `everyMinutes`는 5 이상의 정수.
- `tools.send`는 텍스트 채널 전용이고, 멘션은 **유저 멘션만** 허용돼요 —
  @everyone/역할 멘션은 봇이 걸러요. 내용은 2000자로 잘려요.
- 실행 오류는 로그로 남고 봇은 계속 돌아가요.
- 모듈 파일을 고치면 봇이 자동으로 다시 로드해요(핫리로드) — 타이머도 새로
  구성돼요.

## 금지 사항

- `eval`, `new Function`, 동적 `import(변수)`
- `child_process`, `fetch`(외부 네트워크), `process.env` 접근
- 난독화, minified 코드, 500줄 초과 파일
- 원장 쓰기 (잔액 지급/차감 — 읽기 전용 API로 조회만 가능)
