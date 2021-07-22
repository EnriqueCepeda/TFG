from pydantic import BaseSettings


class Settings(BaseSettings):
    test: bool = False
