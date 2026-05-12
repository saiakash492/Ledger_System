from pydantic import BaseModel, EmailStr



class UserCreate(BaseModel):
    name:str
    password :str
    email:EmailStr
    


class UserResponse(BaseModel):
    id : int
    name : str
    email : str
    is_active: bool
    class Config:
        from_attributes = True