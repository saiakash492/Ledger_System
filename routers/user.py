from fastapi import FastAPI , HTTPException , Depends , APIRouter
from schemas.user import UserCreate,UserResponse
from sqlalchemy.orm import Session
from DataBase.db import getdb
from DataBase.models import User,Account
from auth import get_current_active_user,hash_password
from fastapi import BackgroundTasks
from services.email_service import send_welcome_email
from schemas.Account import AccountResponse , AccountCreate
from random import random
from datetime import datetime
router = APIRouter(prefix='/users',tags=['users'])

from fastapi import BackgroundTasks

@router.post(path='/', response_model=UserResponse)
def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(getdb)
):
    
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=409, detail="user already exists")

    hashed_pw = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    
    background_tasks.add_task(
        send_welcome_email,
        user.email,
        user.name
    )

    return new_user

@router.get(path='/{user_id}',response_model=UserResponse)
def  get_userby_id(user_id : int , db:Session =Depends(getdb), current_user: User = Depends(get_current_active_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException (status_code=404 , detail="No user found with the following id")
    return user

