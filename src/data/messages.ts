// EDIT ME: every word on screen lives here, in both languages.

export type Locale = "ar" | "en";

export interface Reason {
  title: string;
  message: string;
  icon: "faith" | "eyes" | "grace" | "craft" | "family";
}

const ar = {
  invitation: {
    lines: ["كل بداية جميلة ليها لحظة...", "لحظة بتغيّر كل حاجة.", "يا أسيو، عندي حاجة عايز أوريهالك."],
    button: "ابدئي",
    soundHint: "علّي الصوت، وشيلي الموبايل من الصامت",
  },
  mystery: {
    lines: [
      "يا أشطر UI/UX في الدنيا...",
      "عارف إنك بتاخدي بالك من كل تفصيلة، عشان كده عملتلك دي.",
    ],
    button: "يلا بينا",
  },
  /** The hidden symbol on the second screen. It must not give away the question. */
  secretMessage: "فيه كلمة نفسي أقولهالك من زمان...",
  memoriesCopy: {
    heading: "لسه مفيش صور بتجمعنا...",
    swipeHint: "اسحبي وشوفي البراويز",
    closing: "وعشان البراويز دي تتملى صح، محتاجك تكملي معايا للآخر.",
    button: "هكمّل للآخر",
  },
  whyYou: {
    heading: "ليه إنتي؟",
    hint: "المسي كل واحدة",
    button: "لسه فيه أكتر",
    reasons: [
      { title: "قربك من ربنا", message: "حاجة جميلة جدًا.", icon: "faith" },
      { title: "عيونك", message: "عيونك اللي شبه الغزالة.", icon: "eyes" },
      { title: "رقتك", message: "بتبان في كل حاجة بتعمليها.", icon: "grace" },
      { title: "شطارتك", message: "شطارتك وتعبك في شغلك.", icon: "craft" },
      { title: "عيلتك", message: "عيلتك المحترمة، وتربيتك.", icon: "family" },
    ] as Reason[],
  },
  promise: {
    lines: [
      "مش هوعدك بحياة مثالية.",
      "بس أوعدك أتقي ربنا فيكي.",
      "وأصونك وأكرمك وأحفظ كرامتك.",
      "وأكون سندك في الحلو والصعب.",
      "ونبني بيت أساسه المودة والرحمة.",
      "وبصراحة خايف تضيعي مني، فمحتاج آخد الخطوة بجد.",
    ],
    closing: "فاضل حاجة واحدة بس...",
    button: "آخر لحظة",
  },
  finale: {
    eyebrow: "بكل احترام، وعلى سنة الله ورسوله",
    question: "تقبلي تتجوزيني يا إسراء؟",
    subline: "عايز أبدأ معاكي حياة ترضي ربنا.",
    yes: "موافقة، على بركة الله",
    moment: "محتاجة وقت أفكر وأستخير",
    no: ["مش موافقة", "حاولي تاني 😄", "مش هتعرفي 😅", "فكري تاني"],
    momentMessage: "خدي وقتك كله، واستخيري ربنا. وأي إجابة هتبقى على راسي.",
    momentReturn: "لما تبقي جاهزة",
    yesHeading: "على بركة الله",
    yesMessage: "الحمد لله. ابعتيلي رقم بابا أكلمه.",
    whatsapp: "ابعتيلي الرقم على واتساب",
    whatsappText: "السلام عليكم يا حليم، موافقة على بركة الله 🤍\nرقم بابا: ",
    signature: "إسراء وحليم",
  },
  ui: {
    skip: "تخطّي",
    close: "إغلاق",
    soundOn: "شغّل الصوت",
    soundOff: "اكتم الصوت",
    progress: "التقدّم",
    backTo: "ارجعي للجزء",
    secretLabel: "نور صغير مستخبي",
    secretDialog: "رسالة سرية",
    forward: "البرواز اللي بعده",
    backward: "البرواز اللي قبله",
    openFrame: "افتحي",
    revealReason: "اكشفي",
    switchLanguage: "English",
    restart: "ابدئي من الأول",
    restartConfirm: "متأكدة؟",
  },
};

export type Messages = typeof ar;

const en: Messages = {
  invitation: {
    lines: [
      "Every beautiful beginning has a moment...",
      "A moment that changes everything.",
      "Esoo, I have something to show you.",
    ],
    button: "BEGIN",
    soundHint: "Turn your sound on, and your silent switch off",
  },
  mystery: {
    lines: [
      "To the best UI/UX designer in the world...",
      "I know you notice every detail, so I made you this.",
    ],
    button: "LET'S GO",
  },
  secretMessage: "There's something I've wanted to tell you for a long time...",
  memoriesCopy: {
    heading: "We have no photos together yet...",
    swipeHint: "Swipe through the frames",
    closing: "For these frames to be filled the right way, I need you to see this through to the end.",
    button: "I'LL KEEP GOING",
  },
  whyYou: {
    heading: "Why you?",
    hint: "Touch each one",
    button: "THERE'S MORE",
    reasons: [
      { title: "Your Faith", message: "Your closeness to Allah is a beautiful thing.", icon: "faith" },
      { title: "Your Eyes", message: "Eyes like a gazelle's.", icon: "eyes" },
      { title: "Your Grace", message: "It shows in everything you do.", icon: "grace" },
      { title: "Your Talent", message: "Your skill, and how hard you work.", icon: "craft" },
      { title: "Your Family", message: "Your respectable family, and how you were raised.", icon: "family" },
    ],
  },
  promise: {
    lines: [
      "I don't promise you a perfect life.",
      "But I promise to fear Allah in how I treat you.",
      "To honor you, protect you, and guard your dignity.",
      "To stand by you through the easy days and the hard ones.",
      "And to build a home founded on affection and mercy.",
      "Honestly, I'm afraid of losing you, so I need to take this step for real.",
    ],
    closing: "There is just one thing left...",
    button: "ONE LAST MOMENT",
  },
  finale: {
    eyebrow: "IN THE WAY OF ALLAH AND HIS MESSENGER",
    question: "Esraa, will you marry me?",
    subline: "I want to begin a life with you that pleases Allah.",
    yes: "YES, WITH ALLAH'S BLESSING",
    moment: "I NEED TIME FOR ISTIKHARA",
    no: ["NO", "TRY AGAIN 😄", "NOT A CHANCE 😅", "THINK AGAIN"],
    momentMessage: "Take all the time you need, and pray istikhara. Whatever your answer, I will honor it.",
    momentReturn: "Whenever you're ready",
    yesHeading: "Alhamdulillah",
    yesMessage: "Now send me your father's number so I can call him.",
    whatsapp: "SEND IT ON WHATSAPP",
    whatsappText: "Assalamu alaikum Haleem, I accept, with Allah's blessing 🤍\nMy father's number: ",
    signature: "Esraa & Haleem",
  },
  ui: {
    skip: "SKIP",
    close: "Close",
    soundOn: "Turn sound on",
    soundOff: "Mute sound",
    progress: "Progress",
    backTo: "Go back to part",
    secretLabel: "A hidden light",
    secretDialog: "A secret message",
    forward: "Next frame",
    backward: "Previous frame",
    openFrame: "Open",
    revealReason: "Reveal",
    switchLanguage: "العربية",
    restart: "Start again",
    restartConfirm: "Are you sure?",
  },
};

export const messages: Record<Locale, Messages> = { ar, en };
