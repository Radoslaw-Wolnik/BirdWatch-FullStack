import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { BadRequestError, InternalServerError } from './errors';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

type AllowedFileType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml';

type UploadType = 'profile' | 'post' | 'bird-icon';

export async function uploadFile(
  file: File,
  uploadType: UploadType,
  id: string | number,
  allowedTypes: AllowedFileType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
): Promise<string> {
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  if (!allowedTypes.includes(file.type as AllowedFileType)) {
    throw new BadRequestError('Invalid file type');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  
  const uploadDir = path.join(BASE_UPLOAD_DIR, uploadType + 's', id.toString());
  const filePath = path.join(uploadDir, uniqueFilename);

  try {
    if (file.type === 'image/svg+xml') {
      await writeFile(filePath, buffer);
    } else if (file.type.startsWith('image/')) {
      await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFile(filePath);
    } else {
      await writeFile(filePath, buffer);
    }

    return `/uploads/${uploadType}s/${id}/${uniqueFilename}`;
  } catch (error) {
    throw new InternalServerError('Error uploading file');
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', fileUrl);
  try {
    await unlink(filePath);
  } catch (error) {
    throw new InternalServerError('Error deleting file');
  }
}