from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY : str
    ALGORITHM:str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES : int = 30 
    DATABASE_URL : str
    MAIL_USERNAME: str
    MAIL_FROM: str
    MAIL_SERVER: str
    MAIL_PORT: int
    APP_PASSWORD: str

    class Config:
        env_file = ".env"

settings =  Settings()
