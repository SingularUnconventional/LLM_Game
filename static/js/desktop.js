// static/js/desktop.js

document.addEventListener('DOMContentLoaded', () => {
    const iconNotepad = document.getElementById('icon-notepad');
    const iconMyComputer = document.getElementById('icon-my-computer');
    const iconMyDocuments = document.getElementById('icon-my-documents');
    const iconRecycleBin = document.getElementById('icon-recycle-bin');
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

    // 아이콘 더블 클릭 이벤트
    iconNotepad.addEventListener('dblclick', () => {
        const notepadWindowId = 'notepad-window-' + Date.now();
        const notepadContent = `
            <textarea style="width: 100%; height: 100%; border: none; outline: none; resize: none; font-family: 'Courier New', monospace;"></textarea>
        `;
        // 작업 표시줄에 사용할 아이콘 경로 전달
        windowManager.createWindow(notepadWindowId, '메모장 - 제목 없음', notepadContent, 400, 300, '/static/images/icon_notepad.png');
    });

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
        windowManager.createWindow(myComputerWindowId, '내 컴퓨터', myComputerContent, 500, 350, '/static/images/icon_computer.png');
    });

    iconMyDocuments.addEventListener('dblclick', () => {
        const myDocumentsWindowId = 'my-documents-window-' + Date.now();
        const myDocumentsContent = `
            <div style="padding: 10px;">
                <p>내 문서 폴더입니다.</p>
                <ul>
                    <li>MyGameSave.txt</li>
                    <li>Important_Memo.txt</li>
                </ul>
            </div>
        `;
        windowManager.createWindow(myDocumentsWindowId, '내 문서', myDocumentsContent, 450, 300, '/static/images/icon_documents.png');
    });

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