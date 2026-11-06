import type { Locale } from "./messages";

export type FrameScene = "chat" | "door" | "film" | "desk" | "craft" | "laptops" | "umrah";

/**
 * We have no photos together, so each frame holds a small animated illustration
 * of the two of us and a line of what we're looking forward to.
 */
export interface FutureFrame {
  /** Which illustration the frame shows */
  scene: FrameScene;
  /** Caption on the frame */
  title: string;
  /** The line under the caption */
  description: string;
}

// EDIT ME: keep both languages in the same order.
export const memories: Record<Locale, FutureFrame[]> = {
  ar: [
    {
      scene: "chat",
      title: "بدل «صديقي الصدوق»",
      description: "بدل ما بنتكلم كل يوم ونقول «صديقي الصدوق»، عايز أقولك «حبيبي الحبوب»، بس بالحلال.",
    },
    {
      scene: "door",
      title: "يلا ننزل",
      description: "عايز لما أقول يلا ننزل، ماما تقول «يلا»، مش «لا، كفاية نزول مع حليم» 😂",
    },
    {
      scene: "film",
      title: "فيلم سوا",
      description: "بدل ما أقولك اتفرجي على الفيلم أو ألخصهولك، عايز نتفرج عليه سوا. عايز من دلوقتي أعيش كل لحظة معاكي، ونقف مع بعض.",
    },
    {
      scene: "desk",
      title: "مكتب واحد",
      description: "نفسي نشتغل من مكتب واحد في البيت.",
    },
    {
      scene: "craft",
      title: "تصميم وتنفيذ",
      description: "إنتي مصممة UX يعني هتصمميلي حياتي، وأنا فرونت إند. عليكي التصميم وعليا التنفيذ، نكمّل بعض.",
    },
    {
      scene: "laptops",
      title: "ماك بوك إير",
      description: "يبدو إن الماك بوك إير بتاعك محتاج ماك برو يحميه ويكون سنده.",
    },
    {
      scene: "umrah",
      title: "عمرة سوا",
      description: "من أكتر الصور اللي بدعي ربنا يكتبهالنا.",
    },
  ],
  en: [
    {
      scene: "chat",
      title: "Instead of “dear friend”",
      description: "Instead of talking every day and saying “my dear friend”, I want to call you “my sweetheart”, the halal way.",
    },
    {
      scene: "door",
      title: "Let's go out",
      description: "I want to say “let's go out” and have your mom say “go ahead”, not “no, enough going out with Haleem” 😂",
    },
    {
      scene: "film",
      title: "A film together",
      description: "Instead of telling you to watch a film or summing it up for you, I want us to watch it together. From now on I want to live every moment with you, and stand by each other.",
    },
    {
      scene: "desk",
      title: "One desk",
      description: "I dream of us working from one desk at home.",
    },
    {
      scene: "craft",
      title: "Design and build",
      description: "You're a UX designer, so you'll design my life. I'm front-end. You design, I build, and we complete each other.",
    },
    {
      scene: "laptops",
      title: "MacBook Air",
      description: "It seems your MacBook Air needs a MacBook Pro to protect it and be its support.",
    },
    {
      scene: "umrah",
      title: "Umrah together",
      description: "One of the photos I keep making dua for.",
    },
  ],
};
