/** Play a short kitchen alert chime (no audio file needed). */
export function playNewOrderSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const tones = [880, 1174, 1480];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + i * 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + 0.35 + i * 0.12);
    });

    window.setTimeout(() => {
      void ctx.close();
    }, 1200);
  } catch {
    // Autoplay may be blocked until the admin interacts with the page.
  }
}
