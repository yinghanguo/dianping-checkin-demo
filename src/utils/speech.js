// Web Speech API 语音识别封装
// 支持:iOS Safari、Chrome 等
// 不支持时返回 null

export function getSpeechRecognition() {
  const SR =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;
  return SR || null;
}

export function isSpeechSupported() {
  return getSpeechRecognition() !== null;
}

// 创建一个语音识别实例
// onResult({ final, interim })  → 实时返回最终/临时结果
// onEnd()                       → 录音结束
// onError(err)                  → 出错
export function createRecognizer({
  lang = "zh-CN",
  onResult,
  onEnd,
  onError,
  onStart,
} = {}) {
  const SR = getSpeechRecognition();
  if (!SR) return null;

  const recognition = new SR();
  recognition.continuous = true;     // 连续识别
  recognition.interimResults = true; // 实时返回临时结果
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    let final = "";
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    onResult?.({ final, interim });
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.onerror = (e) => {
    onError?.(e);
  };

  return recognition;
}
