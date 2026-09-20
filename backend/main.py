from fastapi import FastAPI

import model_registry  # noqa: F401  # Registers every feature model with SQLAlchemy.
from appointments.router import router as appointments_router
from consumer_ratings.router import router as consumer_ratings_router
from items.router import router as items_router
from services.router import router as services_router
from students.router import router as students_router
from vendor_ratings.router import router as vendor_ratings_router
from vendors.router import router as vendors_router
from identity.router import router as identity_router
from chat.router import router as chat_router
from chat.runtime import lifespan
from chat.transport import sio, origins
from fastapi.middleware.cors import CORSMiddleware
import socketio

app = FastAPI(title="HokieExchange", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"])
app.include_router(identity_router)
app.include_router(chat_router)

app.include_router(students_router)
app.include_router(vendors_router)
app.include_router(items_router)
app.include_router(services_router)
app.include_router(appointments_router)
app.include_router(consumer_ratings_router)
app.include_router(vendor_ratings_router)


@app.get("/", tags=["Health"])
def get() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}

app = socketio.ASGIApp(sio, other_asgi_app=app)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
