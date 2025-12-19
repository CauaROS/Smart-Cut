
import { VideoSegment, SplitDuration } from '../types';

/**
 * Motor de processamento de vídeo usando MediaRecorder API.
 * Corta o vídeo gravando os segmentos em tempo real.
 */
export const processVideo = async (
  file: File,
  segmentDuration: SplitDuration,
  onProgress: (progress: number, message: string) => void
): Promise<VideoSegment[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const totalSegments = Math.ceil(duration / segmentDuration);
      const segments: VideoSegment[] = [];

      // Prepara o stream do vídeo
      // @ts-ignore - captureStream é suportado na maioria dos browsers modernos
      const stream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream();
      
      onProgress(5, 'Preparando motor de recorte...');

      for (let i = 0; i < totalSegments; i++) {
        const startTime = i * segmentDuration;
        const endTime = Math.min((i + 1) * segmentDuration, duration);
        const currentSegmentNum = i + 1;

        onProgress(
          5 + (i / totalSegments) * 90, 
          `Gravando parte ${currentSegmentNum} de ${totalSegments}...`
        );

        // Posiciona o vídeo no início do segmento
        video.currentTime = startTime;
        await new Promise(r => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            r(null);
          };
          video.addEventListener('seeked', onSeeked);
        });

        // Configura o gravador para este segmento
        const chunks: Blob[] = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
          ? 'video/webm;codecs=vp9,opus' 
          : 'video/webm';
          
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const segmentPromise = new Promise<Blob>((res) => {
          recorder.onstop = () => {
            res(new Blob(chunks, { type: mimeType }));
          };
        });

        // Inicia gravação e reprodução
        recorder.start();
        video.play();

        // Aguarda atingir o tempo final do segmento
        await new Promise(r => {
          const checkTime = () => {
            if (video.currentTime >= endTime || video.paused) {
              video.pause();
              r(null);
            } else {
              requestAnimationFrame(checkTime);
            }
          };
          requestAnimationFrame(checkTime);
        });

        recorder.stop();
        const segmentBlob = await segmentPromise;
        const segmentName = `${file.name.split('.')[0]}_parte_${currentSegmentNum}.webm`;

        segments.push({
          id: crypto.randomUUID(),
          name: segmentName,
          blob: segmentBlob,
          url: URL.createObjectURL(segmentBlob),
          startTime,
          endTime
        });
      }

      onProgress(100, 'Processamento concluído com sucesso!');
      URL.revokeObjectURL(videoUrl);
      resolve(segments);
    };

    video.onerror = () => {
      reject(new Error('Erro ao carregar o arquivo de vídeo.'));
    };
  });
};
