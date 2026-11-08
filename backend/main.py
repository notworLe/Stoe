from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def greating():
    return "Hello world!"