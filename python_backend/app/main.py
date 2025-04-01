from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import performance, reports
from app.core.config import settings

app = FastAPI(
    title="Student Performance Analysis API",
    description="API for analyzing student performance and generating reports",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(performance.router, prefix="/api/performance", tags=["performance"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Student Performance Analysis API",
        "version": "1.0.0",
        "status": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 