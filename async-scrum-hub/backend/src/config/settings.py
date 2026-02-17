from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Application configuration loaded from environment variables (.env).
#
# This class centralizes security-related settings such as:
# - JWT secret key (required)
# - JWT signing algorithm (default: HS256)
# - Access token expiration time (minutes)
#
# Using pydantic-settings ensures:
# - Strong typing and validation
# - Automatic loading from .env
# - Clear separation between configuration and business logic
class Settings(BaseSettings):
	jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
	jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
	access_token_expire_minutes: int = Field(30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

	model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# settings is an object created from the class Settings
settings = Settings()
