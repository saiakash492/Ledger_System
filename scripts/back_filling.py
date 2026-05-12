import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from sqlalchemy.orm import Session
from sqlalchemy import select
from DataBase.db import SessionLocal
from DataBase.models.account import Account
from DataBase.models.ledger_entries import Ledger


def backfill_running_balance():
    db: Session = SessionLocal()            

    accounts = db.query(Account).all()

    for account in accounts:

        balance = 0

        entries = (
            db.query(Ledger)
            .filter(Ledger.account_id == account.id)
            .order_by(Ledger.created_at)
            .all()
        )

        for entry in entries:
            balance += entry.amount
            entry.running_balance = balance

        db.commit()

    db.close()


if __name__ == "__main__":
    backfill_running_balance()