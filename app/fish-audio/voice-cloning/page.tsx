'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// import { extractTextFromNode, TiptapNode } from '@/utils/voice'; // Tiptap 유틸 (사용자 데이터용)

// --- 더미 스크립트 (녹음 중 보여줄 내용) ---
const RECORDING_SCRIPT = "Here, you can enjoy the boundless scenery of the grasslands and feel the passion and excitement of galloping horses. Let's step into this passionate place together!";

// --- 유틸 함수: 초(second)를 분:초(MM:SS) 형식으로 변환 ---
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// --- 유틸 함수: 바이트(Byte)를 용량 단위(KB, MB)로 변환 ---
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// --- 오디오 파일의 실제 길이를 측정하는 유틸 함수 ---
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };
  });
};

// --- 등록된 오디오 아이템 타입 정의 ---
interface AudioItem {
  id: string;
  file: File;
  duration: number; // 초 단위
  size: number; // 바이트 단위
  previewUrl: string | null;
}

export default function VoiceCloningPage() {
  const router = useRouter();
  const [modelTitle, setModelTitle] = useState("my voice cloning");
  const [step, setStep] = useState<1 | 2>(1);
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [modelDescription, setModelDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlist' | 'private'>('private');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [agree, setAgree] = useState(false);
  const [showAllQualityTags, setShowAllQualityTags] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>('/microphone.jpg');
  const [coverPreviewIsObjectUrl, setCoverPreviewIsObjectUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const presetTags = useMemo(
    () => ({
      gender: ['남성', '여성'],
      age: ['젊은', '중년', '이전'],
      use: ['내레이션', '교육용', '광고', '대화형', '소셜 미디어', '엔터테인먼트'],
      quality: [
        '중간',
        '부드러운',
        '차분한',
        '측정됨',
        '전문가',
        '자신감 있는',
        '종립적인 어조',
        '스토리텔링',
        '감정 표현이 풍부한',
        '거친 목소리',
        '게이밍',
        '공감하는',
        '교사',
        '권위 있는',
        '깊은',
        '낮음',
        '높음',
        '느림',
        '다큐멘터리',
        '단조로운',
        '동적',
        '드라마틱',
        '따뜻한',
        '라디오',
        '명랑한',
        '밝은',
        '빠름',
        '서술적',
        '선명한',
        '섹시한',
        '소프트',
        '숨결 섞인',
        '슬픈',
        '시네마틱',
        '신비로운',
        '아나운서',
        '애니메이션',
        '어두운',
        '열정적인',
        '장난기 있는',
        '진지한',
        '친근한',
        '친밀한',
        '캐릭터',
        '코치',
        '팟캐스트',
        '편안한',
        '헤드셋',
        '호스트',
        '화난',
        '활기찬',
      ],
    }),
    []
  );

  const previewTags = useMemo(() => tags.slice(0, 6), [tags]);
  const extraTagCount = Math.max(0, tags.length - previewTags.length);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioItemIdRef = useRef<string | null>(null);

  // --- 녹음 관련 상태 및 Ref ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // 녹음 진행 시간(초)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 녹음 타이머 관리
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
        currentAudioItemIdRef.current = null;
      }
      setPlayingItemId(null);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl && coverPreviewIsObjectUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl, coverPreviewIsObjectUrl]);

  const uniqTags = useCallback((list: string[]) => {
    return Array.from(new Set(list.map(t => t.trim()).filter(Boolean)));
  }, []);

  const addTag = useCallback((t: string) => {
    setTags(prev => uniqTags([...prev, t]));
  }, [uniqTags]);

  const toggleTag = useCallback((t: string) => {
    setTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : uniqTags([...prev, t])));
  }, [uniqTags]);

  const removeTag = useCallback((t: string) => {
    setTags(prev => prev.filter(x => x !== t));
  }, []);

  const stopCurrentPreview = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      currentAudioItemIdRef.current = null;
    }
    setPlayingItemId(null);
  }, []);

  const playPreview = useCallback((item: AudioItem) => {
    if (!item.previewUrl) return;

    if (currentAudioItemIdRef.current && currentAudioItemIdRef.current !== item.id) {
      stopCurrentPreview();
    }

    if (currentAudioItemIdRef.current === item.id && currentAudioRef.current) {
      stopCurrentPreview();
      return;
    }

    const audio = new Audio(item.previewUrl);
    currentAudioRef.current = audio;
    currentAudioItemIdRef.current = item.id;
    setPlayingItemId(item.id);
    audio.onended = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        currentAudioItemIdRef.current = null;
        setPlayingItemId(null);
      }
    };
    void audio.play();
  }, [stopCurrentPreview]);

  // --- 오디오 검증 및 추가 로직 ---
  const validateAndAddAudio = useCallback(async (file: File) => {
    const duration = await getAudioDuration(file);

    // 조건 1: 개별 파일 최소 10초
    if (duration < 10) {
      alert(`오디오가 너무 짧습니다 (${duration.toFixed(1)}s). 최소 10초는 필요합니다!`);
      return;
    }

    // 조건 2: 총합 최대 210초 체크
    const currentTotalDuration = audioList.reduce((acc, curr) => acc + curr.duration, 0);
    if (currentTotalDuration + duration > 210) {
      alert("총 한도(210초)를 넘을 수 없습니다.");
      return;
    }

    const newAudioItem: AudioItem = {
      id: `audio_${Date.now()}`,
      file: file,
      duration: duration,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    };

    setAudioList(prev => [...prev, newAudioItem]);
  }, [audioList]);

  // --- 마이크 녹음 시작/중단 로직 ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
        await validateAndAddAudio(recordedFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      alert("마이크 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const goToDetailsStep = () => {
    const totalDuration = audioList.reduce((acc, curr) => acc + curr.duration, 0);
    if (audioList.length === 0 || totalDuration < 10) {
      alert('오디오 10초만 필요합니다!');
      return;
    }
    setStep(2);
  };

  const createModel = async () => {
    setSaveError(null);

    const totalDuration = audioList.reduce((acc, curr) => acc + curr.duration, 0);
    if (audioList.length === 0 || totalDuration < 10) {
      setSaveError('오디오 10초만 필요합니다!');
      return;
    }

    if (!agree) {
      setSaveError('필수 항목에 동의해야 합니다.');
      return;
    }

    if (!modelTitle.trim()) {
      setSaveError('이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      audioList.forEach(item => {
        formData.append('files', item.file);
      });
      formData.append('title', modelTitle.trim());
      formData.append('description', modelDescription.trim());
      formData.append('visibility', visibility);
      uniqTags(tags).forEach(t => formData.append('tags', t));
      formData.append('enhance_audio_quality', 'true');
      if (coverFile) formData.append('cover_image', coverFile);

      const res = await fetch('/api/voice-cloning', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMessage = Array.isArray(data) ? data[0]?.msg : data?.message;
        throw new Error(errorMessage || data?.error || '생성 실패');
      }

      setClonedVoiceId(data._id || data.id);
      setSuccessModalOpen(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '생성 실패');
    } finally {
      setIsSaving(false);
    }
  };

  // 총 시간 계산 (게이지 표시용)
  const totalDuration = useMemo(() => audioList.reduce((acc, curr) => acc + curr.duration, 0), [audioList]);
  const isDisabled = totalDuration < 10 || isRecording


  return (
    <div className="max-w-5xl mx-auto p-10 bg-[#F9FAFB] font-sans">
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-xl p-6">
            <div className="text-lg font-bold text-zinc-900">보이스가 생성되었습니다</div>
            <div className="text-sm text-zinc-600 mt-2">보이스 리스트(커스텀)에서 확인할 수 있어요.</div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setSuccessModalOpen(false);
                  setStep(1);
                  setAudioList([]);
                  setModelDescription('');
                  setTags([]);
                  setTagInput('');
                  setAgree(false);
                  setCoverFile(null);
                  if (coverPreviewUrl && coverPreviewIsObjectUrl) URL.revokeObjectURL(coverPreviewUrl);
                  setCoverPreviewUrl('/microphone.jpg');
                  setCoverPreviewIsObjectUrl(false);
                  setSaveError(null);
                  router.push('/voices?tab=custom');
                }}
                className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="mb-10 flex items-center gap-3">
        <span className="text-2xl">🎙️</span>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">보이스 클로닝</h1>
          <p className="text-sm text-gray-500 mt-1">당신의 목소리를 들려주세요.</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <div className="space-y-6 text-sm">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`w-full flex items-center gap-3 text-left ${
                step === 1 ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 1 ? 'bg-gray-900 text-white' : 'border border-gray-200'
                }`}
              >
                1
              </div>
              <span>소스 오디오</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 text-left ${
                step === 2 ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 2 ? 'bg-gray-900 text-white' : 'border border-gray-200'
                }`}
              >
                2
              </div>
              <span>음성 세부 정보</span>
            </button>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9">
          {step === 1 ? (
            <>
              <section className="bg-white w-full rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300 flex flex-col">
                {isRecording ? (
                  <div className="w-full flex-1 p-8 md:p-12 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 min-h-[400px]">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-4xl font-mono font-bold text-gray-950 tracking-tight">
                        {formatDuration(recordingTime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">Recording</p>

                    <div className="w-full max-w-2xl bg-[#F3F4F6] p-6 md:p-10 rounded-2xl border border-gray-100 text-sm md:text-base text-gray-700 leading-relaxed mb-10 italic shadow-inner text-center min-h-[120px] flex items-center justify-center">
                      {RECORDING_SCRIPT}
                    </div>

                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-3 bg-[#EF4444] text-white px-12 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95 mb-4 shrink-0"
                    >
                      <span className="text-[10px] bg-white text-red-500 p-1 rounded-sm">⬛</span>
                      녹음 중지
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex-1 p-12 flex flex-col items-center text-center min-h-[400px] justify-center">
                    <h2 className="text-xl font-bold text-gray-800">오디오 파일을 추가하거나 삭제하세요</h2>
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-xl">
                      여기에 오디오 파일을 드래그 앤 드롭하거나 클릭하여 업로드 또는 녹음하세요.
                      <br />
                      MP3, WAV, M4A, FLAC, MP4, MOV, WEBM, WEBA, OPUS, MID - MAX 32MB
                    </p>

                    <div className="w-full max-w-xl mt-8 text-left">
                      <label className="text-sm font-semibold text-gray-700">이름</label>
                      <input
                        value={modelTitle}
                        onChange={(e) => setModelTitle(e.target.value)}
                        className="w-full mt-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                        placeholder="예: 표준 한국어 남성"
                      />
                    </div>

                    <div className="flex gap-4 mt-10">
                      <input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={async (e) => {
                          if (e.target.files) {
                            for (const file of Array.from(e.target.files)) await validateAndAddAudio(file);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />

                      <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 bg-[#F3F4F6] text-gray-800 px-6 py-3 rounded-2xl font-semibold cursor-pointer hover:bg-gray-200 transition"
                      >
                        <span>📤</span> 업로드
                      </label>

                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 bg-[#F3F4F6] text-gray-800 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition"
                      >
                        <span>🎙️</span> 녹음
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">업로드됨: {totalDuration.toFixed(1)}s</span>
                    <span className="text-xs text-gray-400 mt-1">*참고: 최소 10초, 최대 210초 권장</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-[#FFFBEB] text-[#D97706] rounded-full">
                    <span>⚠️</span> 추천 30초 ~ 90초
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden relative mb-6">
                  <div
                    className="h-full bg-zinc-900 transition-all duration-300"
                    style={{ width: `${Math.min((totalDuration / 210) * 100, 100)}%` }}
                  />
                </div>

                {audioList.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 mb-3">등록된 오디오 ({audioList.length}개)</h3>
                    {audioList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-sm transition"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                          <span className="text-lg">📄</span>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <span className="text-sm font-semibold text-gray-800 truncate">{item.file.name}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-mono">
                            <span>{formatSize(item.size)}</span>
                            <span className="text-gray-200">|</span>
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              playPreview(item);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                              playingItemId === item.id
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                          >
                            {playingItemId === item.id ? '❚❚️' : '▶'}
                          </button>
                          <button
                            onClick={() => {
                              if (currentAudioItemIdRef.current === item.id) {
                                stopCurrentPreview();
                              }
                              if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                              setAudioList((prev) => prev.filter((a) => a.id !== item.id));
                            }}
                            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <footer className="mt-10 text-center">
                <button
                  onClick={goToDetailsStep}
                  disabled={isDisabled}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition ${
                    isDisabled
                      ? 'bg-[#E5E7EB] text-gray-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-100 cursor-pointer'
                  }`}
                >
                  Next Step
                </button>
              </footer>
            </>
          ) : (
            <section className="bg-white w-full rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="text-sm text-gray-500">{clonedVoiceId ? `모델 ID: ${clonedVoiceId}` : ''}</div>
                <div />
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden">
                      {coverPreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverPreviewUrl} alt="cover" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <span className="text-sm">✎</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (coverPreviewUrl && coverPreviewIsObjectUrl) URL.revokeObjectURL(coverPreviewUrl);
                          setCoverFile(f);
                          setCoverPreviewUrl(URL.createObjectURL(f));
                          setCoverPreviewIsObjectUrl(true);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (coverPreviewUrl && coverPreviewIsObjectUrl) URL.revokeObjectURL(coverPreviewUrl);
                      setCoverFile(null);
                      setCoverPreviewUrl('/microphone.jpg');
                      setCoverPreviewIsObjectUrl(false);
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                  >
                    커버 이미지 제거
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">이름</label>
                  <input
                    value={modelTitle}
                    onChange={(e) => setModelTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="예: 표준 한국어 남성"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">설명 (선택 사항)</label>
                  <textarea
                    value={modelDescription}
                    onChange={(e) => setModelDescription(e.target.value)}
                    className="w-full min-h-[110px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="명확하고 차분한 음색의 남성 음성입니다."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">태그 (선택 사항)</label>
                    <span className="text-xs text-gray-400">{tags.length}개</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          if (tagInput.trim()) {
                            addTag(tagInput);
                            setTagInput('');
                          }
                        }
                      }}
                     
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="태그를 입력하고 Enter"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          addTag(tagInput);
                          setTagInput('');
                        }
                      }}
                      className="px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                    >
                      추가
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => removeTag(t)}
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
                        >
                          {t} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {(
                  [
                    { label: '성별', values: presetTags.gender },
                    { label: '나이', values: presetTags.age },
                    { label: '사용 사례', values: presetTags.use },
                    { label: '음성 품질', values: presetTags.quality },
                  ] as const
                ).map((group) => (
                  <div key={group.label} className="space-y-4">
                    <div className="text-sm font-semibold text-gray-700">{group.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {(group.label === '음성 품질' && !showAllQualityTags ? group.values.slice(0, 14) : group.values).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t)}
                          className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                            tags.includes(t)
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {group.label === '음성 품질' && group.values.length > 14 && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAllQualityTags((v) => !v)}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                        >
                          {showAllQualityTags ? '간략히 보기' : '전체 보기'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-700">타입</div>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                      />
                      공개
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'unlist'}
                        onChange={() => setVisibility('unlist')}
                      />
                      비공개
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === 'private'}
                        onChange={() => setVisibility('private')}
                      />
                      비공개
                    </label>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {visibility === 'public'
                      ? '이 음성 모델은 발견 페이지에서 볼 수 있으며 모든 사람이 볼 수 있습니다.'
                      : visibility === 'private'
                        ? '이 음성 모델은 비공개 음성으로 등록됩니다.'
                        : '이 음성은 미등록 음성으로 등록됩니다.'}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <div className="text-xs text-gray-400 font-semibold mb-3">미리보기</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 overflow-hidden">
                      {coverPreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverPreviewUrl} alt="cover" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900">{modelTitle.trim() || '이름 없음'}</div>
                        <span className="text-xs text-gray-500">@ {visibility}</span>
                      </div>
                      {modelDescription.trim() && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{modelDescription.trim()}</div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {previewTags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] text-gray-700"
                          >
                            {t}
                          </span>
                        ))}
                        {extraTagCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[11px] text-gray-500">
                            +{extraTagCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1"
                  />
                  <span>이 음성을 사용할 필요 권리가 있다는 것을 확인합니다. (필수)</span>
                </label>

                {saveError && <div className="text-sm text-red-600">{saveError}</div>}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={createModel}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition ${
                      isSaving ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSaving ? '보이스 생성 중...' : '보이스 클로닝'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}