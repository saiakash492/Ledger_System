from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from settings import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.APP_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

async def send_welcome_email(email: EmailStr, name: str):

    message = MessageSchema(
        subject="Welcome to Ledger",
        recipients=[email],
        body=f"Hello {name}, your account was created successfully.",
        subtype="plain"
    )

    fm = FastMail(conf)

    await fm.send_message(message)