#!/usr/bin/env python
# -*- coding: utf-8 -*-
import asyncio
import importlib
import os
import pkgutil
from logging.config import fileConfig

import models
from alembic import context
from core.database import Base
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

# Auto-import all models
for _, module_name, _ in pkgutil.iter_modules(models.__path__):
    importlib.import_module(f"{models.__name__}.{module_name}")

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_database_url():
    """Get database URL from environment variable and convert to async driver."""
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        raise ValueError("DATABASE_URL environment variable is not set")
    # Convert sync postgres URL to async
    url = url.replace("postgresql://", "postgresql+asyncpg://")
    url = url.replace("postgres://", "postgresql+asyncpg://")
    return url

def alembic_include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and name in ["users", "sessions", "oidc_states"]:
        return False
    return True

async def run_migrations_online():
    database_url = get_database_url()
    connectable = create_async_engine(database_url, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(
            lambda sync_conn: context.configure(
                connection=sync_conn,
                target_metadata=target_metadata,
                compare_type=True,
                compare_server_default=True,
                include_object=alembic_include_object,
            )
        )
        async with connection.begin():
            await connection.run_sync(lambda sync_conn: context.run_migrations())
    await connectable.dispose()

def run_migrations():
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(run_migrations_online())
    except RuntimeError:
        asyncio.run(run_migrations_online())

run_migrations()