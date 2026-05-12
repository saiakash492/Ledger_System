from sqlalchemy import Column, Integer, String, Boolean,DECIMAL,ForeignKey,Numeric,DateTime

from sqlalchemy.orm import relationship
from DataBase.db import Base
from datetime import datetime

class Ledger(Base):
    __tablename__ = "ledger_entries"
    id = Column(Integer,primary_key=True)

    account_id = Column(Integer,ForeignKey("accounts.id"),nullable=False)

    transaction_id = Column(Integer,ForeignKey("transactions.id"))

    amount = Column(Numeric,nullable=False)

    created_at = Column(DateTime,default=datetime.utcnow)
    
    account = relationship("Account" , back_populates="ledger_entries")

    transaction = relationship("Transaction" , back_populates="entries")

    running_balance = Column(Numeric)