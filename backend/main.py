from typing import Tuple, List

from fastapi import FastAPI

app = FastAPI()

@app.post("/infere")
def read_item(coordinates: List[Tuple[float, float]]):
    return {5}
