import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.generated_contents import Generated_contentsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/generated_contents", tags=["generated_contents"])


# ---------- Pydantic Schemas ----------
class Generated_contentsData(BaseModel):
    """Entity data schema (for create/update)"""
    content_type: str
    business_type: str
    prompt: str
    result_text: str = None
    result_image_url: str = None
    title: str = None


class Generated_contentsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    content_type: Optional[str] = None
    business_type: Optional[str] = None
    prompt: Optional[str] = None
    result_text: Optional[str] = None
    result_image_url: Optional[str] = None
    title: Optional[str] = None


class Generated_contentsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    content_type: str
    business_type: str
    prompt: str
    result_text: Optional[str] = None
    result_image_url: Optional[str] = None
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Generated_contentsListResponse(BaseModel):
    """List response schema"""
    items: List[Generated_contentsResponse]
    total: int
    skip: int
    limit: int


class Generated_contentsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Generated_contentsData]


class Generated_contentsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Generated_contentsUpdateData


class Generated_contentsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Generated_contentsBatchUpdateItem]


class Generated_contentsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Generated_contentsListResponse)
async def query_generated_contentss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query generated_contentss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying generated_contentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Generated_contentsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} generated_contentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying generated_contentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Generated_contentsListResponse)
async def query_generated_contentss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query generated_contentss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying generated_contentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Generated_contentsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} generated_contentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying generated_contentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Generated_contentsResponse)
async def get_generated_contents(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single generated_contents by ID (user can only see their own records)"""
    logger.debug(f"Fetching generated_contents with id: {id}, fields={fields}")
    
    service = Generated_contentsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Generated_contents with id {id} not found")
            raise HTTPException(status_code=404, detail="Generated_contents not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching generated_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Generated_contentsResponse, status_code=201)
async def create_generated_contents(
    data: Generated_contentsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new generated_contents"""
    logger.debug(f"Creating new generated_contents with data: {data}")
    
    service = Generated_contentsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create generated_contents")
        
        logger.info(f"Generated_contents created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating generated_contents: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating generated_contents: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Generated_contentsResponse], status_code=201)
async def create_generated_contentss_batch(
    request: Generated_contentsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple generated_contentss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} generated_contentss")
    
    service = Generated_contentsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} generated_contentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Generated_contentsResponse])
async def update_generated_contentss_batch(
    request: Generated_contentsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple generated_contentss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} generated_contentss")
    
    service = Generated_contentsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} generated_contentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Generated_contentsResponse)
async def update_generated_contents(
    id: int,
    data: Generated_contentsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing generated_contents (requires ownership)"""
    logger.debug(f"Updating generated_contents {id} with data: {data}")

    service = Generated_contentsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Generated_contents with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Generated_contents not found")
        
        logger.info(f"Generated_contents {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating generated_contents {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating generated_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_generated_contentss_batch(
    request: Generated_contentsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple generated_contentss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} generated_contentss")
    
    service = Generated_contentsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} generated_contentss successfully")
        return {"message": f"Successfully deleted {deleted_count} generated_contentss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_generated_contents(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single generated_contents by ID (requires ownership)"""
    logger.debug(f"Deleting generated_contents with id: {id}")
    
    service = Generated_contentsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Generated_contents with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Generated_contents not found")
        
        logger.info(f"Generated_contents {id} deleted successfully")
        return {"message": "Generated_contents deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting generated_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")