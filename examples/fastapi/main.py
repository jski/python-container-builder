import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(
    title="FastAPI Example",
    description="Example application built with python-container-builder",
    version="1.0.0"
)


class EchoRequest(BaseModel):
    message: str


class EchoResponse(BaseModel):
    echo: str
    timestamp: str


@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "FastAPI Example",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/time")
async def get_time():
    """Returns the current server time."""
    return {
        "current_time": datetime.now().isoformat(),
        "timezone": "UTC"
    }


@app.post("/echo", response_model=EchoResponse)
async def echo(request: EchoRequest):
    """Echoes back the message with a timestamp."""
    return EchoResponse(
        echo=request.message,
        timestamp=datetime.now().isoformat()
    )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
