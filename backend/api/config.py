from pydantic import BaseSettings


class Settings(BaseSettings):
    test: bool = False

    class Config: 
        env_file = ".env"
