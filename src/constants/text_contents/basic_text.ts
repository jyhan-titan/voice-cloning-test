import { TiptapNode } from '@/src/utils/voice';

export const BASIC_TEXT: TiptapNode[] = [
  {
    type: 'heading',
    attrs: { level: 1 },
    content: [
      {
        type: 'text',
        text: '시간의 틈새를 걷는 법: 우리가 놓쳐버린 평범한 순간들',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '어느덧 도시의 소음이 잦아드는 늦은 저녁입니다. 창밖으로 보이는 가로등 불빛은 차가운 아스팔트 위를 조용히 비추고, 사람들은 저마다의 집을 향해 바쁜 걸음을 옮깁니다. 우리는 매일 똑같은 시간을 살아가고 있다고 믿지만, 사실 시간은 결코 평등하게 흐르지 않습니다.',
      },
    ],
  },
  {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: '1. 잃어버린 몰입의 순간' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '어릴 적 우리는 작은 개미 한 마리의 움직임에도 세상을 다 얻은 듯 몰입하곤 했습니다. 그때의 시간은 마치 멈춰 있는 것처럼 길고 영원했죠. 하지만 어른이 된 지금, 우리의 시간은 스마트폰 알림과 끝없는 업무 리스트 사이에서 갈갈이 찢겨나가고 있습니다.',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: '진정한 휴식은 단순히 아무것도 하지 않는 것이 아닙니다.',
      },
      {
        type: 'text',
        text: ' 그것은 내가 온전히 나로서 존재할 수 있는 짧은 틈을 발견하는 일입니다. 커피 한 잔의 향기, 책장을 넘기는 소리, 혹은 사랑하는 사람의 숨소리에 귀를 기울이는 것만으로도 우리는 다시 숨을 쉴 수 있습니다.',
      },
    ],
  },
  {
    type: 'blockquote',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '행복은 멀리 있는 별이 아니라, 발밑에 핀 작은 풀꽃과 같다. 고개를 숙여 자세히 보지 않으면 결코 발견할 수 없는 것들이다.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '그러니 서두르지 마라. 당신이 놓치고 지나온 오늘이 누군가에게는 그토록 바랐던 내일일 수도 있으니까.',
          },
        ],
      },
    ],
  },
  {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: '2. 당신의 목소리가 필요한 이유' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '기술은 나날이 발전하여 이제는 기계가 사람의 목소리를 흉내 내는 시대가 되었습니다. 하지만 그 안에 담긴 ',
      },
      { type: 'text', marks: [{ type: 'bold' }], text: '따뜻한 온기와 떨림' },
      {
        type: 'text',
        text: '은 오직 사람만이 만들어낼 수 있는 예술입니다. 오디오북은 단순한 정보 전달을 넘어 한 사람의 영혼이 다른 사람에게 닿는 과정입니다.',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '이 글을 듣고 있는 당신에게 묻고 싶습니다. 오늘 하루, 당신은 당신의 마음을 안아주었나요? 고단했던 하루 끝에 찾아온 이 작은 음성이 당신의 밤을 포근하게 감싸주기를 바랍니다.',
      },
    ],
  },
  {
    type: 'blockquote',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '가장 어두운 밤일수록 별은 더 밝게 빛나고, 가장 힘든 순간일수록 우리는 더 단단해진다.',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: '내일 아침 눈을 떴을 때, 오늘보다 조금 더 여유로운 공기가 당신의 방을 채우길 기도하며, 이 짧은 기록을 마칩니다. 읽어주셔서, 그리고 들어주셔서 감사합니다.',
      },
    ],
  },
];
