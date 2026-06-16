import {
  Clock3,
  FilePen,
  FileText,
  FolderOpen,
  Globe,
  ListTree,
  Search,
  SquareTerminal,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { toolIconName } from './lib/toolMeta';

const ICONS: Record<string, LucideIcon> = {
  Clock3,
  FilePen,
  FileText,
  SquareTerminal,
  FolderOpen,
  Search,
  Globe,
  ListTree,
  Wrench,
};

/** Resolve a per-tool lucide icon from the tool name (see lib/toolMeta). */
export default function ToolIcon({
  name,
  size = 12,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (/^(?:运行状态|runtime[_-]?status)$/iu.test(name.trim())) {
    return <Clock3 size={size} className={className} />;
  }
  const Icon = ICONS[toolIconName(name)] ?? Wrench;
  return <Icon size={size} className={className} />;
}
