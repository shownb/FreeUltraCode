import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FilePreviewDrawer from './FilePreviewDrawer';
import { previewLocalFile } from '@/lib/tauri';

vi.mock('@/lib/tauri', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/tauri')>()),
  openLocalPath: vi.fn(),
  previewLocalFile: vi.fn(),
}));

describe('FilePreviewDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalCreateObjectUrl: typeof URL.createObjectURL | undefined;
  let originalRevokeObjectUrl: typeof URL.revokeObjectURL | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    originalCreateObjectUrl = URL.createObjectURL;
    originalRevokeObjectUrl = URL.revokeObjectURL;
    vi.useRealTimers();
    vi.mocked(previewLocalFile).mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreateObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevokeObjectUrl,
    });
  });

  it('does not mount a full-screen backdrop that blocks the rest of the app', async () => {
    vi.mocked(previewLocalFile).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      root.render(
        createElement(FilePreviewDrawer, {
          refData: { path: 'screen.png', basename: 'screen.png' },
          onClose: vi.fn(),
        }),
      );
    });

    expect(
      container.querySelector('button[aria-label="关闭文件预览"]'),
    ).toBeNull();
    expect(container.querySelector('aside')).not.toBeNull();
  });

  it('renders image previews through a blob URL instead of a large data URL', async () => {
    vi.useFakeTimers();
    const createObjectUrl = vi.fn(() => 'blob:preview-image');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    });
    vi.mocked(previewLocalFile).mockResolvedValue({
      path: 'E:\\OpenWorkflows\\.freeultracode\\clipboard-images\\screen.png',
      fileName: 'screen.png',
      kind: 'image',
      mime: 'image/png',
      sizeBytes: 3,
      truncated: false,
      text: null,
      base64: btoa('png'),
    });

    await act(async () => {
      root.render(
        createElement(FilePreviewDrawer, {
          refData: { path: 'screen.png', basename: 'screen.png' },
          onClose: vi.fn(),
        }),
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    const img = container.querySelector<HTMLImageElement>('img');
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(img?.getAttribute('src')).toBe('blob:preview-image');
    expect(img?.getAttribute('src')).not.toMatch(/^data:/);

    await act(async () => {
      root.render(
        createElement(FilePreviewDrawer, {
          refData: null,
          onClose: vi.fn(),
        }),
      );
    });
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:preview-image');
  });
});
