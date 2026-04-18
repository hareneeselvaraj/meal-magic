export function startVoiceInput(onResult: (text: string) => void, onError: (err: string) => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('Voice input is not supported in this browser.');
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event: any) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const text = event.results[0][0].transcript;
      onResult(text);
    }
  };
  
  recognition.onerror = (event: any) => {
    onError(event.error);
  };
  
  recognition.start();
}
