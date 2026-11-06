import { AudioController } from "@/components/audio/AudioController";
import { Experience } from "@/components/Experience";
import { LocaleProvider } from "@/hooks/useLocale";

export default function Page() {
  return (
    <LocaleProvider>
      <AudioController>
        <Experience />
      </AudioController>
    </LocaleProvider>
  );
}
