import logging
from logging.config import fileConfig
from flask import current_app
from alembic import context
from app.extensions import db

config = context.config
fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

target_metadata = db.metadata


def get_engine():
    return current_app.extensions["migrate"].db.get_engine()


def run_migrations_offline():
    url = current_app.config.get("SQLALCHEMY_DATABASE_URI")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = get_engine()
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
