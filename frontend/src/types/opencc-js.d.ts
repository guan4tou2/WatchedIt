declare module "opencc-js" {
  export interface OpenCCOptions {
    from: string;
    to: string;
  }

  export interface OpenCCConverter {
    (text: string): string;
  }

  export function Converter(options: OpenCCOptions): OpenCCConverter;
}
