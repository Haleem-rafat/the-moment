const ANDROID_PULSE_MS = 15;

let iosSwitch: HTMLLabelElement | null = null;
let firing = false;

/**
 * Safari on iPhone has no vibration API, but toggling its native switch control
 * gives a small system haptic on recent iOS versions, so a hidden one is used there.
 */
function iosHaptic() {
  if (!iosSwitch) {
    iosSwitch = document.createElement("label");
    iosSwitch.setAttribute("aria-hidden", "true");
    iosSwitch.style.cssText = "position:fixed;left:-100px;top:0;opacity:0;pointer-events:none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.tabIndex = -1;
    input.setAttribute("switch", "");
    iosSwitch.append(input);
    document.body.append(iosSwitch);
  }
  firing = true;
  iosSwitch.click();
  firing = false;
}

/** A small vibration. Must be called from a click, and does nothing where it isn't supported. */
export function hapticTap() {
  if (firing) return; // The hidden switch's own click lands back here.
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(ANDROID_PULSE_MS);
    return;
  }
  iosHaptic();
}
