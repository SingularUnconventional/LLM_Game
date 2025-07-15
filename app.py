# app.py
from flask import Flask, render_template, session, redirect, url_for
from routes.auth import auth_bp, login_required, create_tables
from routes.game import game_bp # game_bp 불러오기

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = app.config['SECRET_KEY']

with app.app_context():
    create_tables()

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(game_bp, url_prefix='/game') # game_bp 등록

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('game.desktop')) # 로그인 된 경우 바탕화면으로 리다이렉트
    return render_template('index.html') # 로그인 되지 않은 경우 보여줄 페이지

# 기존 /dashboard 라우트는 이제 필요 없을 수 있습니다.
# @app.route('/dashboard')
# @login_required
# def dashboard():
#     return f"Welcome to the game, {session['username']}!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)