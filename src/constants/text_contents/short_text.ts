import { TiptapNode } from '@/src/utils/voice';

export const SHORT_TEXT: TiptapNode[] = [
  {
    type: 'heading',
    attrs: { level: 1 },
    content: [
      {
        type: 'text',
        text: '테스트: tts API 테스트',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '한번의 api만 호출하기 위한 테스트용 문장입니다!',
      },
    ],
  },
];
