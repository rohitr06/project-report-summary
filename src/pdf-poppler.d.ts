declare module "pdf-poppler" {
    interface PopplerOptions {
      format?: "png" | "jpeg" | "tiff";
      out_dir?: string;
      out_prefix?: string;
      page?: number | null;
    }
  
    function convert(filePath: string, options: PopplerOptions): Promise<string>;
  
    export default { convert };
  }
  