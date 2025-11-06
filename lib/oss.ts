import COS from 'cos-nodejs-sdk-v5';

function getEnv(name: string): string {
  return process.env[name] || '';
}

function getConfig() {
  // 仅使用 COS_* 环境变量
  const region = getEnv('COS_REGION');
  const secretId = getEnv('COS_SECRET_ID');
  const secretKey = getEnv('COS_SECRET_KEY');
  const bucket = getEnv('COS_BUCKET');
  const customDomain = process.env.COS_CUSTOM_DOMAIN; // 可选：自定义访问域名

  if (!region || !secretId || !secretKey || !bucket) {
    throw new Error('COS 配置缺失，请设置 COS_REGION/COS_SECRET_ID/COS_SECRET_KEY/COS_BUCKET');
  }

  return { region, secretId, secretKey, bucket, customDomain };
}

// 返回兼容旧用法的“OSS 客户端”，内部适配为 COS
export function getOSSClient() {
  const { secretId, secretKey, region, bucket } = getConfig();
  const cos: any = new COS({ SecretId: secretId, SecretKey: secretKey });

  // 适配器：提供与 ali-oss 相似的方法签名
  return {
    // put: 上传对象
    async put(key: string, body: Buffer, options?: { headers?: Record<string, string> }) {
      await new Promise<void>((resolve, reject) => {
        cos.putObject(
          {
            Bucket: bucket,
            Region: region,
            Key: key,
            Body: body,
            ContentType: options?.headers?.['Content-Type'],
          },
          (err: unknown, _data: unknown) => (err ? reject(err) : resolve())
        );
      });
      const url = getOSSUrl(key);
      return { url, name: key } as const;
    },

    // delete: 删除对象
    async delete(key: string) {
      await new Promise<void>((resolve, reject) => {
        cos.deleteObject(
          { Bucket: bucket, Region: region, Key: key },
          (err: unknown) => (err ? reject(err) : resolve())
        );
      });
      return true as const;
    },

    // signatureUrl: 生成签名 URL（与 ali-oss 类似）
    signatureUrl(key: string, opts?: { expires?: number }) {
      const Expires = Math.max(60, Math.min(7 * 24 * 3600, opts?.expires ?? 3600));
      return cos.getObjectUrl({ Bucket: bucket, Region: region, Key: key, Expires, Sign: true });
    },

    // initMultipartUpload: 初始化分片上传
    async initMultipartUpload(key: string, _options?: { headers?: Record<string, string> }) {
      const uploadId = await new Promise<string>((resolve, reject) => {
        cos.multipartInit({ Bucket: bucket, Region: region, Key: key }, (err: any, data: any) => {
          if (err) return reject(err);
          resolve(data.UploadId as string);
        });
      });
      return { uploadId } as const;
    },

    // uploadPart: 上传分片
    async uploadPart(key: string, uploadId: string, partNumber: number, body: Buffer) {
      const etag = await new Promise<string>((resolve, reject) => {
        cos.uploadPart(
          { Bucket: bucket, Region: region, Key: key, PartNumber: partNumber, UploadId: uploadId, Body: body },
          (err: any, data: any) => {
            if (err) return reject(err);
            const et = data?.ETag || data?.ETag?.replace(/\"/g, '');
            resolve(et as string);
          }
        );
      });
      return { etag } as const;
    },

    // completeMultipartUpload: 完成分片
    async completeMultipartUpload(key: string, uploadId: string, parts: Array<{ number: number; etag: string }>) {
      const cosParts = parts
        .sort((a, b) => a.number - b.number)
        .map((p) => ({ PartNumber: p.number, ETag: p.etag }));

      await new Promise<void>((resolve, reject) => {
        cos.multipartComplete(
          { Bucket: bucket, Region: region, Key: key, UploadId: uploadId, Parts: cosParts },
          (err: unknown) => (err ? reject(err) : resolve())
        );
      });
      return { name: key } as const;
    },
  };
}

// 生成唯一文件名
export function generateFileName(originalName: string, folder: string = 'uploads'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  const folderPath = folder.endsWith('/') ? folder.slice(0, -1) : folder;
  return `${folderPath}/${timestamp}-${randomStr}.${ext}`;
}

// 统一构造公网访问 URL
export function getOSSUrl(key: string): string {
  const { bucket, region, customDomain } = getConfig();
  const host = customDomain || `${bucket}.cos.${region}.myqcloud.com`;
  return `https://${host}/${key}`;
}

// 上传文件（保留原函数名，内部走 COS）
export async function uploadToOSS(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
) {
  const client = getOSSClient();
  const key = generateFileName(fileName, folder);
  const result = await client.put(key, file, { headers: { 'Content-Type': contentType } });
  return { url: result.url, name: key } as const;
}

// 删除文件（保留原函数名）
export async function deleteFromOSS(fileName: string) {
  const client = getOSSClient();
  await client.delete(fileName);
  return true as const;
}

// 获取签名 URL（保留原函数名）
export async function getSignedUrl(fileName: string, expiresInSeconds: number = 3600) {
  const client = getOSSClient();
  return client.signatureUrl(fileName, { expires: expiresInSeconds });
}

