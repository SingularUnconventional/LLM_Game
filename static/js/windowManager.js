// static/js/windowManager.js

const windowManager = (function() {
    let activeWindow = null;
    let nextZIndex = 1000;
    const taskbarAppsContainer = document.getElementById('taskbar-apps');
    let desktopElem = null; // desktop 요소 참조를 위한 변수 추가

    document.addEventListener('DOMContentLoaded', () => {
        desktopElem = document.getElementById('desktop'); // DOM 로드 후 desktop 요소 가져오기
    });

    /**
     * 새 창을 생성하고 DOM에 추가합니다.
     * @param {string} id - 창의 고유 ID
     * @param {string} title - 창 제목
     * @param {string} contentHtml - 창 내부에 들어갈 HTML 내용
     * @param {number} [width=400] - 초기 너비
     * @param {number} [height=300] - 초기 높이
     * @param {string} [iconPath=''] - 작업 표시줄에 표시될 아이콘 경로
     * @returns {HTMLElement} 생성된 창 요소
     */
    function createWindow(id, title, contentHtml, width = 400, height = 300, iconPath = '') {
        if (!desktopElem) {
            console.error("Desktop element not found. Make sure desktop.html is loaded.");
            return null;
        }

        const windowElem = document.createElement('div');
        windowElem.className = 'window';
        windowElem.id = id;
        windowElem.style.width = `${width}px`;
        windowElem.style.height = `${height}px`;

        // 바탕화면 영역 내에서 랜덤 초기 위치 계산
        // desktopElem의 getBoundingClientRect()는 이제 이미지 오버레이된 스크린 영역을 기준으로 합니다.
        const desktopRect = desktopElem.getBoundingClientRect();
        const maxX = desktopRect.width - width - 50;
        const maxY = desktopRect.height - height - 80; // 작업 표시줄 고려해서 더 위로

        windowElem.style.left = `${Math.max(25, Math.random() * maxX)}px`;
        windowElem.style.top = `${Math.max(25, Math.random() * maxY)}px`;
        windowElem.style.zIndex = nextZIndex++;

        windowElem.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">${title}</div>
                <div class="title-bar-controls">
                    <button class="window-minimize" title="최소화"></button>
                    <button class="window-maximize" title="최대화"></button>
                    <button class="window-close" title="닫기"></button>
                </div>
            </div>
            <div class="window-content">${contentHtml}</div>
        `;

        // window-container는 이제 desktop 내부에 있으므로 desktopElem.querySelector 사용
        desktopElem.querySelector('#window-container').appendChild(windowElem);

        // 작업 표시줄에 버튼 추가
        const taskbarButton = document.createElement('button');
        taskbarButton.id = `taskbar-button-${id}`;
        taskbarButton.className = 'taskbar-app-button';
        taskbarButton.innerHTML = `${iconPath ? `<img src="${iconPath}" alt="">` : ''}<span>${title}</span>`;
        taskbarAppsContainer.appendChild(taskbarButton);

        // 이벤트 리스너 연결
        setupWindowEvents(windowElem, taskbarButton);
        makeActive(windowElem, taskbarButton);

        return windowElem;
    }

    /**
     * 창에 드래그, 닫기, 활성화 등의 이벤트를 설정합니다.
     * @param {HTMLElement} windowElem - 창 요소
     * @param {HTMLElement} taskbarButton - 해당 창의 작업 표시줄 버튼
     */
    function setupWindowEvents(windowElem, taskbarButton) {
        const titleBar = windowElem.querySelector('.title-bar');
        const closeButton = windowElem.querySelector('.window-close');
        const minimizeButton = windowElem.querySelector('.window-minimize');
        const maximizeButton = windowElem.querySelector('.window-maximize');

        // 창 활성화 (클릭 시 맨 위로)
        windowElem.addEventListener('mousedown', (e) => {
            // 창 내용 클릭 시에도 활성화되도록 수정 (제목 표시줄 제외)
            if (!e.target.closest('.title-bar')) {
                makeActive(windowElem, taskbarButton);
            }
        });


        // 닫기 버튼
        closeButton.addEventListener('click', () => {
            windowElem.remove();
            taskbarButton.remove();
            if (activeWindow === windowElem) {
                activeWindow = null;
                const remainingWindows = document.querySelectorAll('#window-container .window'); // 전체 창에서 찾기
                if (remainingWindows.length > 0) {
                    makeActive(remainingWindows[remainingWindows.length - 1], null);
                }
            }
        });

        // 최소화 버튼
        minimizeButton.addEventListener('click', () => {
            windowElem.style.display = 'none';
            taskbarButton.classList.remove('active');
            if (activeWindow === windowElem) {
                activeWindow = null;
                const remainingWindows = document.querySelectorAll('#window-container .window:not([style*="display: none"])');
                if (remainingWindows.length > 0) {
                    makeActive(remainingWindows[remainingWindows.length - 1], null);
                }
            }
        });

        // 최대화 버튼 (데스크톱 영역에 맞춰 최대화)
        let isMaximized = false;
        let originalPos = { left: 0, top: 0, width: 0, height: 0 };
        maximizeButton.addEventListener('click', () => {
            const desktopRect = desktopElem.getBoundingClientRect();
            const taskbarHeight = document.getElementById('taskbar').offsetHeight;

            if (!isMaximized) {
                originalPos.left = windowElem.style.left;
                originalPos.top = windowElem.style.top;
                originalPos.width = windowElem.style.width;
                originalPos.height = windowElem.style.height;

                // #desktop 영역을 기준으로 위치와 크기 계산
                windowElem.style.left = '0px';
                windowElem.style.top = '0px';
                windowElem.style.width = `${desktopRect.width}px`;
                windowElem.style.height = `${desktopRect.height - taskbarHeight}px`; // 작업 표시줄 높이 제외
                windowElem.style.resize = 'none'; // 최대화 상태에서 리사이즈 방지
                windowElem.style.borderRadius = '0'; // 모서리 둥글게 제거
            } else {
                windowElem.style.left = originalPos.left;
                windowElem.style.top = originalPos.top;
                windowElem.style.width = originalPos.width;
                windowElem.style.height = originalPos.height;
                windowElem.style.resize = 'both';
            }
            isMaximized = !isMaximized;
            makeActive(windowElem, taskbarButton); // 최대화/복원 후 활성화
        });

        // 드래그 기능 (최대화 상태에서는 드래그 방지)
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.title-bar-controls')) return;
            if (isMaximized) return; // 최대화 상태에서는 드래그 방지

            isDragging = true;
            const windowRect = windowElem.getBoundingClientRect();
            offset.x = e.clientX - windowRect.left;
            offset.y = e.clientY - windowRect.top;
            titleBar.style.cursor = 'grabbing';
            makeActive(windowElem, taskbarButton);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if (isMaximized) return;

            // 바탕화면 영역 내에서 드래그 제한 (선택 사항)
            const desktopRect = desktopElem.getBoundingClientRect();
            let newLeft = e.clientX - offset.x - desktopRect.left;
            let newTop = e.clientY - offset.y - desktopRect.top;

            // 창이 데스크톱 영역을 벗어나지 않도록 제한
            newLeft = Math.max(0, Math.min(newLeft, desktopRect.width - windowElem.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, desktopRect.height - windowElem.offsetHeight - document.getElementById('taskbar').offsetHeight));


            windowElem.style.left = `${newLeft}px`;
            windowElem.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            titleBar.style.cursor = 'grab';
        });

        // 작업 표시줄 버튼 클릭 시 창 토글
        taskbarButton.addEventListener('click', () => {
            if (windowElem.style.display === 'none') {
                windowElem.style.display = 'flex';
                makeActive(windowElem, taskbarButton);
            } else if (activeWindow === windowElem) {
                windowElem.style.display = 'none';
                taskbarButton.classList.remove('active');
                activeWindow = null;
                const remainingWindows = document.querySelectorAll('#window-container .window:not([style*="display: none"])');
                if (remainingWindows.length > 0) {
                    makeActive(remainingWindows[remainingWindows.length - 1], null);
                }
            } else {
                makeActive(windowElem, taskbarButton);
            }
        });
    }

    /**
     * 특정 창을 활성화 상태로 만들고 Z-index를 조정합니다.
     * @param {HTMLElement} windowToActivate - 활성화할 창 요소
     * @param {HTMLElement} taskbarButtonToActivate - 해당 창의 작업 표시줄 버튼 (선택 사항)
     */
    function makeActive(windowToActivate, taskbarButtonToActivate) {
        if (activeWindow) {
            activeWindow.classList.remove('active');
            const prevTaskbarButton = document.getElementById(`taskbar-button-${activeWindow.id}`);
            if (prevTaskbarButton) {
                prevTaskbarButton.classList.remove('active');
            }
        }
        activeWindow = windowToActivate;
        activeWindow.classList.add('active');
        activeWindow.style.zIndex = nextZIndex++;
        
        if (taskbarButtonToActivate) {
            taskbarButtonToActivate.classList.add('active');
        } else {
            const correspondingButton = document.getElementById(`taskbar-button-${windowToActivate.id}`);
            if (correspondingButton) {
                correspondingButton.classList.add('active');
            }
        }
    }

    return {
        createWindow
    };
})();