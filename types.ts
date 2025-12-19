
export interface VideoSegment {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  startTime: number;
  endTime: number;
}

export type SplitDuration = 15 | 30 | 60;

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
}
