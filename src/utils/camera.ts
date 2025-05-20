declare global {
  interface Window {
    currentStreams: MediaStream[];
  }
}

export default class Camera {
  private currentStream: MediaStream | undefined;
  private streaming: boolean = false;
  private width: number = 640;
  private height: number = 0;

  private videoElement: HTMLVideoElement;
  private selectCameraElement: HTMLSelectElement;
  private canvasElement: HTMLCanvasElement;

  private takePictureButton: HTMLButtonElement | undefined;

  static addNewStream(stream: MediaStream): void {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
      return;
    }

    window.currentStreams = [...window.currentStreams, stream];
  }

  static stopAllStreams(): void {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
      return;
    }
    
    window.currentStreams.forEach((stream: MediaStream) => {
      if (stream.active) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    });
  }

  constructor({
    video,
    cameraSelect,
    canvas,
    // @ts-ignore
    options = {},
  }: {
    video: HTMLVideoElement;
    cameraSelect: HTMLSelectElement;
    canvas: HTMLCanvasElement;
    options?: Record<string, any>;
  }) {
    this.videoElement = video;
    this.selectCameraElement = cameraSelect;
    this.canvasElement = canvas;

    this.initialListener();
  }

  private initialListener(): void {
    this.videoElement.oncanplay = () => {
      if (this.streaming) {
        return;
      }

      this.height = (this.videoElement.videoHeight * this.width) / this.videoElement.videoWidth;

      this.canvasElement.setAttribute('width', this.width.toString());
      this.canvasElement.setAttribute('height', this.height.toString());

      this.streaming = true;
    };

    this.selectCameraElement.onchange = async () => {
      await this.stop();
      await this.launch();
    };
  }

  private async populateDeviceList(stream: MediaStream): Promise<void> {
    try {
      if (!(stream instanceof MediaStream)) {
        return Promise.reject(new Error('MediaStream not found!'));
      }

      const { deviceId } = stream.getVideoTracks()[0].getSettings();

      const enumeratedDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
      const list: MediaDeviceInfo[] = enumeratedDevices.filter(
        (device: MediaDeviceInfo) => device.kind === 'videoinput',
      );

      const html: string = list.reduce(
        (accumulator: string, device: MediaDeviceInfo, currentIndex: number) => {
          return accumulator.concat(`
            <option
              value="${device.deviceId}"
              ${deviceId === device.deviceId ? 'selected' : ''}
            >
              ${device.label || `Camera ${currentIndex + 1}`}
            </option>
          `);
        },
        '',
      );

      this.selectCameraElement.innerHTML = html;
    } catch (error) {
      console.error('#populateDeviceList: error:', error);
    }
  }

  private async getStream(): Promise<MediaStream | null> {
    try {
      const deviceId: { exact: string } | undefined =
        !this.streaming && !this.selectCameraElement.value
          ? undefined
          : { exact: this.selectCameraElement.value };

      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 4 / 3,
          deviceId,
        },
      });

      await this.populateDeviceList(stream);

      return stream;
    } catch (error) {
      console.error('#getStream: error:', error);
      return null;
    }
  }

  async launch(): Promise<void> {
    const stream = await this.getStream();

    if (stream) {
      this.currentStream = stream;
      Camera.addNewStream(this.currentStream);
      this.videoElement.srcObject = this.currentStream;
      this.videoElement.play();
    } else {
      console.error('Failed to get camera stream');
    }

    this.clearCanvas();
  }

  stop(): void {
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.streaming = false;
    }

    if (this.currentStream instanceof MediaStream) {
      this.currentStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    this.clearCanvas();
  }

  private clearCanvas(): void {
    const context: CanvasRenderingContext2D = this.canvasElement.getContext(
      '2d',
    ) as CanvasRenderingContext2D;
    context.fillStyle = '#AAAAAA';
    context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  async takePicture(): Promise<Blob | null> {
    if (!(this.width && this.height)) {
      return null;
    }

    const context: CanvasRenderingContext2D = this.canvasElement.getContext(
      '2d',
    ) as CanvasRenderingContext2D;

    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;

    context.drawImage(this.videoElement, 0, 0, this.width, this.height);

    return await new Promise((resolve: (value: Blob | null) => void) => {
      this.canvasElement.toBlob((blob: Blob | null) => resolve(blob));
    });
  }

  addCheeseButtonListener(button: HTMLButtonElement | string, callback: () => void): void {
    if (typeof button === 'string') {
      this.takePictureButton = document.querySelector(button) as HTMLButtonElement;
    } else {
      this.takePictureButton = button;
    }

    this.takePictureButton.onclick = callback;
  }
  
}


