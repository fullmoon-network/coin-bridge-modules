// 데모 모듈 — /운세: 날짜+유저 기반 결정적 운세.
// 같은 날 같은 유저면 항상 같은 결과 (Math.random 대신 해시 기반).
// 실행 경계: 이 모듈은 봇 안에서 응답만 하고, 원장을 읽거나 쓰지 않아요.

export const meta = {
  author: 'personnya',
  version: '1.0.0',
};

export const command = {
  name: '운세',
  description: '오늘의 운세를 봐요 (하루에 한 번, 매일 바뀌어요)',
  options: [],
};

function hash(str) {
  let h = 0;
  for (const ch of str) {
    h = (h * 31 + ch.codePointAt(0)) | 0;
  }
  return Math.abs(h);
}

const FORTUNES = [
  '오늘은 뭐든 잘 풀리는 날! 큰 결정도 좋아요.',
  '무리하지 마세요. 쉬는 것도 실력이에요.',
  '뜻밖의 소식이 올 수 있어요! 놀라지 마세요.',
  '돈이 나갈 수 있어요. 지갑 단속 필수!',
  '오늘의 행운 아이템: 주머니 속 오래된 사탕.',
  '누군가 당신을 생각하고 있어요. 연락받으세요.',
  '기분 나쁜 일이 있어도 저녁엔 다 잊혀져요.',
  '미뤄둔 일을 처리하기 좋은 날. 5분만 시작해 보세요.',
  '함께하는 사람과 협심하면 두 배의 성과가 있어요.',
  '직감이 맞는 날. 첫 느낌을 믿어 보세요.',
];

export async function execute(interaction, ctx) {
  const today = new Date().toISOString().slice(0, 10);
  const seed = hash(ctx.user.id + today);
  const fortune = FORTUNES[seed % FORTUNES.length];
  await ctx.reply(`🔮 **${ctx.user.displayName}님의 ${today} 운세**\n${fortune}`);
}
