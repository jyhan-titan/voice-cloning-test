// 1. Tiptap 기본 마크 타입 (bold, italic 등)
interface TiptapMark {
  type: 'bold' | 'italic' | 'strike' | string;
  attrs?: Record<string, unknown>;
}

// 2. Tiptap 노드 타입 (재귀 구조)
export interface TiptapNode {
  type: 'doc' | 'paragraph' | 'heading' | 'blockquote' | 'text';
  text?: string;
  attrs?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    [key: string]: unknown;
  };
  marks?: TiptapMark[];
  content?: TiptapNode[];
}

// 3. Fish Audio API 요청 파라미터 타입
interface FishAudioProsody {
  speed: number;
  volume: number;
}

interface FishAudioTask {
  text: string;
  prosody: FishAudioProsody;
  format: 'mp3' | 'wav' | 'pcm' | 'opus';
  mp3_bitrate: 64 | 128 | 192;
}

/**
 * 중첩된 노드에서 텍스트를 재귀적으로 추출하는 함수
 */
export const extractTextFromNode = (node: TiptapNode): string => {
  // 1. 순수 텍스트 노드인 경우
  if (node.text) {
    return node.text;
  }

  // 2. 자식 노드가 있는 경우 재귀 호출
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join('');
  }

  return '';
};

/**
 * Tiptap Content 배열을 Fish Audio 전용 객체로 변환
 */
export const transformTiptapToFishAudio = (
  contentArray: TiptapNode[],
): FishAudioTask[] => {
  return contentArray.map((node: TiptapNode): FishAudioTask => {
    const rawText: string = extractTextFromNode(node);

    let processedText: string = rawText;
    let prosody: FishAudioProsody = { speed: 1.0, volume: 0 };

    // 노드 타입별 전략 매칭
    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level || 1;
        if (level === 1) {
          processedText = `${rawText}... `; // 대제목 호흡
          prosody = { speed: 0.8, volume: 3.0 };
        } else {
          processedText = `${rawText}. `;
          prosody = { speed: 0.9, volume: 1.5 };
        }
        break;
      }

      case 'blockquote': {
        processedText = `${rawText}`; // 인용구 호흡
        prosody = { speed: 0.85, volume: -1.0 };
        break;
      }

      case 'paragraph': {
        // 본문 내 특정 마크(bold 등)가 있는지 체크하여 텍스트 강조 처리 (선택 사항)
        const hasBold = node.content?.some(c =>
          c.marks?.some(m => m.type === 'bold'),
        );
        if (hasBold) {
          // 볼드가 포함된 문단은 아주 미세하게 힘을 실음
          prosody = { speed: 0.98, volume: 0.5 };
        }
        break;
      }

      default:
        break;
    }

    return {
      text: processedText,
      prosody,
      format: 'mp3',
      mp3_bitrate: 128,
    };
  });
};

////// 일레븐랩스
// 4. ElevenLabs 전용 파라미터 타입
interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

export interface ElevenLabsTask {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
}

/**
 * Tiptap Content 배열을 ElevenLabs 전용 객체로 변환
 */
export const transformTiptapToElevenLabs = (
  contentArray: TiptapNode[],
): ElevenLabsTask[] => {
  return contentArray.map((node: TiptapNode): ElevenLabsTask => {
    const rawText: string = extractTextFromNode(node);

    // 💡 변수 자체를 재할당하지 않으므로 const로 선언합니다.
    const voiceSettings: ElevenLabsVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
      speed: 1.0,
    };

    let processedText: string = rawText;

    // 객체의 '내부 프로퍼티'를 수정하는 것은 const에서도 허용됩니다.
    switch (node.type) {
      case 'heading': {
        voiceSettings.stability = 0.7; // 정상 작동
        voiceSettings.speed = 0.9; // 정상 작동
        processedText = `${rawText}.`;
        break;
      }

      case 'blockquote': {
        voiceSettings.stability = 0.2;
        voiceSettings.similarity_boost = 0.85;
        processedText = `${rawText}`;
        break;
      }

      case 'paragraph': {
        const hasBold = node.content?.some(c =>
          c.marks?.some(m => m.type === 'bold'),
        );
        if (hasBold) {
          voiceSettings.style = 0.2;
          voiceSettings.stability = 0.4;
        }
        break;
      }
    }

    return {
      text: processedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    };
  });
};
