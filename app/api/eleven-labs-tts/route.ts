// import { ElevenLabsTask } from '@/src/utils/voice';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { tasks, voiceId } = await req.json(); // transformTiptapToElevenLabs의 결과물 배열

//     // 1. 모든 문단을 병렬로 요청 (속도 향상)
//     const audioPromises = tasks.map(async (task: ElevenLabsTask) => {
//       const res = await fetch(
//         `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'xi-api-key': process.env.ELEVENLABS_API_KEY!,
//           },
//           body: JSON.stringify(task),
//         }
//       );
//       console.log("🚀 ~ POST ~ res:", res)

//       if (!res.ok) throw new Error("문단 생성 실패");
      
//       // Response를 ArrayBuffer로 변환하여 반환
//       return await res.arrayBuffer();
//     });

//     // 2. 모든 요청이 끝날 때까지 대기 (순서 보장됨)
//     const buffers = await Promise.all(audioPromises);

//     // 3. Node.js Buffer를 사용해 모든 조각을 하나로 합침
//     // MP3 포맷은 바이너리를 단순히 붙여도 재생이 가능합니다.
//     const combinedBuffer = Buffer.concat(buffers.map(ab => Buffer.from(ab)));

//     // 4. 합쳐진 하나의 MP3 파일을 클라이언트에 전송
//     return new NextResponse(combinedBuffer, {
//       headers: {
//         'Content-Type': 'audio/mpeg',
//         'Content-Length': combinedBuffer.length.toString(),
//       },
//     });

//   } catch (error: unknown) {
//     console.error(error);
//     return NextResponse.json({ error: (error as Error).message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
        const { voiceId, ...task } = await req.json(); // transformTiptapToElevenLabs의 결과물 배열
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing ELEVENLABS_API_KEY' },
        { status: 500 }
      );
    }


    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        ...task,
        outputFormat: "mp3_44100_128",
        modelId: "eleven_multilingual_v2",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('TTS 서버 에러:', error);
    return NextResponse.json({ error: '서버 에러 발생' }, { status: 500 });
  }
}
