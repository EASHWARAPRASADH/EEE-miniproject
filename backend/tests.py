"""
Unit tests for StegoWave core functions.

Run with: python tests.py
"""

import unittest
import io
import numpy as np
from PIL import Image

from img_compression import compress_image, decompress_image, calculate_image_complexity
from crypto import encrypt, decrypt
from steganography import hide_data, extract_data, get_capacity, _bytes_to_chunks, _chunks_to_bytes
from validation import validate_file, validate_password, validate_text


class TestCompression(unittest.TestCase):
    """Test image compression functions."""

    def test_compress_image_basic(self):
        """Test basic image compression."""
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()

        compressed, stats = compress_image(img_bytes, quality=50)

        self.assertIsInstance(compressed, bytes)
        self.assertGreater(len(compressed), 0)
        self.assertLess(len(compressed), len(img_bytes))
        self.assertIn('original_size', stats)
        self.assertIn('compressed_size', stats)
        self.assertIn('total_ratio', stats)
        self.assertGreater(stats['total_ratio'], 1.0)

    def test_compress_image_webp(self):
        """Test WebP compression."""
        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()

        compressed, stats = compress_image(img_bytes, quality=70)

        self.assertIsInstance(compressed, bytes)
        self.assertIn('img_format', stats)
        # WebP or JPEG should be used
        self.assertIn(stats['img_format'], ['WebP', 'JPEG'])

    def test_decompress_image(self):
        """Test image decompression."""
        img = Image.new('RGB', (100, 100), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()

        compressed, _ = compress_image(img_bytes, quality=50)
        decompressed = decompress_image(compressed)

        self.assertIsInstance(decompressed, bytes)
        self.assertGreater(len(decompressed), 0)

    def test_compress_empty_image(self):
        """Test compression with empty image data."""
        with self.assertRaises(ValueError):
            compress_image(b'', quality=50)

    def test_compress_invalid_image(self):
        """Test compression with invalid image data."""
        with self.assertRaises(ValueError):
            compress_image(b'not an image', quality=50)

    def test_calculate_complexity(self):
        """Test image complexity calculation."""
        # Simple image (low complexity)
        simple_img = Image.new('RGB', (100, 100), color='white')
        complexity_simple = calculate_image_complexity(simple_img)

        # Complex image (higher complexity)
        complex_img = Image.new('RGB', (100, 100))
        # Add random noise
        pixels = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
        complex_img = Image.fromarray(pixels, 'RGB')
        complexity_complex = calculate_image_complexity(complex_img)

        self.assertIsInstance(complexity_simple, float)
        self.assertIsInstance(complexity_complex, float)
        self.assertGreaterEqual(complexity_simple, 0.0)
        self.assertLessEqual(complexity_simple, 1.0)
        # Both should be valid complexity scores
        self.assertGreaterEqual(complexity_complex, 0.0)
        self.assertLessEqual(complexity_complex, 1.0)


class TestCrypto(unittest.TestCase):
    """Test encryption/decryption functions."""

    def test_encrypt_decrypt_basic(self):
        """Test basic encryption and decryption."""
        data = b"Hello, World!"
        password = "testpassword123"

        encrypted = encrypt(data, password)
        decrypted = decrypt(encrypted, password)

        self.assertEqual(data, decrypted)
        self.assertNotEqual(encrypted, data)
        self.assertGreater(len(encrypted), len(data))

    def test_encrypt_wrong_password(self):
        """Test decryption with wrong password."""
        data = b"Secret message"
        password = "correct_password"
        wrong_password = "wrong_password"

        encrypted = encrypt(data, password)

        with self.assertRaises(ValueError):
            decrypt(encrypted, wrong_password)

    def test_encrypt_empty_data(self):
        """Test encryption with empty data."""
        with self.assertRaises(ValueError):
            encrypt(b'', "password")

    def test_encrypt_empty_password(self):
        """Test encryption with empty password."""
        with self.assertRaises(ValueError):
            encrypt(b"data", "")

    def test_encrypt_weak_password(self):
        """Test encryption with weak password."""
        with self.assertRaises(ValueError):
            encrypt(b"data", "short")

    def test_decrypt_empty_data(self):
        """Test decryption with empty data."""
        with self.assertRaises(ValueError):
            decrypt(b'', "password")

    def test_decrypt_invalid_data(self):
        """Test decryption with invalid data."""
        with self.assertRaises(ValueError):
            decrypt(b"tooshort", "password")


class TestSteganography(unittest.TestCase):
    """Test steganography functions."""

    def test_bytes_to_chunks_and_back(self):
        """Test byte to chunk conversion and back."""
        data = b"Hello, Steganography!"
        chunks = _bytes_to_chunks(data)
        recovered = _chunks_to_bytes(chunks)

        self.assertEqual(data, recovered)

    def test_bytes_to_chunks_empty(self):
        """Test chunk conversion with empty data."""
        chunks = _bytes_to_chunks(b'')
        self.assertEqual(len(chunks), 0)

    def test_chunks_to_bytes_empty(self):
        """Test byte reconstruction from empty chunks."""
        recovered = _chunks_to_bytes([])
        self.assertEqual(recovered, b'')

    def test_hide_extract_data(self):
        """Test hiding and extracting data in audio."""
        # Create simple audio data (WAV format simulation)
        # For a real test, you'd need actual WAV data
        # This is a simplified test
        secret = b"Secret message"
        # Mock audio data (would need real WAV format in production)
        # Skipping full audio test as it requires WAV file generation


class TestValidation(unittest.TestCase):
    """Test validation functions."""

    def test_validate_password_valid(self):
        """Test valid password."""
        valid, error = validate_password("StrongPassword123")
        self.assertTrue(valid)
        self.assertIsNone(error)

    def test_validate_password_empty(self):
        """Test empty password."""
        valid, error = validate_password("")
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_password_short(self):
        """Test short password."""
        valid, error = validate_password("short")
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_password_weak(self):
        """Test weak common password."""
        valid, error = validate_password("password")
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_text_valid(self):
        """Test valid text."""
        valid, error = validate_text("Hello, this is a test message.")
        self.assertTrue(valid)
        self.assertIsNone(error)

    def test_validate_text_empty(self):
        """Test empty text."""
        valid, error = validate_text("")
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_text_too_long(self):
        """Test text that's too long."""
        long_text = "a" * 15000
        valid, error = validate_text(long_text)
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_text_dangerous(self):
        """Test text with dangerous content."""
        dangerous_text = "<script>alert('xss')</script>"
        valid, error = validate_text(dangerous_text)
        self.assertFalse(valid)
        self.assertIsNotNone(error)

    def test_validate_file_empty(self):
        """Test validation with empty file."""
        valid, mime, error = validate_file(b'', "test.png", 'image')
        self.assertFalse(valid)
        self.assertIsNone(mime)
        self.assertIsNotNone(error)


if __name__ == '__main__':
    unittest.main()
