from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from DataBase.db import Base


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    id = Column(Integer, primary_key=True, index=True)

    key = Column(String, unique=True, index=True, nullable=False)

    user_id = Column(Integer, nullable=False)

    endpoint = Column(String, nullable=False)

    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="idempotency")