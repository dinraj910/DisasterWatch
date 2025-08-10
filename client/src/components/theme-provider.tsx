import { ThemeProvider as ThemeProviderImpl } from "@/hooks/use-theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <ThemeProviderImpl defaultTheme="light">{children}</ThemeProviderImpl>;
}
