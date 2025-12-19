
import { VideoSegment, SplitDuration } from '../types';

/**
 * Smart-Cut Video Processor
 * Uses MediaRecorder to capture video segments.
 */
export const processVideo = async (
  file: File,
  segmentDuration: SplitDuration,
  onProgress: (progress: number, message: string) => void
): Promise<VideoSegment[]> => {
  return new Promise((resolve, reject) => {
    // Create a hidden video element and append it to the body
    // Some browsers require the video to be in the DOM for captureStream to work reliably
    const video = document.createElement('video');
    video.style.position = 'fixed';
    video.style.top = '-10000px';
    video.style.left = '-10000px';
    video.style.width = '640px'; // Set a size for consistency
    video.style.height = '360px';
    video.muted = true;
    video.playsInline = true;
    document.body.appendChild(video);

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const totalSegments = Math.ceil(duration / segmentDuration);
      const segments: VideoSegment[] = [];

      // Check for stream capture support
      let stream: MediaStream;
      try {
        // @ts-ignore
        if (video.captureStream) {
          // @ts-ignore
          stream = video.captureStream();
        } else if ((video as any).mozCaptureStream) {
          stream = (video as any).mozCaptureStream();
        } else {
          throw new Error('Seu navegador não suporta a captura de fluxo de vídeo.');
        }
      } catch (e) {
        document.body.removeChild(video);
        reject(new Error('Falha ao capturar fluxo do vídeo: ' + (e as Error).message));
        return;
      }
      
      onProgress(5, 'Smart-Cut preparando motor...');

      for (let i = 0; i < totalSegments; i++) {
        const startTime = i * segmentDuration;
        const endTime = Math.min((i + 1) * segmentDuration, duration);
        const currentSegmentNum = i + 1;

        onProgress(
          5 + (i / totalSegments) * 90, 
          `Processando parte ${currentSegmentNum} de ${totalSegments}...`
        );

        // Seek to start of segment
        video.currentTime = startTime;
        await new Promise(r => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            r(null);
          };
          video.addEventListener('seeked', onSeeked);
        });

        const chunks: Blob[] = [];
        
        // Find supported mime type
        const possibleMimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4' // Some browsers might support mp4 recording (unlikely)
        ];
        
        const mimeType = possibleMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
        
        if (!mimeType) {
          document.body.removeChild(video);
          reject(new Error('Nenhum formato de gravação suportado encontrado neste navegador.'));
          return;
        }

        const recorder = new MediaRecorder(stream, { 
          mimeType,
          videoBitsPerSecond: 2500000 // 2.5 Mbps for decent quality
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        const segmentPromise = new Promise<Blob>((res) => {
          recorder.onstop = () => {
            res(new Blob(chunks, { type: mimeType }));
          };
        });

        // Start recording
        recorder.start();
        video.play();

        // Wait until end of segment or file
        await new Promise(r => {
          const checkTime = () => {
            if (video.currentTime >= endTime || video.paused || video.ended) {
              video.pause();
              r(null);
            } else {
              // Check every frame
              requestAnimationFrame(checkTime);
            }
          };
          requestAnimationFrame(checkTime);
        });

        recorder.stop();
        const segmentBlob = await segmentPromise;
        
        // Determine extension based on mimeType
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const segmentName = `${file.name.split('.')[0]}_parte_${currentSegmentNum}.${ext}`;

        segments.push({
          id: crypto.randomUUID(),
          name: segmentName,
          blob: segmentBlob,
          url: URL.createObjectURL(segmentBlob),
          startTime,
          endTime
        });
      }

      onProgress(100, 'Smart-Cut finalizado!');
      
      // Cleanup
      document.body.removeChild(video);
      URL.revokeObjectURL(videoUrl);
      
      resolve(segments);
    };

    video.onerror = () => {
      if (document.body.contains(video)) document.body.removeChild(video);
      reject(new Error('Erro ao carregar o arquivo de vídeo. Verifique se o formato é válido.'));
    };
  });
};
