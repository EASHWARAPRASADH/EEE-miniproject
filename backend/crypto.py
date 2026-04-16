"""
AES-256-GCM encryption with PBKDF2 key derivation.
Password is required to encrypt/decrypt. Wrong password = authentication failure.
"""

import os
import struct
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256


PBKDF2_ITERATIONS = 100_000
SALT_SIZE = 16
NONCE_SIZE = 16
TAG_SIZE = 16


def derive_key(password: str, salt: bytes) -> bytes:
    """Derive a 256-bit key from password using PBKDF2-SHA256."""
    return PBKDF2(
        password.encode("utf-8"),
        salt,
        dkLen=32,
        count=PBKDF2_ITERATIONS,
        prf=lambda p, s: __import__("hmac").new(p, s, SHA256).digest()
    )


def encrypt(data: bytes, password: str) -> bytes:
    """
    Encrypt data with AES-256-GCM.
    Output format: [SALT(16)] [NONCE(16)] [TAG(16)] [CIPHERTEXT]

    Raises:
        ValueError: If password is empty or data is empty
    """
    if not data or len(data) == 0:
        raise ValueError("Data to encrypt is empty. Please provide valid data.")
    if not password or len(password) == 0:
        raise ValueError("Password is required for encryption. Please provide a password.")
    if len(password) < 8:
        raise ValueError("Password is too weak. Minimum 8 characters required.")

    salt = os.urandom(SALT_SIZE)
    nonce = os.urandom(NONCE_SIZE)
    key = derive_key(password, salt)

    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(data)

    return salt + nonce + tag + ciphertext


def decrypt(data: bytes, password: str) -> bytes:
    """
    Decrypt AES-256-GCM data.
    Raises ValueError if password is wrong or data is tampered.
    """
    if not data or len(data) == 0:
        raise ValueError("Encrypted data is empty. Please provide valid encrypted data.")
    if not password or len(password) == 0:
        raise ValueError("Password is required for decryption. Please provide a password.")
    if len(data) < SALT_SIZE + NONCE_SIZE + TAG_SIZE:
        raise ValueError(f"Invalid encrypted data: too short ({len(data)} bytes). Expected at least {SALT_SIZE + NONCE_SIZE + TAG_SIZE} bytes.")

    salt = data[:SALT_SIZE]
    nonce = data[SALT_SIZE:SALT_SIZE + NONCE_SIZE]
    tag = data[SALT_SIZE + NONCE_SIZE:SALT_SIZE + NONCE_SIZE + TAG_SIZE]
    ciphertext = data[SALT_SIZE + NONCE_SIZE + TAG_SIZE:]

    key = derive_key(password, salt)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)

    try:
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    except Exception as e:
        raise ValueError(f"Decryption failed: incorrect password or corrupted data. Error: {str(e)}")

    return plaintext
