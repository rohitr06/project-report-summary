declare module "mupdf-js" {
    const convert: (pdfBuffer: Buffer, options: { format: string; resolution: number }) => Promise<string[]>;
    export { convert };
  }
  