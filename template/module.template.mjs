// 커뮤니티 모듈 템플릿 — 이 파일을 복사해서 시작하세요.
// 계약: MODULE_API.md 참고. 리뷰 기준: REVIEW.md 참고.

export const meta = {
  author: '핸들',           // 카탈로그 표시용
  version: '1.0.0',
  // ephemeral: false,      // 주석 해제하면 전체 채널 공개 응답
};

export const command = {
  name: '내커맨드',          // 소문자/한글/숫자/-/_ 1~32자
  description: '커맨드 설명 (1~100자)',
  options: [
    // {
    //   name: '대상',
    //   description: '대상 설명',
    //   type: 3,             // 3=STRING, 4=INTEGER, 5=BOOLEAN
    //   required: true,
    // },
  ],
};

export async function execute(interaction, ctx) {
  // ctx.user.displayName — 실행한 사용자의 표시명
  // ctx.option.getString('대상') — 옵션 값
  // ctx.reply('메시지') — 응답 전송 (deferred edit)
  await ctx.reply(`${ctx.user.displayName}님, 안녕하세요!`);
}
