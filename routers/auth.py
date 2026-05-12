from fastapi import APIRouter , Depends , HTTPException     
from fastapi.security import OAuth2PasswordRequestForm      
from sqlalchemy.orm import Session 
from DataBase.db import getdb 
from DataBase.models import User 
from auth import verify_password,create_access_token 
router = APIRouter(tags=['Auth'])






@router.post('/token')
def login(
    formdata: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(getdb)
):
    user = db.query(User).filter(User.email == formdata.username).first()

    if not user or not verify_password(formdata.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }