import * as ImagePicker from 'expo-image-picker';
import { generateId } from './ids';

const PHOTOS_DIR = 'photos';

function getFileSystem() {
  // Lazy require to avoid crashing if native module isn't ready at import time
  return require('expo-file-system') as typeof import('expo-file-system');
}

function getPhotosDir() {
  const { Paths, Directory } = getFileSystem();
  const dir = new Directory(Paths.document, PHOTOS_DIR);
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

export async function pickPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return copyToAppStorage(result.assets[0].uri);
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsMultipleSelection: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return copyToAppStorage(result.assets[0].uri);
}

export function copyToAppStorage(uri: string): string {
  const { File } = getFileSystem();
  const ext = uri.split('.').pop() ?? 'jpg';
  const filename = `${generateId()}.${ext}`;
  const dir = getPhotosDir();
  const source = new File(uri);
  const dest = new File(dir, filename);
  source.copy(dest);
  return dest.uri;
}

export function deletePhoto(uri: string): void {
  try {
    const { File } = getFileSystem();
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File already deleted or inaccessible
  }
}

export function deleteAllPhotos(): void {
  try {
    const { Paths, Directory } = getFileSystem();
    const dir = new Directory(Paths.document, PHOTOS_DIR);
    if (dir.exists) {
      dir.delete();
    }
  } catch {
    // Directory doesn't exist or already deleted
  }
}
