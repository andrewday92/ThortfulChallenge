export type imageData = {
  url: string,
  alt: string
}

export type CardFace = {
  src: string,
  alt: string,
  srcThumb: string,
  width?: number,
  height?: number
}

export interface Topic {
  title: string;
  slug: string;
}

export interface UnsplashImage {
  urls: {
    full: string;
    thumb: string;
  };
  alt_description: string;
  width: number;
  height: number;
}
