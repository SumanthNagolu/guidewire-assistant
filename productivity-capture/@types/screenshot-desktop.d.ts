declare module 'screenshot-desktop' {
  interface ScreenshotOptions {
    format?: 'png' | 'jpg';
    quality?: number;
    linuxLibrary?: 'scrot' | 'imagemagick';
  }

  function screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  export = screenshot;
}


