from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from DataBase.db import Base , engine
from routers import user,auth,account,transactions



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    # Allow frontend dev servers running on other localhost ports (e.g. 5174).
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base.metadata.create_all(bind = engine)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(account.router)
app.include_router(transactions.router)


