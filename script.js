// script.js - external protected content + internal CSS injection
// Polls for window.__enteredPassword set by the editor fake form.
// If it matches REAL_SECRET -> inject protected content and start scripts.

(function () {
  // === REAL secret only in external file ===
  const REAL_SECRET = "MyUltraSecretPass123"; // <-- change this to your real secret

  // Poll configuration
  const POLL_INTERVAL_MS = 400;
  const POLL_TIMEOUT_MS = 1000 * 60 * 3; // stop polling after 3 minutes

  // Insert CSS for protected content (so the editor CSS remains separate)
  function injectProtectedCSS() {
    const css = `
      /* Protected content CSS injected by external script */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

      html,body {
        height: 100%;
        margin: 0;
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #2C2A4A 0%, #1F1B38 100%);
      }

      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .card-container {
        width: 300px;
        height: 400px;
        position: relative;
        margin-bottom: 40px;
      }

      .card {
        padding: 0 15px;
        width: 300px;
        height: 400px;
        border-radius: 20px;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 1.2rem;
        text-align: center;
        color: #fff;
        transition: transform 0.3s ease;
      }

      .card1 { background: pink; transform: rotate(10deg); color: #4D2B4F; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card2 { background: #DDBEA9; transform: rotate(0deg); color: #4E3A2F; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card3 { background: #A8DADC; transform: rotate(-10deg); color: #1E2A2F; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card4 { background: #CDE7BE; transform: rotate(0deg); color: #3F5E33; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card5 { background: #FAD6FF; transform: rotate(10deg); color: #553D60; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card6 { background: #FFE5B4; transform: rotate(0deg); color: #5A4337; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card7 { background: #BFD8B8; transform: rotate(-10deg); color: #354F32; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card8 { background: #FFB5A7; transform: rotate(0deg); color: #6E2E2E; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card9 { background: #F6BD60; transform: rotate(10deg); color: #5C3B1F; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      .card11{ background: #DDBEA9; transform: rotate(-10deg); color: #4E3A2F; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

      .button-group { display:flex; gap:20px; }
      .button-group button {
        padding: 10px 20px; font-size: 1rem; border: none; border-radius: 8px; cursor:pointer; background:#111827; color:#fff;
      }
      .button-group button:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Audio toggle */
      .audio-toggle { position: fixed; top: 20px; right: 20px; width: 30px; height: 20px; display:flex; justify-content:space-between; cursor:pointer; z-index:9999; }
      #tap-message { position: fixed; top: 55px; right: 20px; font-size: 12px; color: #fff; background: rgba(0,0,0,0.6); padding:4px 8px; border-radius:6px; cursor:pointer; z-index:9998; opacity:0; transform: translateY(-10px); }
      .audio-toggle .bar { width:4px; background:#000; border-radius:2px; animation: pulse 1s infinite ease-in-out; animation-play-state: paused; }
      .audio-toggle .bar:nth-child(1){ animation-delay: 0s; } .audio-toggle .bar:nth-child(2){ animation-delay:0.2s; } .audio-toggle .bar:nth-child(3){ animation-delay:0.4s; } .audio-toggle .bar:nth-child(4){ animation-delay:0.6s; }
      @keyframes pulse { 0% { height:5px;} 50% { height:20px;} 100% { height:5px;} }

      footer { position: fixed; bottom: 10px; left: 20px; color:#bfbfbf; font-size:0.8rem; }
    `;
    const style = document.createElement("style");
    style.id = "protected-styles";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // Build & inject protected HTML (keeps editor HTML empty)
  function injectProtectedHTML() {
    // Clear editor shell content if present
    const shell = document.getElementById("editor-shell");
    if (shell) shell.innerHTML = ""; // remove the fake form UI

    // Create app container
    const app = document.createElement("div");
    app.id = "app";
    app.innerHTML = `
      <audio id="bg-audio" src="https://raw.githubusercontent.com/bhavya-kaushik/audio/main/Audio1.mp3" loop></audio>
      <div id="tap-message">Tap to play audio</div>
      <div class="audio-toggle" id="audio-toggle">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </div>

      <div class="wrapper">
        <div class="card-container">
          <div class="card card1">Hey Beautiful!</div>
          <div class="card card2">I hope you are doing well.</div>
          <div class="card card3">I thought this is the best time to send this otherwise you'll be busy.</div>
          <div class="card card4">Also, it's been soooo long since I wrote you a cutie lil message🥺. So here it is...</div>
          <div class="card card5">Time is running like crazy and I just wish it paused for a bit. But it doesn’t. Or maybe it does… when I’m with you😜. But I’m not getting that either.</div>
          <div class="card card6">Anyway, no more senti baatein. Because you're not just going for a degree, you’re going after your dream!</div>
          <div class="card card7">Tumne ek bohot hi amazing institute mein admission liya hai, and I know you’re super happy about it. But I also know thodi si nervousness bhi ho rhi hogi. Lekin you just need to know that you'll be the brightest star shining in the sky of IIM Calcutta💫</div>
          <div class="card card8">Maine ek bhot hi pyaari baat padhi thi...<br/><br/><i>If you're depressed, you're living in the past. If you're anxious, you're living in the future. But if you're at peace, then you're living in present.</i><br/>Feel your peace...because it lies just here, with your current self</div>
          <div class="card card9">Also, agar thodi si bhi nervousness reh gayi ho, just remember... there’s someone who’s always praying for you. So look around carefully, something cute will definitely catch your eye... aur <br/><i>vahan meri dua tumhe mil jaayegi</i>🌸</div>
          <div class="card card11">Andddd...maine maan li tumhari Baby Ele wali baat!!!</div>
        </div>
        <div class="button-group">
          <button class="prev">Prev</button>
          <button class="next">Next</button>
        </div>
      </div>
      <footer>Last Updated on June 7, 2025, 10:23pm</footer>
    `;
    document.body.appendChild(app);
  }

  // Init animation + audio logic (uses GSAP loaded by the editor HTML)
  function initProtectedScripts() {
    // Defensive: wait until DOM elements exist
    const attemptInit = () => {
      const cards = Array.from(document.querySelectorAll(".card"));
      const nextBtn = document.querySelector(".next");
      const prevBtn = document.querySelector(".prev");
      const audio = document.getElementById("bg-audio");
      const bars = document.querySelectorAll(".bar");
      const toggle = document.getElementById("audio-toggle");
      const tapMessage = document.getElementById("tap-message");

      if (!cards.length || !nextBtn || !prevBtn || !audio || !toggle) {
        // try again shortly
        setTimeout(attemptInit, 80);
        return;
      }

      // Card logic
      let cardOrder = [...cards];
      let currentIndex = 0;

      function updateZIndexes() {
        cardOrder.forEach((card, index) => card.style.zIndex = cards.length - index);
      }
      function updateButtons() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 1;
      }
      updateZIndexes();
      updateButtons();

      function animateAndReorder(direction) {
        const topCard = cardOrder[0];
        if (!window.gsap) {
          // fallback instant reorder without animation
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

        window.gsap.to(topCard, {
          y: -100,
          scale: 0.9,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
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
            window.gsap.set(topCard, { y: 0, scale: 1, opacity: 1 });
          }
        });
      }

      nextBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) animateAndReorder("next");
      });
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) animateAndReorder("prev");
      });

      // Audio toggle behavior
      let isPlaying = false;
      if (tapMessage) {
        if (window.gsap) {
          window.gsap.to("#tap-message", { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.5 });
        } else {
          tapMessage.style.opacity = 1;
          tapMessage.style.transform = "translateY(0)";
        }
      }

      toggle.addEventListener("click", () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audio.play().catch(()=>{});
          bars.forEach(bar => bar.style.animationPlayState = "running");
          if (window.gsap) {
            window.gsap.to("#tap-message", { opacity: 0, y: -10, duration: 0.5, ease: "power2.in", onComplete: () => {
              const t = document.getElementById("tap-message");
              if (t) t.style.display = "none";
            }});
          } else {
            const t = document.getElementById("tap-message");
            if (t) t.style.display = "none";
          }
        } else {
          audio.pause();
          bars.forEach(bar => bar.style.animationPlayState = "paused");
        }
      });
    };

    attemptInit();
  }

  // Poll for editor-entered password and validate
  function pollForPasswordAndUnlock() {
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.__enteredPassword !== undefined) {
        const entered = String(window.__enteredPassword || "");
        // Clear the global to reduce chance of accidental leak
        try { delete window.__enteredPassword; } catch (e) { window.__enteredPassword = undefined; }

        if (entered === REAL_SECRET) {
          clearInterval(timer);
          // inject CSS + content + scripts
          injectProtectedCSS();
          injectProtectedHTML();
          initProtectedScripts();
        } else {
          clearInterval(timer);
          // wrong secret: silently do nothing (editor still shows fake message)
          // Optionally log to console to remind owner
          console.warn("Protected content: incorrect secret entered.");
        }
        return;
      }

      // stop polling after timeout
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);
  }

  // Start polling on load
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", pollForPasswordAndUnlock);
  } else {
    pollForPasswordAndUnlock();
  }
})();
