from sqlalchemy.orm import aliased, Session
from DataBase.models.ledger_entries import Ledger
from DataBase.models.transaction import Transaction
from DataBase.models.account import Account
from schemas.transaction import TransactionHistoryItem,TransactionHistoryResponse


def transaction_history(account_number: str,user_id:int, db: Session, limit: int = 20,offset: int = 0) -> list[TransactionHistoryItem]:

    # Fetch account
    account = db.query(Account).filter(
        Account.account_number == account_number
    ).first()



    if not account:
        raise Exception("Account not found")

    if account.user_id != user_id:
        raise Exception ("Unauthorized for this Action ")

    account_id = account.id

    # Aliases
    OtherLedger = aliased(Ledger)
    CounterpartyAccount = aliased(Account)

    rows = (
        db.query(
            Ledger,
            Transaction,
            CounterpartyAccount.account_number
        )
        .join(Transaction, Transaction.id == Ledger.transaction_id)

        .outerjoin(
            OtherLedger,
            (OtherLedger.transaction_id == Ledger.transaction_id) &
            (OtherLedger.account_id != Ledger.account_id)
        )

        .outerjoin(
            CounterpartyAccount,
            CounterpartyAccount.id == OtherLedger.account_id
        )

        .filter(Ledger.account_id == account_id)

        .order_by(Transaction.created_at.desc())

        .limit(limit)
        .offset(offset)

        .all()
    )

    response = []

    for ledger, transaction, counterparty in rows:

        item = TransactionHistoryItem(
            type=transaction.type,
            amount=ledger.amount,
            timestamp=transaction.created_at,
            counterparty_account=counterparty
        )

        response.append(item)

    return response