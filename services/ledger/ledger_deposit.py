from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from DataBase.models.account import Account
from DataBase.models.transaction import Transaction
from DataBase.models.ledger_entries import Ledger
from DataBase.models.idempotency import IdempotencyKey


def deposit(account_number: str, amount: float, idem_key: str, user_id: int, db: Session):

    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deposit amount must be positive")

    # 1️⃣ Check idempotency (per user)
    existing = db.query(IdempotencyKey).filter(
        IdempotencyKey.key == idem_key,
        IdempotencyKey.user_id == user_id
    ).first()

    if existing:
        return existing.transaction_id

    # 2️⃣ Fetch account and verify ownership
    account = db.query(Account).filter(
        Account.account_number == account_number
    ).first()

    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    if account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access to account")

    # 3️⃣ Fetch SYSTEM account
    system_account = db.query(Account).filter(
        Account.account_number == "SYSTEM"
    ).first()

    if not system_account:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="System account not configured")

    # 4️⃣ Create transaction
    transaction = Transaction(
        type="deposit",
        status="pending"
    )

    db.add(transaction)
    db.flush()  # generate transaction.id


    last_entry = db.query(Ledger)\
    .filter(Ledger.account_id == account.id)\
    .order_by(Ledger.id.desc())\
    .first()

    previous_balance = last_entry.running_balance if last_entry else 0
    # 5️⃣ Create ledger entries
    user_entry = Ledger(
        account_id=account.id,
        transaction_id=transaction.id,
        amount=amount,
        running_balance =  previous_balance + Decimal(amount)
    )

    system_entry = Ledger(
        account_id=system_account.id,
        transaction_id=transaction.id,
        amount=-amount
    )

    db.add_all([user_entry, system_entry])

    # 6️⃣ Mark transaction completed
    transaction.status = "completed"

    # 7️⃣ Store idempotency record
    idempotency_record = IdempotencyKey(
        key=idem_key,
        user_id=user_id,
        endpoint="/deposit",
        transaction_id=transaction.id
    )

    db.add(idempotency_record)

    # 8️⃣ Commit
    db.commit()

    return transaction.id