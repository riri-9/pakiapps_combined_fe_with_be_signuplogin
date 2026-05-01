export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export type UploadedFileFields = Record<string, UploadedFile[] | undefined>;
