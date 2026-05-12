from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from DataBase.models.account import Account
from DataBase.models.transaction import Transaction
from DataBase.models.ledger_entries import Ledger
from DataBase.models.idempotency import IdempotencyKey
from services.ledger.ledger_balance import get_balance


def transfer(amount: float, key: str, db: Session, user_id: int,
             from_account_number: str, to_account_number: str):

    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    sender = db.query(Account).filter(
        Account.account_number == from_account_number
    ).first()

    receiver = db.query(Account).filter(
        Account.account_number == to_account_number
    ).first()

    # lock rows
    first_id = min(sender.id, receiver.id)
    second_id = max(sender.id, receiver.id)

    db.query(Account).filter(Account.id == first_id).with_for_update().first()
    db.query(Account).filter(Account.id == second_id).with_for_update().first()

    balance = get_balance(from_account_number, db,sender.user_id)

    if balance < amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

    transaction = Transaction(
        type="transfer",
        status="pending"
    )

    db.add(transaction)
    db.flush()

    
    last_entry_sender = db.query(Ledger)\
        .filter(Ledger.account_id == sender.id)\
        .order_by(Ledger.id.desc())\
        .first()
    last_entry_receiver = db.query(Ledger)\
        .filter(Ledger.account_id == receiver.id)\
        .order_by(Ledger.id.desc())\
        .first()


    previous_balance_sender = last_entry_sender.running_balance if last_entry_sender else 0
    previous_balance_receiver = last_entry_receiver.running_balance if last_entry_receiver else 0


    sender_entry = Ledger(
        account_id=sender.id,
        transaction_id=transaction.id,
        amount=-amount,
        running_balance = previous_balance_sender - Decimal(amount)
    )

    receiver_entry = Ledger(
        account_id=receiver.id,
        transaction_id=transaction.id,
        amount=amount,
        running_balance =  previous_balance_receiver + Decimal(amount)

    )

    db.add_all([sender_entry, receiver_entry])

    transaction.status = "completed"

    idem = IdempotencyKey(
        key=key,
        user_id=user_id,
        endpoint="/transfer",
        transaction_id=transaction.id
    )

    db.add(idem)

    db.commit()

    return transaction.id

       