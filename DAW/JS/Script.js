        const instruments = ['Kick', 'Snare', 'Hi-Hat'];
        const numSteps = 16;
        let isPlaying = false;
        let currentStep = 0;
        let timerId = null;
        
        // Matriz de estados (instrumento x passo)
        const grid = Array(instruments.length).fill().map(() => Array(numSteps).fill(false));

        // Contexto de Áudio da Web
        let audioCtx = null;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        // Criar o Grid visualmente
        const gridContainer = document.getElementById('sequencerGrid');
        instruments.forEach((inst, rIndex) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track';

            const label = document.createElement('div');
            label.className = 'track-label';
            label.innerText = inst;
            trackDiv.appendChild(label);

            const stepsDiv = document.createElement('div');
            stepsDiv.className = 'steps';

            for (let sIndex = 0; sIndex < numSteps; sIndex++) {
                const stepBtn = document.createElement('div');
                stepBtn.className = 'step';
                stepBtn.dataset.row = rIndex;
                stepBtn.dataset.col = sIndex;
                
                stepBtn.addEventListener('click', () => {
                    grid[rIndex][sIndex] = !grid[rIndex][sIndex];
                    stepBtn.classList.toggle('selected');
                });

                stepsDiv.appendChild(stepBtn);
            }

            trackDiv.appendChild(stepsDiv);
            gridContainer.appendChild(trackDiv);
        });

        // Gerador de sons simples (Sintetizador básico)
        function playSound(instrumentIndex) {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (instrumentIndex === 0) {
                // Bumbo (Kick): som grave com queda rápida de frequência
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
                gainNode.gain.setValueAtTime(1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (instrumentIndex === 1) {
                // Caixa (Snare): tom misto/ruído simulado
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (instrumentIndex === 2) {
                // Hi-Hat (Prato): som mais agudo e curto
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            }
        }

        // Lógica do Loop de Reprodução
        function runStep() {
            const bpm = document.getElementById('bpmInput').value;
            const interval = (60 / bpm / 4) * 1000; // Semicolcheias (16 passos por compasso 4/4)

            // Atualiza destaque visual dos passos correntes e anteriores
            const allSteps = document.querySelectorAll('.step');
            allSteps.forEach(step => {
                const col = parseInt(step.dataset.col);
                if (col === currentStep) {
                    step.classList.add('playing');
                } else {
                    step.classList.remove('playing');
                }
            });

            // Toca os instrumentos ativos no passo atual
            grid.forEach((row, rIndex) => {
                if (row[currentStep]) {
                    playSound(rIndex);
                }
            });

            currentStep = (currentStep + 1) % numSteps;
            timerId = setTimeout(runStep, interval);
        }

        function togglePlay() {
            initAudio();
            const btn = document.getElementById('playBtn');
            isPlaying = !isPlaying;

            if (isPlaying) {
                btn.innerText = 'Stop';
                btn.classList.add('playing');
                currentStep = 0;
                runStep();
            } else {
                btn.innerText = 'Play';
                btn.classList.remove('playing');
                clearTimeout(timerId);
                // Remove destaque visual ao parar
                document.querySelectorAll('.step').forEach(s => s.classList.remove('playing'));
            }
        }