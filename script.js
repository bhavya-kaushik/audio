// script.js - external protected content + robust delivery listeners
// - Exposes window._protected_unlock(entered) so the editor can call it directly
// - Listens for custom event "protected:entered"
// - Polls window.__enteredPassword as a fallback
// On correct secret -> overlays the protected UI and runs scripts.

(function () {
  // ---------- CONFIG ----------
  const REAL_SECRET = "MyUltraSecretPass123"; // <-- CHANGE THIS to your real secret
  const POLL_INTERVAL_MS = 300;
  const POLL_TIMEOUT_MS = 1000 * 60 * 3; // 3 minutes
  // ----------------------------

  let pollTimer = null;
  let timeoutTimer = null;
  let unlocked = false;

  // Defensive helper for safe deletion of the global
  function clearGlobalEntered() {
    try { delete window.__enteredPassword; } catch (e) { window.__enteredPassword = undefined; }
  }

  // The unified handler when we receive an entered string
  function handleEntered(raw) {
    if (unlocked) return;
    const entered = String(raw || "");
    // Clear the global immediately to reduce accidental exposure
    clearGlobalEntered();

    if (!entered) {
      console.warn("Protected content: empty entry received.");
      return;
    }

    if (entered === REAL_SECRET) {
      unlocked = true;
      stopPolling();
      unlockProtectedContent();
    } else {
      // wrong secret: do nothing UI-wise (editor shows the fake message)
      console.warn("Protected content: incorrect secret entered.");
    }
  }

  // Expose direct method for editor to call (preferred)
  window._protected_unlock = function (entered) {
    try { handleEntered(entered); } catch (e) { console.error(e); }
  };

  // Event listener fallback
  window.addEventListener("protected:entered", (ev) => {
    try { handleEntered(ev.detail); } catch (e) { console.error(e); }
  });

  // Polling fallback (in case event was dispatched before this script loaded)
  function startPolling() {
    const start = Date.now();
    pollTimer = setInterval(() => {
      if (window.__enteredPassword !== undefined) {
        const v = window.__enteredPassword;
        clearGlobalEntered();
        handleEntered(v);
        return;
      }
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);

    timeoutTimer = setTimeout(stopPolling, POLL_TIMEOUT_MS + 1000);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
  }

  // ---------- Protected content injection ----------
  function unlockProtectedContent() {
    // 1) Remove/fade the editor shell if present (only remove the shell node)
    const shell = document.getElementById("editor-shell");
    if (shell) {
      try { shell.remove(); } catch (e) { shell.innerHTML = ""; }
    }

    // 2) Inject a full-screen overlay root that contains the protected UI
    const root = document.createElement("div");
    root.id = "protected-root";
    // minimal inline style to ensure it overlays editor UI and is full-screen
    root.style.position = "fixed";
    root.style.top = 0;
    root.style.left = 0;
    root.style.width = "100%";
    root.style.height = "100%";
    root.style.zIndex = 2147483647; // very high
    root.style.display = "flex";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    // root.style.background = "linear-gradient(180deg,#2C2A4A 0%, #1F1B38 100%)";
    root.style.background = "#FFF";
    root.style.overflow = "hidden";

    // Protected markup (put your content here)
    root.innerHTML = `
      <div id="protected-app" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
        <div style="max-width:720px;width:100%;padding:28px;box-sizing:border-box;">
          <audio id="bg-audio" src="https://raw.githubusercontent.com/bhavya-kaushik/audio/main/Audio1.mp3" loop></audio>
          <div id="tap-message" style="position:fixed;top:55px;right:20px;font-size:12px;color:#fff;background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:6px;cursor:pointer;opacity:0;transform:translateY(-10px);z-index:9998;">Tap to play audio</div>
          <div class="audio-toggle" id="audio-toggle" style="position:fixed;top:20px;right:20px;width:30px;height:20px;display:flex;justify-content:space-between;cursor:pointer;z-index:9999;">
            <span class="bar" style="width:4px;background:#000;border-radius:2px;animation:pulse 1s infinite ease-in-out;animation-play-state:paused;"></span>
            <span class="bar" style="width:4px;background:#000;border-radius:2px;animation:pulse 1s infinite ease-in-out;animation-play-state:paused;animation-delay:0.2s;"></span>
            <span class="bar" style="width:4px;background:#000;border-radius:2px;animation:pulse 1s infinite ease-in-out;animation-play-state:paused;animation-delay:0.4s;"></span>
            <span class="bar" style="width:4px;background:#000;border-radius:2px;animation:pulse 1s infinite ease-in-out;animation-play-state:paused;animation-delay:0.6s;"></span>
          </div>

          <div class="wrapper" style="display:flex;flex-direction:column;align-items:center;">
            <div class="card-container" style="width:300px;height:400px;position:relative;margin-bottom:40px;">
              <div class="card card1" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#4D2B4F;background:pink;transform:rotate(10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Hey Beautiful!</div>
              <div class="card card2" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#4E3A2F;background:#DDBEA9;transform:rotate(0deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">I hope you are doing well.</div>
              <div class="card card3" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#1E2A2F;background:#A8DADC;transform:rotate(-10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">I thought this is the best time to send this otherwise you'll be busy.</div>
              <div class="card card4" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#3F5E33;background:#CDE7BE;transform:rotate(0deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Also, it's been soooo long since I wrote you a cutie lil message🥺. So here it is...</div>
              <div class="card card5" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#553D60;background:#FAD6FF;transform:rotate(10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Time is running like crazy and I just wish it paused for a bit. But it doesn’t. Or maybe it does… when I’m with you😜. But I’m not getting that either.</div>
              <div class="card card6" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#5A4337;background:#FFE5B4;transform:rotate(0deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Anyway, no more senti baatein. Because you're not just going for a degree, you’re going after your dream!</div>
              <div class="card card7" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#354F32;background:#BFD8B8;transform:rotate(-10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Tumne ek bohot hi amazing institute mein admission liya hai, and I know you’re super happy about it. But I also know thodi si nervousness bhi ho rhi hogi. Lekin you just need to know that you'll be the brightest star shining in the sky of IIM Calcutta💫</div>
              <div class="card card8" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#6E2E2E;background:#FFB5A7;transform:rotate(0deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Maine ek bhot hi pyaari baat padhi thi...<br/><br/><i>If you're depressed, you're living in the past. If you're anxious, you're living in the future. But if you're at peace, then you're living in present.</i><br/>Feel your peace...because it lies just here, with your current self</div>
              <div class="card card9" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#5C3B1F;background:#F6BD60;transform:rotate(10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);">Also, agar thodi si bhi nervousness reh gayi ho, just remember... there’s someone who’s always praying for you. So look around carefully, something cute will definitely catch your eye... aur <br/><i>vahan meri dua tumhe mil jaayegi</i>🌸</div>
              <!-- <div class="card card10" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#5A4337;background:#FFE5B4;transform:rotate(0deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);"></div> --> 
              <div class="card card11" style="padding:0 15px;width:300px;height:400px;border-radius:20px;position:absolute;top:0;left:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:1.2rem;text-align:center;color:#4E3A2F;background:#DDBEA9;transform:rotate(-10deg);box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);"><!-- Btw Who is Baby Ele? Tumhe koi pasand aa gya hai na? Maine favourite animal name iss pen ka naam rakhne ke liye hi pucha tha but phir maine ek post mein dekha ki tumhari life mein ek Baby Ele exist krta hai😏...<br/> Now give me details!!! --> Andddd...maine maan li tumhari Baby Ele wali baat!!! </div> 
            </div> 
            <div class="button-group" style="display:flex;gap:20px;">
              <button class="prev" style="padding:10px 20px;border-radius:8px;border:none;background:#111827;color:#fff;cursor:pointer;">Prev</button>
              <button class="next" style="padding:10px 20px;border-radius:8px;border:none;background:#111827;color:#fff;cursor:pointer;">Next</button>
            </div>
          </div> 
          <!-- <footer style="position:fixed;bottom:10px;left:20px;color:#bfbfbf;font-size:0.8rem;">Last Updated on June 7, 2025, 10:23pm<footer> -->
        </div>
      </div>

      <style>
        @keyframes pulse { 0% { height:5px;} 50% { height:20px;} 100% { height:5px;} }
      </style>
    `;

    document.body.appendChild(root);

    // After markup insertion, initialize interactivity
    initProtectedScripts(root);
  }

  // Initialize animations & audio within the protected root only
  function initProtectedScripts(root) {
    // Scope queries inside root for safety
    const get = (sel) => root.querySelector(sel);

    const cards = Array.from(root.querySelectorAll(".card"));
    const nextBtn = get(".next");
    const prevBtn = get(".prev");
    const audio = get("#bg-audio");
    const bars = root.querySelectorAll(".bar");
    const toggle = get("#audio-toggle");
    const tapMessage = get("#tap-message");

    let cardOrder = [...cards];
    let currentIndex = 0;

    function updateZIndexes() {
      cardOrder.forEach((card, index) => card.style.zIndex = cards.length - index);
    }
    function updateButtons() {
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;
    }
    updateZIndexes();
    updateButtons();

    function animateAndReorder(direction) {
  if (!cardOrder.length) return;

  if (!window.gsap) {
    // fallback instant reorder
    if (direction === "next") {
      const shifted = cardOrder.shift();
      cardOrder.push(shifted);
      currentIndex++;
    } else {
      const popped = cardOrder.pop();
      cardOrder.unshift(popped);
      currentIndex--;
    }
    updateZIndexes();
    updateButtons();
    return;
  }

  if (direction === "next") {
    const topCard = cardOrder[0];

    // animate current card out
    window.gsap.to(topCard, {
      y: -100,
      scale: 0.9,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        const shifted = cardOrder.shift();
        cardOrder.push(shifted);
        currentIndex++;
        updateZIndexes();
        updateButtons();
        // reset hidden card for reuse
        window.gsap.set(topCard, { y: 0, scale: 1, opacity: 1 });
      }
    });
  } else if (direction === "prev") {
    // reorder first
    const popped = cardOrder.pop();
    cardOrder.unshift(popped);
    currentIndex--;
    updateZIndexes();
    updateButtons();

    const newTop = cardOrder[0];
    // start off-screen (above, faded, smaller)
    window.gsap.set(newTop, { y: -100, scale: 0.9, opacity: 0 });
    // animate it down into place
    window.gsap.to(newTop, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    });
  }
}

    if (nextBtn) nextBtn.addEventListener("click", () => { if (currentIndex < cards.length - 1) animateAndReorder("next"); });
    if (prevBtn) prevBtn.addEventListener("click", () => { if (currentIndex > 0) animateAndReorder("prev"); });

    // Audio toggle
    if (tapMessage && window.gsap) {
      window.gsap.to(tapMessage, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.5 });
    } else if (tapMessage) {
      tapMessage.style.opacity = 1;
    }

    let isPlaying = false;
    if (toggle) {
      toggle.addEventListener("click", () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audio && audio.play().catch(() => {});
          bars.forEach(bar => bar.style.animationPlayState = "running");
          if (tapMessage) {
            if (window.gsap) {
              window.gsap.to(tapMessage, { opacity: 0, y: -10, duration: 0.5, ease: "power2.in", onComplete: () => { tapMessage.style.display = "none"; }});
            } else {
              tapMessage.style.display = "none";
            }
          }
        } else {
          audio && audio.pause();
          bars.forEach(bar => bar.style.animationPlayState = "paused");
        }
      });
    }
  }

  // ---------- Start everything ----------
  // If a password was set earlier (before this script loaded), check it now
  if (window.__enteredPassword !== undefined) {
    const tmp = window.__enteredPassword;
    clearGlobalEntered();
    handleEntered(tmp);
  }

  // Start polling and leave event + direct call available
  startPolling();

  // Expose a small debugging helper (optional)
  window._PROTECTED_DEBUG = {
    unlockNow: (pw) => { try { handleEntered(pw); } catch (e) { console.error(e); } },
    isUnlocked: () => unlocked
  };
})();
