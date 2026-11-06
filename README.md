# The Moment

A cinematic, bilingual marriage proposal experience, built respectfully and in the way of Allah and His Messenger. Arabic is the default language, with a switch to English on the first screen.

Live at https://moment.framecasts.com

## The journey

1. **Invitation:** a quiet opening with a button to begin.
2. **Mystery:** a short message, plus a hidden light that opens a secret note.
3. **Frames:** animated illustrations in place of photos, each with a personal line.
4. **Why you:** five cards, each revealing a quality when touched.
5. **Promise:** a written promise, line by line.
6. **Finale:** a 3D ring box opens to its own music, then the voice message, then the question.

The answers on the final screen:

- **Yes:** a celebration, a request for her father's number, and a WhatsApp button.
- **Need time:** a real choice that respects her decision, with time for istikhara.
- **No:** a playful button that runs away from the mouse and from touch.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress is saved per browser tab, so open a new tab to start again.

## Edit the content

No component needs to change. All content lives in `src/data/`:

| File | What it holds |
| --- | --- |
| `src/data/messages.ts` | Every word on screen, in Arabic (`ar`) and English (`en`) |
| `src/data/memories.ts` | The frames: illustration, title, and line in each language |
| `src/data/proposal.ts` | WhatsApp number and audio file paths |

## Sound

Audio files live in `public/audio/`:

| File | When it plays |
| --- | --- |
| `theme.mp3` | Background music for the whole story |
| `ring-open.mp3` | Once, as the ring box opens |
| `voice.mp3` | The voice message, right before the question |

`voice.mp3` is currently AI-generated. To use your own recording, replace the file and deploy:

```bash
ffmpeg -i recording.m4a -b:a 64k -ac 1 public/audio/voice.mp3
```

Keep files small for slow connections. If `theme.mp3` is missing, a soft generated score plays. If `voice.mp3` is missing, that step is skipped.

## WhatsApp button

Set `whatsappNumber` in `src/data/proposal.ts`, using the country code without a plus sign. An empty value hides the button. The number is visible in the page code, so share the link only with her.

## Deploy

The site runs in its own container on the Framecast server, at `/srv/apps/the-moment`. Build and publish any change with:

```bash
./deploy/deploy.sh
```

This builds on your computer, so the server only receives the finished output. If the new version fails to start, the server goes back to the previous one.

`deploy/server-setup.sh` is the one-time setup of the multi-project system. It has already been run, and running it again does nothing.

## Add another project to the server

Each project gets its own container and subdomain. Full steps are in `/srv/apps/README.md` on the server:

```bash
/srv/apps/bin/app-deploy my-app
```

```bash
/srv/apps/bin/app-site my-app my-app.framecasts.com
```

## Before sharing the link

- Test the full journey on a real phone, with the sound on.
- On iPhone, the silent switch mutes the sound. The first screen reminds her of this.

## Tech stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP, React Three Fiber, and Howler.js.
