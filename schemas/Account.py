from pydantic import BaseModel
from datetime import datetime


class AccountCreate(BaseModel):
    currency:str
    # balance:float






class AccountResponse(BaseModel):
    account_number:str
    # user_id: int
    created_at: datetime
    updated_at: datetime
    # balance:float
    currency:str

    class Config:
        from_attributes = True