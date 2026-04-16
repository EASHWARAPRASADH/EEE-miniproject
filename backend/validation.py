"""
File type validation and security checks for StegoWave.

Ensures uploaded files are safe and valid before processing.
"""

import io
from typing import Tuple, Optional

# Try to import python-magic, make it optional
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False


# Allowed MIME types
ALLOWED_IMAGE_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/gif',
}

ALLOWED_AUDIO_TYPES = {
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mpeg',
    'audio/mp3',
    'audio/x-mpeg-3',
    'audio/flac',
    'audio/x-flac',
    'audio/ogg',
    'audio/x-ogg',
}

# Maximum file sizes (in bytes)
MAX_IMAGE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_AUDIO_SIZE = 100 * 1024 * 1024  # 100MB
MAX_TEXT_LENGTH = 10000  # 10,000 characters


def validate_file(file_bytes: bytes, filename: str, expected_type: str = 'image') -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate uploaded file for type, size, and security.

    Args:
        file_bytes: Raw file content
        filename: Original filename
        expected_type: 'image' or 'audio'

    Returns:
        Tuple of (is_valid, mime_type, error_message)
    """
    if not file_bytes or len(file_bytes) == 0:
        return False, None, "File is empty. Please provide a valid file."

    # Check file size
    if expected_type == 'image':
        if len(file_bytes) > MAX_IMAGE_SIZE:
            return False, None, f"Image file too large: {len(file_bytes)/(1024*1024):.1f}MB. Maximum allowed is {MAX_IMAGE_SIZE/(1024*1024):.0f}MB."
    elif expected_type == 'audio':
        if len(file_bytes) > MAX_AUDIO_SIZE:
            return False, None, f"Audio file too large: {len(file_bytes)/(1024*1024):.1f}MB. Maximum allowed is {MAX_AUDIO_SIZE/(1024*1024):.0f}MB."

    # Detect MIME type using python-magic if available, otherwise fallback to extension
    if MAGIC_AVAILABLE:
        try:
            mime = magic.Magic(mime=True)
            detected_mime = mime.from_buffer(file_bytes)
        except Exception as e:
            # Fallback to extension if magic fails
            detected_mime = _mime_from_extension(filename)
    else:
        # Fallback to extension-based detection
        detected_mime = _mime_from_extension(filename)

    # Validate MIME type
    if expected_type == 'image':
        if detected_mime not in ALLOWED_IMAGE_TYPES:
            return False, detected_mime, f"Invalid image type: {detected_mime}. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}."
    elif expected_type == 'audio':
        if detected_mime not in ALLOWED_AUDIO_TYPES:
            # WAV files sometimes detected as audio/x-wav, be more permissive
            if 'wav' not in detected_mime.lower() and 'audio' not in detected_mime.lower():
                return False, detected_mime, f"Invalid audio type: {detected_mime}. Allowed types: WAV, MP3, FLAC, OGG."

    return True, detected_mime, None


def validate_text(text: str) -> Tuple[bool, Optional[str]]:
    """
    Validate text message for security and length.

    Args:
        text: Text message to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not text or len(text.strip()) == 0:
        return False, "Text message is empty. Please enter a message."

    if len(text) > MAX_TEXT_LENGTH:
        return False, f"Text message too long: {len(text)} characters. Maximum allowed is {MAX_TEXT_LENGTH} characters."

    # Check for potentially dangerous content
    dangerous_patterns = ['<script', 'javascript:', 'data:', 'vbscript:']
    text_lower = text.lower()
    for pattern in dangerous_patterns:
        if pattern in text_lower:
            return False, f"Text contains potentially dangerous content: {pattern}"

    return True, None


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password for minimum strength requirements.

    Args:
        password: Password to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password or len(password) == 0:
        return False, "Password is required."

    if len(password) < 8:
        return False, "Password is too weak. Minimum 8 characters required."

    # Check for common weak passwords
    weak_passwords = ['password', '12345678', 'qwerty', 'abcdefg', '123456789']
    if password.lower() in weak_passwords:
        return False, "Password is too common. Please choose a stronger password."

    return True, None


def _mime_from_extension(filename: str) -> str:
    """
    Fallback MIME type detection from file extension.
    Used when python-magic is not available.
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    mime_map = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'gif': 'image/gif',
        'wav': 'audio/wav',
        'mp3': 'audio/mpeg',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg',
    }
    return mime_map.get(ext, 'application/octet-stream')


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    """
    # Remove directory separators
    filename = filename.replace('/', '').replace('\\', '')
    # Remove potentially dangerous characters
    dangerous_chars = ['..', '\x00']
    for char in dangerous_chars:
        filename = filename.replace(char, '')
    return filename
