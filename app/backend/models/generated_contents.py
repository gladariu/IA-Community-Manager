from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Generated_contents(Base):
    __tablename__ = "generated_contents"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    result_text = Column(String, nullable=True)
    result_image_url = Column(String, nullable=True)
    title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)