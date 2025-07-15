# routes/game.py
from flask import Blueprint, render_template, session, redirect, url_for
from routes.auth import login_required # login_required 데코레이터 재사용

game_bp = Blueprint('game', __name__)

@game_bp.route('/desktop')
@login_required
def desktop():
    # 로그인된 사용자가 바탕화면 페이지에 접근
    # 여기서는 간단히 사용자 이름을 템플릿으로 전달할 수 있습니다.
    return render_template('desktop.html', username=session.get('username', 'Guest'))

# (나중에 게임 관련 API 엔드포인트가 여기에 추가될 수 있습니다.)
# @game_bp.route('/api/start_game', methods=['POST'])
# @login_required
# def start_game():
#     # 게임 시작 로직
#     pass