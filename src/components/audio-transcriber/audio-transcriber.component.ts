
import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
  selector: 'app-audio-transcriber',
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent],
})
export class AudioTranscriberComponent implements OnDestroy {
  private readonly geminiService = inject(GeminiService);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  readonly isRecording = signal(false);
  readonly transcription = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = this.geminiService.error;

  async toggleRecording(): Promise<void> {
    this.error.set(null);
    this.transcription.set(null);
    if (this.isRecording()) {
      this.mediaRecorder?.stop();
      this.isRecording.set(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);
        this.mediaRecorder.onstop = this.handleRecordingStop.bind(this);
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording.set(true);
      } catch (err) {
        this.error.set('Microphone access was denied. Please allow microphone access in your browser settings.');
        console.error('Error accessing microphone:', err);
      }
    }
  }

  private async handleRecordingStop(): Promise<void> {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });

      if (audioFile.size > 0) {
        const audioPart = await this.geminiService.fileToGenerativePart(audioFile);
        const result = await this.geminiService.transcribeAudio(this.loading, audioPart);
        if (result) {
          this.transcription.set(result);
        }
      } else {
        this.error.set('No audio was recorded.');
      }
      this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
  }
  
  ngOnDestroy(): void {
    this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
  }
}
