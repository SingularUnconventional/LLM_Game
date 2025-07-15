# services/auth_service.py
from sqlalchemy.orm import Session
from models.user import User

def create_user(db: Session, username: str, password: str):
    hashed_password = User().set_password(password) # User 인스턴스 생성 후 호출
    db_user = User(username=username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.check_password(password):
        return None
    return user