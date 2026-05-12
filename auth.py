from fastapi.security import OAuth2PasswordBearer 
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from DataBase.db import getdb
from datetime import datetime, timedelta , timezone
from settings import settings
from DataBase.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')
password_context = CryptContext(schemes=["argon2"],deprecated = 'auto')

TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY

def verify_password(password:str , hashed_password:str) -> bool :
   return password_context.verify(secret=password,hash=hashed_password)


def hash_password(password:str):
   return password_context.hash(secret=password)

def create_access_token(data:dict,expires_delta:timedelta | None = None):
   to_encode = data.copy()
   if expires_delta:
      expire = datetime.now(timezone.utc) + expires_delta
   else:
      expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
   to_encode.update({"exp": expire})
   return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token:str):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return email

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
   
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(getdb),
):
    email = verify_token(token)

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
    

     
def get_current_active_user(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
    




