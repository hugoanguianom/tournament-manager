from fastapi import FastAPI

app = FastAPI(title="TK3 Tournament Manager")

@app.get("/")
def home():
    return {"server on"}