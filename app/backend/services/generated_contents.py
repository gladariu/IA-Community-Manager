import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.generated_contents import Generated_contents

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Generated_contentsService:
    """Service layer for Generated_contents operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Generated_contents]:
        """Create a new generated_contents"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Generated_contents(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created generated_contents with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating generated_contents: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for generated_contents {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Generated_contents]:
        """Get generated_contents by ID (user can only see their own records)"""
        try:
            query = select(Generated_contents).where(Generated_contents.id == obj_id)
            if user_id:
                query = query.where(Generated_contents.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching generated_contents {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of generated_contentss (user can only see their own records)"""
        try:
            query = select(Generated_contents)
            count_query = select(func.count(Generated_contents.id))
            
            if user_id:
                query = query.where(Generated_contents.user_id == user_id)
                count_query = count_query.where(Generated_contents.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Generated_contents, field):
                        query = query.where(getattr(Generated_contents, field) == value)
                        count_query = count_query.where(getattr(Generated_contents, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Generated_contents, field_name):
                        query = query.order_by(getattr(Generated_contents, field_name).desc())
                else:
                    if hasattr(Generated_contents, sort):
                        query = query.order_by(getattr(Generated_contents, sort))
            else:
                query = query.order_by(Generated_contents.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching generated_contents list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Generated_contents]:
        """Update generated_contents (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Generated_contents {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated generated_contents {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating generated_contents {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete generated_contents (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Generated_contents {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted generated_contents {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting generated_contents {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Generated_contents]:
        """Get generated_contents by any field"""
        try:
            if not hasattr(Generated_contents, field_name):
                raise ValueError(f"Field {field_name} does not exist on Generated_contents")
            result = await self.db.execute(
                select(Generated_contents).where(getattr(Generated_contents, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching generated_contents by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Generated_contents]:
        """Get list of generated_contentss filtered by field"""
        try:
            if not hasattr(Generated_contents, field_name):
                raise ValueError(f"Field {field_name} does not exist on Generated_contents")
            result = await self.db.execute(
                select(Generated_contents)
                .where(getattr(Generated_contents, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Generated_contents.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching generated_contentss by {field_name}: {str(e)}")
            raise