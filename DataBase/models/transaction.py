from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from DataBase.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)


    type = Column(String)
    
    status = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("Ledger", back_populates="transaction")

    idempotency = relationship("IdempotencyKey",back_populates="transaction")