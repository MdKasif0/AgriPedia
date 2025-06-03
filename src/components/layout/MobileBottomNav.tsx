import Link from 'next/link';
import { Home, Leaf, ScanLine, Settings as SettingsIcon, MessagesSquare, Heart, Search, Calendar } from 'lucide-react';

const navItemsConfig = [
  { id: "home", href: "/", icon: Home, label: "Home" },
  { id: "chat", href: "/chat", icon: MessagesSquare, label: "Chat AI" },
  {
    id: "scan",
    icon: ScanLine,
    label: "Scan",
    isCentralScan: true,
    onClick: () => setIsScanDialogOpen(true)
  },
  {
    id: 'grow-plans',
    label: 'Grow Plans',
    href: '/grow-plan/plans',
    icon: Calendar,
  },
  { id: "search", href: "/search", icon: Search, label: "Search" },
  { id: "settings", icon: SettingsIcon, label: "Settings", onClickSheet: () => setIsSettingsSheetOpen(true) },
]; 