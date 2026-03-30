import { TiptapNode } from "@/src/utils/voice";

export const NEWS_TEXT: TiptapNode[] = [
  {
    "type": "heading",
    "attrs": { "level": 1 },
    "content": [{ "type": "text", "text": "경제 리포트: 인공지능이 바꾸는 우리의 일상과 내일" }]
  },
  {
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "최근 전 세계 경제의 가장 뜨거운 화두는 단연 인공지능 기술의 상용화입니다. 단순한 기술적 진보를 넘어, 이제 AI는 우리 삶의 방식 자체를 근본적으로 재편하고 있습니다. 전문가들은 이를 두고 '제4차 산업혁명의 실질적 완성'이라 평가하기도 합니다." }
    ]
  },
  {
    "type": "heading",
    "attrs": { "level": 2 },
    "content": [{ "type": "text", "text": "생산성의 혁명인가, 일자리의 위기인가" }]
  },
  {
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "과거의 자동화가 반복적인 육체노동을 대신했다면, 현재의 AI는 인간 고유의 영역이라 여겨졌던 창의성과 판단의 영역까지 발을 들이고 있습니다. " },
      { "type": "text", "marks": [{ "type": "bold" }], "text": "골드만삭스의 최근 보고서에 따르면," },
      { "type": "text", "text": " 생성형 AI의 도입으로 인해 전 세계 일자리의 약 18%가 자동화의 영향권에 들어설 것으로 전망됩니다." }
    ]
  },
  {
    "type": "blockquote",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "\"기술은 도구일 뿐이며, 그 도구를 어떻게 정의하고 활용하느냐에 따라 미래의 가치는 결정된다.\"" }]
      }
    ]
  },
  {
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "결론적으로 우리는 기술과의 공존을 준비해야 합니다. 새로운 시대의 문턱에서 우리가 갖춰야 할 태도는 막연한 두려움이 아닌, 변화의 파도를 타고 넘는 유연한 적응력일 것입니다. 이상 경제 브리핑이었습니다." }
    ]
  }
];