from fastapi import FastAPI

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from appointments.router import router as appointments_router
from consumer_ratings.router import router as consumer_ratings_router
from items.router import router as items_router
from services.router import router as services_router
from students.router import router as students_router
from vendor_ratings.router import router as vendor_ratings_router
from vendors.router import router as vendors_router

app = FastAPI(title="HokieExchange")

app.include_router(students_router)
app.include_router(vendors_router)
app.include_router(items_router)
app.include_router(services_router)
app.include_router(appointments_router)
app.include_router(consumer_ratings_router)
app.include_router(vendor_ratings_router)


@app.get("/", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
