from sqlalchemy.orm import Session
from sqlalchemy import func
from DataBase.models.ledger_entries import Ledger
from DataBase.models.account import Account
from fastapi import HTTPException

def get_balance(account_number:str, db: Session,user_id:int) -> float:
    account = db.query(Account).filter(Account.account_number == account_number).first()
    if account is None:
        raise HTTPException(status_code=404, detail="account not found")
    account_id = account.id
    #user validation check
    if user_id != account.user_id :
        raise HTTPException(status_code=409,detail="user not authorized")
    last_entry = (
        db.query(Ledger)
        .filter(Ledger.account_id == account_id)
        .order_by(Ledger.id.desc()).first()
    )
    if last_entry is None or last_entry.running_balance is None:
        return 0.0

    balance = last_entry.running_balance

    return float(balance)
