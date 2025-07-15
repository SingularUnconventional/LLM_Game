// static/js/windowManager.js

class WindowManager {
    constructor() {
        this.activeWindow = null;
        this.windowZIndex = 1000;
        this.taskbarApps = document.getElementById('taskbar-apps');
        this.windowContainer = document.getElementById('window-container');
        this.windows = {}; // 열린 창들을 관리하는 객체
    }

    createWindow(id, title, content, width, height, iconPath = '/static/images/icon_default.png') {
        // 기존에 열린 창이 있다면 비활성화
        if (this.activeWindow) {
            this.activeWindow.element.classList.remove('active');
            const activeTaskbarButton = document.querySelector(`.taskbar-app-button[data-window-id="${this.activeWindow.id}"]`);
            if (activeTaskbarButton) {
                activeTaskbarButton.classList.remove('active');
            }
        }

        const newWindowElement = document.createElement('div');
        newWindowElement.className = 'window button-3d-outset';
        newWindowElement.id = id;
        newWindowElement.style.width = `${width}px`;
        newWindowElement.style.height = `${height}px`;
        newWindowElement.style.zIndex = ++this.windowZIndex;
        newWindowElement.style.left = `${(window.innerWidth - width) / 2}px`;
        newWindowElement.style.top = `${(window.innerHeight - height) / 2 - 50}px`; // 중앙에서 약간 위로

        newWindowElement.innerHTML = `
            <div class="title-bar button-3d-inset">
                <div class="title-bar-text">
                    <img src="${iconPath}" alt="${title}" class="title-bar-icon">
                    ${title}
                </div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize" class="window-control-button minimize-button"></button>
                    <button aria-label="Maximize" class="window-control-button maximize-button"></button>
                    <button aria-label="Close" class="window-control-button close-button"></button>
                </div>
            </div>
            <div class="window-content">
                ${content}
            </div>
            <div class="window-resize-handle"></div>
        `;

        this.windowContainer.appendChild(newWindowElement);

        const newWindow = {
            id: id,
            element: newWindowElement,
            title: title,
            icon: iconPath,
            isMaximized: false
        };
        this.windows[id] = newWindow;
        this.activeWindow = newWindow;
        newWindowElement.classList.add('active');

        this.makeDraggable(newWindowElement);
        this.makeResizable(newWindowElement);
        this.attachEventListeners(newWindow);
        this.createTaskbarButton(newWindow);

        // 창이 DOM에 완전히 추가된 후에 이 이벤트를 발생시킵니다.
        setTimeout(() => {
            newWindowElement.dispatchEvent(new CustomEvent('window-opened', { detail: { windowId: id } }));
        }, 0);

        return newWindowElement; // 생성된 DOM 요소를 반환
    }

        makeDraggable(windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        let isDragging = false;
        let startX, startY; // 마우스 클릭 시의 초기 X, Y 좌표
        let initialWindowLeft, initialWindowTop; // 드래그 시작 시 창의 초기 left, top 값

        titleBar.addEventListener('mousedown', (e) => {
            // 창 제어 버튼(최소화, 최대화, 닫기)을 클릭한 경우에는 드래그를 시작하지 않음
            if (e.target.classList.contains('window-control-button')) {
                return;
            }
            e.preventDefault(); // 기본 드래그 방지 (예: 텍스트 드래그)

            isDragging = true;
            startX = e.clientX; // 마우스 클릭 X 좌표
            startY = e.clientY; // 마우스 클릭 Y 좌표

            // 창의 현재 위치(CSS left, top 값)를 가져와서 숫자형으로 변환
            // style.left/top은 "123px"과 같은 문자열이므로, px를 제거하고 숫자로 변환
            initialWindowLeft = parseFloat(windowElement.style.left || 0);
            initialWindowTop = parseFloat(windowElement.style.top || 0);

            windowElement.style.cursor = 'grabbing';
            windowElement.style.userSelect = 'none';
            windowElement.classList.add('dragging');
            this.bringToFront(windowElement.id); // 드래그 시작 시 창을 맨 앞으로 가져옴
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // 마우스 이동 거리 계산
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // 창의 새 위치 계산: 초기 창 위치 + 마우스 이동 거리
            windowElement.style.left = `${initialWindowLeft + deltaX}px`;
            windowElement.style.top = `${initialWindowTop + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                windowElement.style.cursor = 'default';
                windowElement.style.userSelect = 'auto';
                windowElement.classList.remove('dragging');
            }
        });
    }

    makeResizable(windowElement) {
        const resizeHandle = windowElement.querySelector('.window-resize-handle');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // 기본 드래그 동작 방지
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowElement.offsetWidth;
            startHeight = windowElement.offsetHeight;
            windowElement.style.userSelect = 'none';
            windowElement.classList.add('resizing');
            this.bringToFront(windowElement.id);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);

            // 최소 크기 제한
            if (newWidth < 200) newWidth = 200;
            if (newHeight < 150) newHeight = 150;

            windowElement.style.width = `${newWidth}px`;
            windowElement.style.height = `${newHeight}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                windowElement.style.userSelect = 'auto';
                windowElement.classList.remove('resizing');
            }
        });
    }

    attachEventListeners(newWindow) {
        const windowElement = newWindow.element;
        const closeButton = windowElement.querySelector('.close-button');
        const minimizeButton = windowElement.querySelector('.minimize-button');
        const maximizeButton = windowElement.querySelector('.maximize-button');
        const titleBar = windowElement.querySelector('.title-bar');

        closeButton.addEventListener('click', () => this.closeWindow(newWindow.id));
        minimizeButton.addEventListener('click', () => this.minimizeWindow(newWindow.id));
        maximizeButton.addEventListener('click', () => this.maximizeWindow(newWindow.id));

        // 창 클릭 시 활성화 (맨 앞으로 가져오기)
        windowElement.addEventListener('mousedown', () => {
            // 현재 활성 창이 있고, 클릭된 창이 활성 창이 아니라면 비활성화
            if (this.activeWindow && this.activeWindow.id !== newWindow.id) {
                this.activeWindow.element.classList.remove('active');
                const prevActiveButton = document.querySelector(`.taskbar-app-button[data-window-id="${this.activeWindow.id}"]`);
                if (prevActiveButton) {
                    prevActiveButton.classList.remove('active');
                }
            }
            // 클릭된 창을 활성화
            this.activeWindow = newWindow;
            windowElement.classList.add('active');
            this.bringToFront(newWindow.id); // 항상 맨 앞으로 가져옴

            // 작업 표시줄 버튼 활성화
            const taskbarButton = document.querySelector(`.taskbar-app-button[data-window-id="${newWindow.id}"]`);
            if (taskbarButton) {
                taskbarButton.classList.add('active');
            }
        });

        // 최대화/복원 더블클릭
        titleBar.addEventListener('dblclick', () => this.maximizeWindow(newWindow.id));
    }

    closeWindow(id) {
        const windowToRemove = this.windows[id];
        if (windowToRemove) {
            windowToRemove.element.remove();
            delete this.windows[id];
            this.removeTaskbarButton(id);
            // 닫은 창이 활성 창이었다면 활성 창을 null로 설정
            if (this.activeWindow && this.activeWindow.id === id) {
                this.activeWindow = null;
            }
            // 다른 열린 창이 있다면 가장 최근에 활성화된 창을 활성 상태로 만들거나
            // 단순히 active 클래스를 제거한 상태로 둠 (여기서는 active를 제거만 함)
        }
    }

    minimizeWindow(id) {
        const windowToMinimize = this.windows[id];
        if (windowToMinimize) {
            windowToMinimize.element.style.display = 'none'; // 창 숨기기
            const taskbarButton = document.querySelector(`.taskbar-app-button[data-window-id="${id}"]`);
            if (taskbarButton) {
                taskbarButton.classList.remove('active'); // 작업 표시줄 버튼 비활성화
            }
            // 현재 활성 창을 최소화했다면, 활성 창 참조를 null로 설정
            if (this.activeWindow && this.activeWindow.id === id) {
                this.activeWindow = null;
            }
        }
    }

    maximizeWindow(id) {
        const windowToMaximize = this.windows[id];
        if (!windowToMaximize) return;

        const el = windowToMaximize.element;
        if (!windowToMaximize.isMaximized) {
            // 현재 위치와 크기 저장 (복원 시 사용)
            windowToMaximize.originalLeft = el.style.left;
            windowToMaximize.originalTop = el.style.top;
            windowToMaximize.originalWidth = el.style.width;
            windowToMaximize.originalHeight = el.style.height;

            el.style.left = '0';
            el.style.top = '0';
            el.style.width = '100%';
            el.style.height = 'calc(100% - 28px)'; // 작업 표시줄 높이 제외
            el.querySelector('.window-resize-handle').style.display = 'none'; // 리사이즈 핸들 숨김
            windowToMaximize.isMaximized = true;
        } else {
            // 원래 위치와 크기로 복원
            el.style.left = windowToMaximize.originalLeft;
            el.style.top = windowToMaximize.originalTop;
            el.style.width = windowToMaximize.originalWidth;
            el.style.height = windowToMaximize.originalHeight;
            el.querySelector('.window-resize-handle').style.display = 'block'; // 리사이즈 핸들 다시 표시
            windowToMaximize.isMaximized = false;
        }
        this.bringToFront(id); // 최대화/복원 시 맨 앞으로
    }

    createTaskbarButton(newWindow) {
        const button = document.createElement('button');
        button.className = 'taskbar-app-button button-3d-outset active'; // 처음 열릴 때 활성 상태
        button.dataset.windowId = newWindow.id;
        button.innerHTML = `<img src="${newWindow.icon}" alt="${newWindow.title}" class="taskbar-app-icon"> ${newWindow.title}`;
        this.taskbarApps.appendChild(button);

        button.addEventListener('click', () => {
            const windowElement = newWindow.element;
            if (windowElement.style.display === 'none') { // 최소화된 상태일 경우
                windowElement.style.display = 'block'; // 다시 표시
                this.bringToFront(newWindow.id); // 맨 앞으로
                button.classList.add('active'); // 버튼 활성화
            } else if (this.activeWindow && this.activeWindow.id === newWindow.id) { // 이미 활성화된 창을 클릭한 경우 (최소화)
                this.minimizeWindow(newWindow.id);
            } else { // 다른 창이 활성화된 상태에서 이 창을 클릭한 경우 (활성화)
                this.bringToFront(newWindow.id);
                button.classList.add('active'); // 버튼 활성화
            }
        });
    }

    removeTaskbarButton(id) {
        const button = document.querySelector(`.taskbar-app-button[data-window-id="${id}"]`);
        if (button) {
            button.remove();
        }
    }

    bringToFront(id) {
        // 모든 창의 active 클래스 제거 (선택 해제)
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
        });
        // 모든 작업 표시줄 버튼의 active 클래스 제거 (선택 해제)
        document.querySelectorAll('.taskbar-app-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // 해당 창을 맨 앞으로 가져오기 (z-index 증가)
        const windowElement = this.windows[id].element;
        windowElement.style.zIndex = ++this.windowZIndex;
        windowElement.classList.add('active'); // 활성 클래스 추가

        // 해당 작업 표시줄 버튼 활성화
        const taskbarButton = document.querySelector(`.taskbar-app-button[data-window-id="${id}"]`);
        if (taskbarButton) {
            taskbarButton.classList.add('active');
        }

        // 현재 활성 창 업데이트
        this.activeWindow = this.windows[id];
    }
}

const windowManager = new WindowManager();