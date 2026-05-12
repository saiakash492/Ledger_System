from fastapi import FastAPI , HTTPException , Depends , APIRouter
from sqlalchemy import func
from schemas.user import UserCreate,UserResponse
from sqlalchemy.orm import Session
from DataBase.db import getdb
from DataBase.models import User,Account
from auth import get_current_active_user
from typing import List

from schemas.Account import AccountResponse , AccountCreate
import random
from datetime import datetime

from DataBase.models.account import Account

router = APIRouter(prefix='/accounts',tags=['accounts'])



def generate_account_number() :
    bank_code = "8"
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    random_number = random.randint(10000, 99999)

    return bank_code + timestamp + str(random_number)
@router.post(path='/create',response_model=AccountResponse)
def create_accn(details:AccountCreate, current_user:User=Depends(get_current_active_user),db:Session=Depends(getdb)):

    
    account_count = (
        db.query(func.count(Account.id))
        .filter(Account.user_id == current_user.id)
        .scalar()
    )

    if account_count >= 2:
        raise HTTPException(
            status_code=400,
            detail="User cannot create more than 2 accounts"
        )



    new_account = Account(
        currency = "INR",
        # balance = details.balance,
        account_number = generate_account_number(),
        user_id = current_user.id, )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return new_account
    
@router.get(path='/all',response_model=List[AccountResponse])
def get_all_accns(current_user:User=Depends(get_current_active_user),db:Session=Depends(getdb)):
    accounts =  db.query(Account).filter(Account.user_id == current_user.id).all()
    if not accounts :
        raise HTTPException (status_code=404,detail ="No accounts found")
    return accounts


@router.delete(path='/{account_number}')
def delete_account(
    account_number: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(getdb),
):
    account = (
        db.query(Account)
        .filter(Account.account_number == account_number, Account.user_id == current_user.id)
        .first()
    )

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()

    return {"message": "Account deleted successfully"}
