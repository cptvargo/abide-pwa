import { ThemeProvider } from "./theme/ThemeProvider";
import AppShell from "./AppShell";
import CoreReading from "./CoreReading";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <CoreReading />
      </AppShell>
    </ThemeProvider>
  );
}
