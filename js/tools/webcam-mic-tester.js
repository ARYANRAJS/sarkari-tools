/* ═══════════════════════════════════════════════════
   WEBCAM & MICROPHONE HARDWARE TESTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const webcamVideo = document.getElementById('webcamVideo');
  const cameraPrompt = document.getElementById('cameraPrompt');
  const videoStatusBadge = document.getElementById('videoStatusBadge');
  const btnStartCam = document.getElementById('btnStartCam');
  const btnStopCam = document.getElementById('btnStopCam');
  const btnMirror = document.getElementById('btnMirror');
  const btnTakeSnap = document.getElementById('btnTakeSnap');

  const specRes = document.getElementById('specRes');
  const specFps = document.getElementById('specFps');
  const specRatio = document.getElementById('specRatio');
  const micLevelBar = document.getElementById('micLevelBar');
  const micDbLevel = document.getElementById('micDbLevel');
  const btnTestAudio = document.getElementById('btnTestAudio');

  let mediaStream = null;
  let audioContext = null;
  let analyser = null;
  let animFrameId = null;
  let isMirrored = false;

  async function startHardwareTest() {
    try {
      btnStartCam.disabled = true;
      videoStatusBadge.textContent = 'Requesting access...';

      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true
      });

      webcamVideo.srcObject = mediaStream;
      cameraPrompt.style.display = 'none';
      webcamVideo.style.display = 'block';
      videoStatusBadge.textContent = '● Live Camera Active';
      videoStatusBadge.style.background = '#15803d';

      btnStopCam.disabled = false;
      btnTakeSnap.disabled = false;

      // Extract video track specs
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const w = settings.width || 1280;
        const h = settings.height || 720;
        specRes.textContent = `${w} × ${h} px`;
        specFps.textContent = `${settings.frameRate ? Math.round(settings.frameRate) : 30} FPS`;
        specRatio.textContent = settings.aspectRatio ? settings.aspectRatio.toFixed(2) : (w / h).toFixed(2);
      }

      // Audio Level Analyzer
      setupAudioMeter(mediaStream);

    } catch (err) {
      console.error(err);
      videoStatusBadge.textContent = 'Access Denied / Not Found';
      videoStatusBadge.style.background = '#b91c1c';
      alert('Could not access camera or microphone. Please check your browser permissions.');
      btnStartCam.disabled = false;
    }
  }

  function setupAudioMeter(stream) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateMeter() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const pct = Math.min(100, Math.round((avg / 128) * 100));

        micLevelBar.style.width = `${pct}%`;
        micDbLevel.textContent = `${pct}%`;

        animFrameId = requestAnimationFrame(updateMeter);
      }
      updateMeter();
    } catch (e) {
      console.warn('Audio meter initialization error:', e);
    }
  }

  function stopHardwareTest() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
    }

    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    cameraPrompt.style.display = 'block';
    videoStatusBadge.textContent = 'Camera Inactive';
    videoStatusBadge.style.background = 'rgba(0,0,0,0.7)';

    btnStartCam.disabled = false;
    btnStopCam.disabled = true;
    btnTakeSnap.disabled = true;

    specRes.textContent = '-';
    specFps.textContent = '- FPS';
    specRatio.textContent = '-';
    micLevelBar.style.width = '0%';
    micDbLevel.textContent = '0%';
  }

  // Mirror toggle
  btnMirror.addEventListener('click', () => {
    isMirrored = !isMirrored;
    if (isMirrored) {
      webcamVideo.classList.add('mirrored');
    } else {
      webcamVideo.classList.remove('mirrored');
    }
  });

  // Snapshot
  btnTakeSnap.addEventListener('click', () => {
    if (!webcamVideo.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = webcamVideo.videoWidth;
    canvas.height = webcamVideo.videoHeight;
    const ctx = canvas.getContext('2d');

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = `camera_snapshot_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Speaker Tone Test
  btnTestAudio.addEventListener('click', () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();

    // Play clean two-tone chime (440Hz -> 880Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);

    const orig = btnTestAudio.innerHTML;
    btnTestAudio.innerHTML = '🔊 Playing Chime...';
    setTimeout(() => { btnTestAudio.innerHTML = orig; }, 1000);
  });

  btnStartCam.addEventListener('click', startHardwareTest);
  btnStopCam.addEventListener('click', stopHardwareTest);

})();
