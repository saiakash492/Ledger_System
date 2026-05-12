from typing import List, Optional

from pydantic import BaseModel
from datetime import datetime


class TransactionHistoryItem(BaseModel):
    type: str
    amount: float
    timestamp: datetime
    counterparty_account: Optional[str] = None


class TransactionHistoryResponse(BaseModel):
    transactions: List[TransactionHistoryItem]

class TransactionHistoryQuery(BaseModel):
    limit: int = 20
    offset: int = 0    


class DepositResponse(BaseModel):
    transaction_id:int
    message:str



class TransferResponse(BaseModel):
    transaction_id:int
    message:str
    transferred_to : str

class WithdrawalResponse(BaseModel):
    transaction_id:int
    message:str

class BalanceResponse(BaseModel):
    balance : float
    message :str



    class Config:
        from_attributes = True








