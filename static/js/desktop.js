// static/js/desktop.js

document.addEventListener('DOMContentLoaded', () => {
    // 기존 아이콘은 그대로 유지 (HTML에서 제거되었지만 JS 변수는 남겨둠)
    // const iconNotepad = document.getElementById('icon-notepad');
    // const iconMyDocuments = document.getElementById('icon-my-documents');

    const iconMyComputer = document.getElementById('icon-my-computer');
    const iconRecycleBin = document.getElementById('icon-recycle-bin');
    const iconMessages = document.getElementById('icon-messages'); // 메시지 앱 아이콘
    const iconGame = document.getElementById('icon-game'); // 게임 앱 아이콘
    const currentTimeSpan = document.getElementById('current-time');

    // 시계 업데이트 함수
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        currentTimeSpan.textContent = `${hours}:${minutes} ${ampm}`;
    }

    // 시계 초기화 및 1분마다 업데이트
    updateClock();
    setInterval(updateClock, 60000); // 1분마다 업데이트

    // --- 기존 아이콘 이벤트 리스너 ---

    // 내 컴퓨터 아이콘 더블 클릭 이벤트
    iconMyComputer.addEventListener('dblclick', () => {
        const myComputerWindowId = 'my-computer-window-' + Date.now();
        const myComputerContent = `
            <div style="padding: 10px;">
                <p>로컬 디스크 (C:)</p>
                <p>CD 드라이브 (D:)</p>
                <hr>
                <p>CPU: Intel Pentium</p>
                <p>RAM: 32MB</p>
            </div>
        `;
        // createWindow는 이제 생성된 DOM 요소를 직접 반환합니다.
        windowManager.createWindow(myComputerWindowId, '내 컴퓨터', myComputerContent, 500, 350, '/static/images/icon_computer.png');
    });

    // 휴지통 아이콘 더블 클릭 이벤트
    iconRecycleBin.addEventListener('dblclick', () => {
        const recycleBinWindowId = 'recycle-bin-window-' + Date.now();
        const recycleBinContent = `
            <div style="padding: 10px;">
                <p>휴지통이 비어 있습니다.</p>
                <button class="button-3d-outset">휴지통 비우기</button>
            </div>
        `;
        windowManager.createWindow(recycleBinWindowId, '휴지통', recycleBinContent, 300, 200, '/static/images/icon_recycle_bin.png');
    });

    // --- 새로운 앱 아이콘 이벤트 리스너 (window-opened 이벤트 활용) ---

    // 메시지 앱 아이콘 더블 클릭 이벤트
    // 메시지 앱 아이콘 더블 클릭 이벤트
    iconMessages.addEventListener('dblclick', () => {
        const messageWindowId = 'messages-window-' + Date.now();
        const messageContent = `
            <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box;">
                <div id="chat-display-${messageWindowId}" style="flex-grow: 1; border: 1px solid #808080; background-color: #fff; padding: 10px; overflow-y: auto; margin-bottom: 10px; font-family: 'MS Sans Serif', sans-serif; font-size: 14px;">
                    <p><strong>개발자 '미스터 칩스':</strong> 어서 와, ${localStorage.getItem('username') || '사용자'}! 뭔가 궁금한 게 있나? 난 이 OS를 만든 '미스터 칩스'라고 하네.</p>
                </div>
                <div style="display: flex;">
                    <input type="text" id="chat-input-${messageWindowId}" placeholder="미스터 칩스에게 메시지를 입력하세요..." style="flex-grow: 1; padding: 5px; border: 1px solid #808080; background-color: #fff; font-family: 'MS Sans Serif', sans-serif; font-size: 14px;">
                    <button id="chat-send-button-${messageWindowId}" class="button-3d-outset" style="margin-left: 5px; min-width: 60px;">보내기</button>
                </div>
            </div>
        `;
        const createdWindowElement = windowManager.createWindow(messageWindowId, '미스터 칩스에게 메시지', messageContent, 500, 400, '/static/images/icon_documents.png');

        createdWindowElement.addEventListener('window-opened', (e) => {
            const currentWindowId = e.detail.windowId;
            const chatInput = document.getElementById(`chat-input-${currentWindowId}`);
            const chatSendButton = document.getElementById(`chat-send-button-${currentWindowId}`);
            const chatDisplay = document.getElementById(`chat-display-${currentWindowId}`);

            const handleSendMessage = () => {
                const userMessage = chatInput.value.trim();
                if (userMessage) {
                    chatDisplay.innerHTML += `<p><strong>${localStorage.getItem('username') || '나'}:</strong> ${userMessage}</p>`;
                    chatInput.value = '';
                    chatDisplay.scrollTop = chatDisplay.scrollHeight;

                    setTimeout(() => {
                        let botResponse = "음... 그건 내가 예상치 못한 질문이로군. 좀 더 자세히 말해주겠나?";
                        const lowerCaseMessage = userMessage.toLowerCase();

                        if (lowerCaseMessage.includes("안녕") || lowerCaseMessage.includes("안녕하세요")) {
                            botResponse = "오, 그래 안녕! 반가워. 뭘 도와줄까?";
                        } else if (lowerCaseMessage.includes("날씨")) {
                            botResponse = "날씨 말인가? 여기 내 창 밖은 늘 코드와 전선 뿐이라... 밖의 날씨는 직접 확인해봐야 할 걸세!";
                        } else if (lowerCaseMessage.includes("시간")) {
                            const now = new Date();
                            botResponse = `지금은 대략 ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}일세. 코드 짜기 딱 좋은 시간이지.`;
                        } else if (lowerCaseMessage.includes("이름")) {
                            botResponse = "내 이름은 '미스터 칩스'일세. 이 멋진 LLM OS의 개발자 중 한 명이지.";
                        } else if (lowerCaseMessage.includes("게임")) {
                            botResponse = "게임? 음, 내가 만든 '숫자 맞추기' 미니게임이 있지. 심심할 때 한번 해보는 건 어떤가?";
                        } else if (lowerCaseMessage.includes("os") || lowerCaseMessage.includes("운영체제")) {
                            botResponse = "이 OS는 최신 LLM 기술을 기반으로 만들어졌지. 아직 초기 단계라 미숙한 점이 많지만, 자네와 같은 사용자들의 피드백이 중요해!";
                        } else if (lowerCaseMessage.includes("고마워") || lowerCaseMessage.includes("감사")) {
                            botResponse = "별 말씀을! 자네에게 도움이 되었다니 기쁘군. 언제든 다시 찾아오게나.";
                        } else if (lowerCaseMessage.includes("심심") || lowerCaseMessage.includes("할 일")) {
                            botResponse = "심심할 때는 이 OS의 기능을 이것저것 눌러보게나. 숨겨진 기능이 있을지도 모르지! 아니면 내 미니게임이라도...";
                        } else if (lowerCaseMessage.includes("문제") || lowerCaseMessage.includes("버그")) {
                            botResponse = "버그라니! 크흠... 어떤 문제인가? 자세히 알려주면 내가 한번 살펴보겠네. 물론, 이 OS는 완벽...에 가깝지만 말이야.";
                        } else if (lowerCaseMessage.includes("누구세요")) {
                            botResponse = "난 이 시스템의 설계자이자 친구일세. 혹시 도움이 필요한가?";
                        } else if (lowerCaseMessage.includes("로그인") || lowerCaseMessage.includes("회원가입")) {
                            botResponse = "이 시스템은 자네의 계정을 기억하고 있지. 다음번에도 편리하게 접속할 수 있을 걸세. 새로운 사용자가 있다면 가입도 환영하네.";
                        }


                        chatDisplay.innerHTML += `<p><strong>개발자 '미스터 칩스':</strong> ${botResponse}</p>`;
                        chatDisplay.scrollTop = chatDisplay.scrollHeight;
                    }, 800); // 응답 지연 시간을 조금 늘려 실제 대화처럼
                }
            };

            chatSendButton.addEventListener('click', handleSendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSendMessage();
                }
            });

            chatInput.focus();
        });
    });

    // 게임 앱 아이콘 더블 클릭 이벤트
    iconGame.addEventListener('dblclick', () => {
        const gameWindowId = 'game-window-' + Date.now();
        const gameContent = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-family: 'MS Sans Serif', sans-serif; font-size: 16px;">
                <p>숫자 맞추기 게임!</p>
                <p>1부터 100 사이의 숫자를 맞춰보세요.</p>
                <input type="number" id="game-guess-input-${gameWindowId}" style="width: 150px; padding: 5px; margin-bottom: 10px; border: 1px solid #808080; background-color: #fff; text-align: center; font-size: 16px;">
                <button id="game-submit-button-${gameWindowId}" class="button-3d-outset" style="margin-bottom: 10px;">추측!</button>
                <p id="game-message-${gameWindowId}" style="color: blue;"></p>
                <p id="game-attempts-${gameWindowId}" style="font-size: 14px;">시도 횟수: 0</p>
                <button id="game-reset-button-${gameWindowId}" class="button-3d-outset" style="display: none;">다시 시작</button>
            </div>
        `;
        const createdWindowElement = windowManager.createWindow(gameWindowId, '미니 게임', gameContent, 400, 350, '/static/images/icon_computer.png');

        // 게임 로직: 창이 완전히 열린 후에 이벤트 리스너를 붙입니다.
        createdWindowElement.addEventListener('window-opened', (e) => {
            const currentWindowId = e.detail.windowId;
            const guessInput = document.getElementById(`game-guess-input-${currentWindowId}`);
            const submitButton = document.getElementById(`game-submit-button-${currentWindowId}`);
            const messageDisplay = document.getElementById(`game-message-${currentWindowId}`);
            const attemptsDisplay = document.getElementById(`game-attempts-${currentWindowId}`);
            const resetButton = document.getElementById(`game-reset-button-${currentWindowId}`);

            let targetNumber = Math.floor(Math.random() * 100) + 1;
            let attempts = 0;
            let gameOver = false;

            const resetGame = () => {
                targetNumber = Math.floor(Math.random() * 100) + 1;
                attempts = 0;
                gameOver = false;
                messageDisplay.textContent = '';
                attemptsDisplay.textContent = '시도 횟수: 0';
                guessInput.value = '';
                guessInput.disabled = false;
                submitButton.disabled = false;
                resetButton.style.display = 'none';
                guessInput.focus(); // 리셋 후 입력 필드에 포커스
            };

            const checkGuess = () => {
                if (gameOver) return;

                const userGuess = parseInt(guessInput.value);

                if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
                    messageDisplay.textContent = '1에서 100 사이의 유효한 숫자를 입력하세요!';
                    messageDisplay.style.color = 'red';
                    guessInput.focus();
                    return;
                }

                attempts++;
                attemptsDisplay.textContent = `시도 횟수: ${attempts}`;

                if (userGuess === targetNumber) {
                    messageDisplay.textContent = `축하합니다! ${attempts}번 만에 숫자를 맞혔어요!`;
                    messageDisplay.style.color = 'green';
                    gameOver = true;
                    guessInput.disabled = true;
                    submitButton.disabled = true;
                    resetButton.style.display = 'block';
                } else if (userGuess < targetNumber) {
                    messageDisplay.textContent = '너무 낮아요! 더 큰 숫자를 시도해보세요.';
                    messageDisplay.style.color = 'blue';
                } else {
                    messageDisplay.textContent = '너무 높아요! 더 작은 숫자를 시도해보세요.';
                    messageDisplay.style.color = 'blue';
                }
                guessInput.value = ''; // 입력 필드 초기화
                guessInput.focus(); // 추측 후 입력 필드에 포커스
            };

            submitButton.addEventListener('click', checkGuess);
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    checkGuess();
                }
            });
            resetButton.addEventListener('click', resetGame);

            // 게임 시작 시 입력 필드에 자동으로 포커스
            guessInput.focus();
        });
    });


    // 시작 버튼 클릭 이벤트 (나중에 시작 메뉴 구현 시 사용)
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        alert('Start 메뉴는 아직 구현되지 않았습니다!');
        // 여기에 시작 메뉴 표시/숨기기 로직 추가
    });

    // 바탕화면 클릭 시 아이콘 선택 해제 기능 (선택 기능 구현 시)
    document.getElementById('desktop').addEventListener('click', (e) => {
        // 모든 아이콘에서 'selected' 클래스 제거
        document.querySelectorAll('.icon').forEach(icon => {
            icon.classList.remove('selected');
        });
        // 만약 클릭된 대상이 아이콘이라면 'selected' 클래스 추가 (단일 선택)
        const clickedIcon = e.target.closest('.icon');
        if (clickedIcon) {
            clickedIcon.classList.add('selected');
        }
    });

    // 창이 없는 상태에서 데스크톱을 클릭하면 활성 창이 없어지도록
    document.getElementById('desktop').addEventListener('mousedown', (e) => {
        if (!e.target.closest('.window')) {
            // 현재 활성 창이 있다면 비활성화 (active 클래스 제거)
            const activeWindowElem = document.querySelector('.window.active');
            if (activeWindowElem) {
                activeWindowElem.classList.remove('active');
            }
            // 작업 표시줄의 활성 버튼도 비활성화
            const activeTaskbarButton = document.querySelector('.taskbar-app-button.active');
            if (activeTaskbarButton) {
                activeTaskbarButton.classList.remove('active');
            }
        }
    });

});