export async function createObjectUrlFromBase64(
  base64: string,
  mime: string,
): Promise<string> {
  if (typeof fetch === 'function') {
    try {
      const response = await fetch(`data:${mime};base64,${base64}`);
      return URL.createObjectURL(await response.blob());
    } catch {
      // Fall through to the local decoder for older/limited webviews.
    }
  }

  return URL.createObjectURL(base64ToBlob(base64, mime));
}

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const chunkSize = 8192;
  const chunks: ArrayBuffer[] = [];

  for (let offset = 0; offset < binary.length; offset += chunkSize) {
    const slice = binary.slice(offset, offset + chunkSize);
    const buffer = new ArrayBuffer(slice.length);
    const bytes = new Uint8Array(buffer);
    for (let index = 0; index < slice.length; index += 1) {
      bytes[index] = slice.charCodeAt(index);
    }
    chunks.push(buffer);
  }

  return new Blob(chunks, { type: mime });
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}
