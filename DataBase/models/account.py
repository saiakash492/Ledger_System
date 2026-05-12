from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from DataBase.db import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    account_number = Column(String, unique=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))

    currency = Column(String, default="INR")

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="accounts")

    ledger_entries = relationship("Ledger",back_populates="account")