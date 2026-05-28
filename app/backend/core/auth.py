import base64
import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import httpx
from core.config import settings
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWSSignatureError, JWTClaimsError

logger = logging.getLogger(__name__)


def generate_state() -> str:
    return secrets.token_urlsafe(32)


def generate_nonce() -> str:
    return secrets.token_urlsafe(32)


def generate_code_verifier() -> str:
    return secrets.token_urlsafe(96)


def generate_code_challenge(code_verifier: str) -> str:
    digest = hashlib.sha256(code_verifier.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")


async def get_jwks() -> Dict[str, Any]:
    jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise Exception("Unable to retrieve authentication keys")


class IDTokenValidationError(Exception):
    def __init__(self, message: str, error_type: str = "validation_error"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)


class AccessTokenError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


def create_access_token(claims: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    if not settings.jwt_secret_key:
        raise ValueError("JWT secret key is not configured")

    now = datetime.now(timezone.utc)
    token_claims = claims.copy()
    expiry_minutes = expires_minutes if expires_minutes is not None else int(settings.jwt_expire_minutes)
    expire_at = now + timedelta(minutes=expiry_minutes)
    token_claims.update({"exp": expire_at, "iat": now, "nbf": now})
    return jwt.encode(token_claims, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    if not settings.jwt_secret_key:
        raise AccessTokenError("Authentication service is misconfigured")
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except ExpiredSignatureError as exc:
        raise AccessTokenError("Token has expired") from exc
    except JWTError as exc:
        raise AccessTokenError("Invalid authentication token") from exc


async def validate_id_token(id_token: str) -> Optional[Dict[str, Any]]:
    try:
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")
        if not kid:
            raise IDTokenValidationError("Token format is invalid", "missing_kid")

        jwks = await get_jwks()
        key = None
        for jwk in jwks.get("keys", []):
            if jwk.get("kid") == kid:
                key = jwk
                break

        if not key:
            raise IDTokenValidationError("Authentication key validation failed", "key_not_found")

        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import rsa

        def base64url_decode(inp):
            padding = 4 - (len(inp) % 4)
            if padding != 4:
                inp += "=" * padding
            return base64.urlsafe_b64decode(inp)

        n = int.from_bytes(base64url_decode(key["n"]), "big")
        e = int.from_bytes(base64url_decode(key["e"]), "big")
        public_numbers = rsa.RSAPublicNumbers(e, n)
        public_key = public_numbers.public_key()
        pem_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        payload = jwt.decode(
       	 id_token,
    	 pem_key,
    	 algorithms=["RS256"],
   	 issuer="https://accounts.google.com",
    	 audience=settings.oidc_client_id,
    	 options={"verify_at_hash": False},
        )
        return payload

    except IDTokenValidationError:
        raise
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise IDTokenValidationError("Authentication processing failed", "unexpected_error")


def build_authorization_url(
    state: str,
    nonce: str,
    code_challenge: Optional[str] = None,
    redirect_uri: Optional[str] = None,
) -> str:
    import urllib.parse

    params = {
        "client_id": settings.oidc_client_id,
        "response_type": "code",
        "scope": settings.oidc_scope,
        "redirect_uri": redirect_uri or f"{settings.backend_url}/api/v1/auth/callback",
        "state": state,
        "nonce": nonce,
    }

    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return auth_url


def build_logout_url(id_token: Optional[str] = None) -> str:
    import urllib.parse

    params = {"post_logout_redirect_uri": f"{settings.frontend_url}/logout-callback"}
    if id_token:
        params["id_token_hint"] = id_token

    logout_url = "https://oauth2.googleapis.com/revoke?" + urllib.parse.urlencode(params)
    return logout_url
