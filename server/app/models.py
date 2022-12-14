from typing import Optional

import bleach
import markdown as md
from bleach_allowlist import markdown_attrs, markdown_tags
from tortoise import Tortoise, fields
from tortoise.contrib.pydantic import pydantic_model_creator, pydantic_queryset_creator
from tortoise.models import Model

from app.core import get_settings
from app.utils import jwt


class TimestampMixin:
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)


class CreatedAtMixin:
    created_at = fields.DatetimeField(auto_now_add=True)


class AbstractBase(TimestampMixin, Model):
    id = fields.UUIDField(pk=True)

    class Meta:
        abstract = True


class Like(CreatedAtMixin, Model):
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        "models.User", related_name="likes"
    )
    recipe: fields.ForeignKeyRelation["Recipe"] = fields.ForeignKeyField(
        "models.Recipe", related_name="likes", on_delete=fields.CASCADE
    )

    class Meta:
        unique_together = ("user", "recipe")


class User(AbstractBase, TimestampMixin):
    username = fields.CharField(max_length=15, unique=True)
    display_name: Optional[str] = fields.CharField(max_length=50, null=True)
    password_hash = fields.CharField(max_length=60)
    recipe_count = fields.IntField(default=0)

    @classmethod
    def ctor(
        cls, username: str, plain_password: str, display_name: Optional[str] = None
    ) -> "User":
        user = cls(username=username, display_name=display_name)
        user.password = plain_password
        return user

    @property
    def password(self) -> str:
        raise AttributeError("password is not a readable attribute")

    @password.setter
    def password(self, plain_password: str) -> None:
        self.password_hash = jwt.generate_hash_from_plain_password(plain_password)

    def verify_plain_password(self, plain_password: str) -> bool:
        return jwt.verify_plain_password_against_hash(
            plain_password, self.password_hash
        )

    def generate_jwt_token(self, secret_key: str, time_delta: int = 15) -> str:
        return jwt.generate_jwt_token(str(self.id), secret_key, time_delta)

    class PydanticMeta:
        include = ("username", "display_name")


class Recipe(AbstractBase):
    title = fields.CharField(max_length=75)
    content_md = fields.TextField()
    content_html = fields.TextField()

    thumbnail = fields.BinaryField()
    thumbnail_media_type = fields.CharField(max_length=50)

    created_by: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        "models.User", related_name="recipes"
    )

    @classmethod
    def ctor(
        cls,
        title: str,
        content_md: str,
        thumbnail: bytes,
        thumbnail_media_type: str,
        created_by: "User",
    ) -> "Recipe":
        recipe = cls(
            title=title,
            thumbnail=thumbnail,
            thumbnail_media_type=thumbnail_media_type,
            created_by=created_by,
        )
        recipe.content = content_md
        return recipe

    @property
    def content(self) -> str:
        return self.content_md

    @content.setter
    def content(self, content_md: str) -> None:
        self.content_md = content_md
        real_html = md.markdown(content_md)
        self.content_html = bleach.clean(real_html, markdown_tags, markdown_attrs)

    def likes_count(self) -> int:
        raise AttributeError("likes_count is not a readable attribute, use annotate")

    def liked(self) -> Optional[bool]:
        # Default value of the computed field, will be overwritten by the annotate when
        # the user is authenticated.
        return None

    def viewers(self) -> Optional[int]:
        return None

    def thumbnail_url(self) -> str:
        settings = get_settings()
        return f"{settings.API_URL}/recipes/{self.id}/thumbnail"

    class PydanticMeta:
        exclude = ("thumbnail", "thumbnail_media_type", "likes")
        computed = ("likes_count", "thumbnail_url", "liked", "viewers")


Tortoise.init_models(["app.models"], "models")

Recipe_Pydantic = pydantic_model_creator(Recipe)
RecipeList_Pydantic = pydantic_queryset_creator(
    Recipe, exclude=("content_md", "content_html")
)
User_Pydantic = pydantic_model_creator(User)
