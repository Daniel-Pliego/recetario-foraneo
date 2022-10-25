from typing import Optional

from fastapi import Cookie, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError
from tortoise.exceptions import DoesNotExist

import app.utils.auth as auth
from app.core import Settings, get_settings
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)


async def get_current_user(
    access_token: str = Depends(oauth2_scheme),
    settings: Settings = Depends(get_settings),
) -> User:
    try:
        payload = auth.decode_jwt_token(access_token, settings.ACCESS_TOKEN_SECRET)
        user = await User.get(id=payload.sub)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.TokenExpiredException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user_cookie(
    refresh_token: str = Cookie(),
    settings: Settings = Depends(get_settings),
) -> User:
    try:
        payload = auth.decode_jwt_token(refresh_token, settings.REFRESH_TOKEN_SECRET)
        user = await User.get(id=payload.sub)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.TokenExpiredException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_user_optional(
    access_token: Optional[str] = Depends(optional_oauth2_scheme),
    settings: Settings = Depends(get_settings),
) -> Optional[User]:
    if not access_token:
        return None
    return await get_current_user(access_token, settings)


class Pagination:
    page: int
    limit: int
    offset: int

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    ) -> None:
        self.page = page
        self.limit = limit
        self.offset = self.__calculate_offset()

    def __calculate_offset(self) -> int:
        return (self.page - 1) * self.limit

    def get_previous_and_next_pages(
        self,
        results_count: int,
    ) -> tuple[Optional[int], Optional[int]]:
        previous_page = self.page - 1 if self.page > 1 else None
        next_page = self.page + 1 if results_count > self.limit else None
        return (previous_page, next_page)