import { CloudflareStorage } from './cloudflare.storage';
import { IUploadProvider } from './upload.interface';
import { LocalStorage } from './local.storage';

export class UploadFactory {
  static createStorage(): IUploadProvider {
    const storageProvider = process.env.STORAGE_PROVIDER || 'local';

    console.log('🔧 UploadFactory creating storage provider:', storageProvider);
    console.log('🔧 Environment variables:', {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_BUCKETNAME: process.env.CLOUDFLARE_BUCKETNAME,
      CLOUDFLARE_BUCKET_URL: process.env.CLOUDFLARE_BUCKET_URL,
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER
    });

    switch (storageProvider) {
      case 'local':
        console.log('📁 Using LocalStorage');
        return new LocalStorage(process.env.UPLOAD_DIRECTORY!);
      case 'cloudflare':
        console.log('☁️ Using CloudflareStorage');
        return new CloudflareStorage(
          process.env.CLOUDFLARE_ACCOUNT_ID!,
          process.env.CLOUDFLARE_ACCESS_KEY!,
          process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
          process.env.CLOUDFLARE_REGION!,
          process.env.CLOUDFLARE_BUCKETNAME!,
          process.env.CLOUDFLARE_BUCKET_URL!
        );
      default:
        throw new Error(`Invalid storage type ${storageProvider}`);
    }
  }
}
