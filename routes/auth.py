# routes/auth.py
from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template
from database.db_connection import get_db, Base, engine
from models.user import User
from services.auth_service import create_user, authenticate_user
import functools

auth_bp = Blueprint('auth', __name__)

# 데이터베이스 테이블 생성 (app.py에서 호출)
def create_tables():
    Base.metadata.create_all(bind=engine)

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if 'user_id' not in session:
            return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = next(get_db())
        if db.query(User).filter(User.username == username).first():
            return "Username already exists!", 400
        
        # 비밀번호 해싱 및 사용자 생성 (auth_service에서 처리)
        new_user = User(username=username)
        new_user.set_password(password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return redirect(url_for('auth.login'))
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = next(get_db())
        user = authenticate_user(db, username, password)
        if user:
            session['user_id'] = user.id
            session['username'] = user.username
            # 이 부분을 'game.desktop'으로 수정합니다.
            return redirect(url_for('game.desktop')) # 로그인 성공 후 바탕화면으로 리다이렉트
        else:
            return "Invalid credentials", 401
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('auth.login'))