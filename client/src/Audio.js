// Ek hi shared AudioContext rakhte hain poori app ke liye. Har baar naya
// AudioContext() banane se browser ka autoplay policy usse "suspended"
// state mein create karta hai jab tak fresh user gesture na ho — isse
// background se wapas aane ke baad alarm silently fail ho jaata tha.
//
// Yahan hum ek hi instance banate hain aur har click/touch par usse resume
// karte hain, taaki jab bhi alarm khud-ba-khud (GPS ya timer callback se)
// fire ho, context already unlocked mile.

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function unlock() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch((err) => console.log('Audio unlock failed:', err.message));
  }
}

document.addEventListener('click', unlock);
document.addEventListener('touchstart', unlock);

export { getAudioContext };