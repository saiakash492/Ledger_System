from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from DataBase.models.account import Account
from DataBase.models.transaction import Transaction
from DataBase.models.ledger_entries import Ledger
from DataBase.models.idempotency import IdempotencyKey
from services.ledger.ledger_balance import get_balance


def withdraw(account_number: str, user_id: int, key: str, amount: float, db: Session):

    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be greater than zero")

   

    # Fetch account WITH lock
    account = db.query(Account)\
        .filter(Account.account_number == account_number)\
        .with_for_update()\
        .first()

    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Ownership validation
    if account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access to account")

    # Idempotency check
    existing = db.query(IdempotencyKey).filter(
        IdempotencyKey.key == key,
        IdempotencyKey.user_id == user_id
    ).first()

    if existing:
        return existing.transaction_id

    # Compute balance AFTER locking
    balance = get_balance(account_number, db,user_id)

    if balance < amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

    # Fetch SYSTEM account
    system_account = db.query(Account).filter(
        Account.account_number == "SYSTEM"
    ).first()

    if not system_account:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="System account not configured")

    # Create transaction
    transaction = Transaction(
        type="withdraw",
        status="pending"
    )

    db.add(transaction)
    db.flush()

    last_entry = db.query(Ledger)\
    .filter(Ledger.account_id == account.id)\
    .order_by(Ledger.id.desc())\
    .first()

    previous_balance = last_entry.running_balance if last_entry else 0


    # Ledger entries
    user_entry = Ledger(
        account_id=account.id,
        transaction_id=transaction.id,
        amount=-amount,
        running_balance =  previous_balance - Decimal(amount),
    )

    system_entry = Ledger(
        account_id=system_account.id,
        transaction_id=transaction.id,
        amount=amount
    )

    db.add_all([user_entry, system_entry])

    # Mark transaction completed
    transaction.status = "completed"

    # Store idempotency record
    idempotency_record = IdempotencyKey(
        key=key,
        user_id=user_id,
        endpoint="/withdraw",
        transaction_id=transaction.id
    )

    db.add(idempotency_record)
    db.commit()

    return transaction.id