from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from DataBase.db import getdb
from auth import get_current_active_user

from services.helpers.transaction import transaction_history
from services.ledger.ledger_deposit import deposit
from services.ledger.ledger_withdrawal import withdraw
from services.ledger.ledger_transfer import transfer
from services.ledger.ledger_balance import get_balance as balance
from schemas.transaction import TransactionHistoryResponse,DepositResponse,WithdrawalResponse,TransferResponse,BalanceResponse
router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/{account_number}/history", response_model=TransactionHistoryResponse)
def history(
    account_number: str,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(getdb),
    current_user = Depends(get_current_active_user),
):

    transactions_list = transaction_history(
        account_number=account_number,
        user_id=current_user.id,
        db=db,
        limit=limit,
        offset=offset
    )

    return {"transactions": transactions_list}

@router.post(path="/deposit",response_model=DepositResponse)

def deposit_money(
    account_number: str,
    amount: float,
    idem_key: str,
    db: Session = Depends(getdb),
    current_user  = Depends(get_current_active_user)
):

    txn_id = deposit(
        account_number,
        amount,
        idem_key,
        current_user.id,
        db
    )

    return {
        "transaction_id": txn_id,
        "message": "Deposit successful"
    }

@router.post(path='/withdraw',response_model=WithdrawalResponse)
def withdrawal(
    account_number: str,
    key:str,
    amount:float,
    db: Session = Depends(getdb),
    current_user = Depends(get_current_active_user),
):
    user_id = current_user.id
    txn = withdraw(account_number,user_id,key,amount,db)
    return {
        "transaction_id" : txn,
        "message" : "withdrawal sucessful"
    }


@router.post(path='/transfer',response_model=TransferResponse)
def transfer_amount(
    to_account_number:str,
    accn_number:str,
    key:str,
    amount:float,
    db:Session=Depends(getdb),
    current_user = Depends(get_current_active_user),

):
    user_id = current_user.id
    txn = transfer(amount,key,db,user_id,accn_number,to_account_number)

    return {
        "transaction_id" : txn,
        "transferred_to" : to_account_number,
        "message" : "transfer amount sucessful"
    }

@router.get(path='/balance',response_model=BalanceResponse)
def get_balance(account_number:str,db:Session = Depends(getdb),currentuser = Depends(get_current_active_user)

):
    user_id = currentuser.id
    amnt = balance(account_number,db,user_id)

    return {
        "balance" : amnt,
        "message" : "account balance fetched sucessfully"
    }

