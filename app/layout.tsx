// 根 layout: 仅作为 fallback,所有内容都通过 [locale] 渲染
// 参考 next-intl 官方推荐结构
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export const metadata = {
  title: 'AI-Edu-OpenCode',
  description: 'AI 时代的学习平台',
};
