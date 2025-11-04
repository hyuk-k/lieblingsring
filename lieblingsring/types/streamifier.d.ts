// lieblingsring/lieblingsring/types/streamifier.d.ts
declare module "streamifier" {
  // 간단히 any로 처리: 사용하신 upload_stream/ createReadStream 만 필요하면
  // 아래처럼 더 구체적으로 타입을 정의해도 됩니다.
  const streamifier: {
    createReadStream(buffer: Buffer | Uint8Array): NodeJS.ReadableStream;
    createReadStream(input: any): NodeJS.ReadableStream;
    // upload_stream용으로도 any 허용
    createWriteStream?: any;
    [key: string]: any;
  };
  export default streamifier;
}