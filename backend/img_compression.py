"""
AI Image Compression using WebP/JPEG + zlib pipeline.

Compression pipeline:
  1. Resize to max 384-640px depending on quality
  2. WebP encode at mapped quality (25-92) - 20-30% better than JPEG
  3. zlib on WebP bytes for extra 10-20% reduction

Decompression:
  1. zlib decompress
  2. WebP decode
  3. Bicubic upsample to original size
  4. Unsharp mask for crispness

Note: WebP fallback to JPEG if PIL doesn't support WebP.
Neural compression is available as an optional enhancement.
"""

import io
import zlib
import struct
import numpy as np
from PIL import Image, ImageFilter

# Try to import neural compression (optional)
try:
    from neural_compression import compress_image_neural, decompress_image_neural, is_available
    NEURAL_COMPRESSION_AVAILABLE = is_available()
except ImportError:
    NEURAL_COMPRESSION_AVAILABLE = False


def calculate_image_complexity(img: Image.Image) -> float:
    """
    Calculate image complexity score (0-1) using edge detection and variance.
    Higher complexity = more edges/detail = needs higher quality.
    """
    # Convert to grayscale for complexity analysis
    gray = img.convert('L')
    gray_array = np.array(gray, dtype=np.float64)

    # Calculate variance (measure of detail)
    variance = np.var(gray_array) / (255.0 ** 2)  # Normalize to 0-1

    # Calculate edge density using Sobel-like filter
    from PIL import ImageFilter
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edge_array = np.array(edges, dtype=np.float64)
    edge_density = np.mean(edge_array > 50) / 255.0  # Normalize to 0-1

    # Combine metrics (weighted average)
    complexity = (0.6 * variance + 0.4 * edge_density)

    return min(max(complexity, 0.1), 0.9)  # Clamp to 0.1-0.9


def compress_image(image_bytes: bytes, quality: int = 50, use_neural: bool = False) -> tuple:
    """
    Compress image using WebP (preferred) or JPEG + zlib, or neural autoencoder.

    quality: 1-100
      - 80-90: Very good, larger payload (~300-500KB for 4MB image)
      - 50-70: Good quality, medium payload (~100-250KB)
      - 20-40: Acceptable, small payload (~40-100KB)
      - 10-20: Low quality, tiny payload (~20-50KB)

    use_neural: If True, use neural autoencoder compression (requires PyTorch)

    Returns:
        tuple: (compressed_bytes, stats_dict)
            compressed_bytes — zlib(header + image_bytes), ready for encryption
            stats_dict — all intermediate sizes for UI display

    Raises:
        ValueError: If image is invalid or too small
        IOError: If image cannot be processed
    """
    # Use neural compression if requested and available
    if use_neural:
        if not NEURAL_COMPRESSION_AVAILABLE:
            print("[COMPRESS] Neural compression not available, falling back to traditional")
        else:
            print("[COMPRESS] Using neural autoencoder compression")
            return compress_image_neural(image_bytes, quality)
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Image data is empty. Please provide a valid image file.")

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid image format: {str(e)}. Supported formats: PNG, JPG, WEBP, BMP, GIF.")

    orig_w, orig_h = img.size

    if orig_w < 16 or orig_h < 16:
        raise ValueError(f"Image too small: {orig_w}x{orig_h}. Minimum size is 16x16 pixels.")

    # Calculate image complexity for content-aware adjustment
    complexity = calculate_image_complexity(img)

    # Map quality slider (1-100) to internal quality (25-92)
    # Adjust based on complexity: complex images get higher quality
    base_quality = int(25 + (quality / 100) * 67)
    complexity_boost = int((complexity - 0.5) * 20)  # -10 to +10 based on complexity
    img_quality = max(25, min(92, base_quality + complexity_boost))

    # Determine resize target based on quality
    if quality >= 70:
        max_dim = 640
    elif quality >= 40:
        max_dim = 512
    else:
        max_dim = 384

    # Resize preserving aspect ratio
    scale = min(max_dim / orig_w, max_dim / orig_h, 1.0)
    new_w = max(16, int(orig_w * scale))
    new_h = max(16, int(orig_h * scale))

    img_resized = img.resize((new_w, new_h), Image.LANCZOS)

    # Try WebP first (better compression), fallback to JPEG
    img_buf = io.BytesIO()
    use_webp = True
    try:
        img_resized.save(img_buf, format='WebP', quality=img_quality,
                         method=6, lossless=False)
        img_bytes = img_buf.getvalue()
        img_format = 'WebP'
    except Exception:
        # Fallback to JPEG if WebP not supported
        img_buf = io.BytesIO()
        img_resized.save(img_buf, format='JPEG', quality=img_quality,
                         optimize=True, progressive=True)
        img_bytes = img_buf.getvalue()
        img_format = 'JPEG'
        use_webp = False

    img_size = len(img_bytes)  # actual image format size

    # Pack header: format(1), orig_w(4), orig_h(4)
    format_byte = b'W' if use_webp else b'J'
    header = format_byte + struct.pack('>II', orig_w, orig_h)

    # zlib compress the header + image bytes
    compressed = zlib.compress(header + img_bytes, level=6)
    compressed_size = len(compressed)

    # Build stats dict for UI
    stats = {
        'original_size':     len(image_bytes),          # raw input bytes
        'orig_w':            orig_w,
        'orig_h':            orig_h,
        'resized_w':         new_w,
        'resized_h':         new_h,
        'img_quality':       img_quality,
        'img_format':        img_format,
        'img_size':          img_size,                  # viewable image size
        'compressed_size':   compressed_size,            # after zlib (what gets encrypted)
        'img_ratio':         round(len(image_bytes) / img_size, 1),
        'total_ratio':       round(len(image_bytes) / compressed_size, 1),
        'complexity':        round(complexity, 2),       # 0-1 complexity score
    }

    print(f"[COMPRESS] {len(image_bytes)/1024:.0f}KB "
          f"→ resize {orig_w}x{orig_h}→{new_w}x{new_h} "
          f"→ {img_format} q{img_quality}: {img_size/1024:.1f}KB "
          f"→ zlib: {compressed_size/1024:.1f}KB "
          f"(ratio {stats['total_ratio']}x, complexity {stats['complexity']})")

    return compressed, stats


def decompress_image(compressed_bytes: bytes) -> bytes:
    """
    Decompress image back to original dimensions.
    Returns PNG bytes.
    """
    # Check if neural compression format ('N' for old, 'A' for Advanced)
    if len(compressed_bytes) > 0 and (compressed_bytes[0:1] == b'N' or compressed_bytes[0:1] == b'A'):
        if NEURAL_COMPRESSION_AVAILABLE:
            return decompress_image_neural(compressed_bytes)
        else:
            raise ValueError("Neural compression data detected but PyTorch not available")

    # Traditional WebP/JPEG decompression
    raw = zlib.decompress(compressed_bytes)
    format_byte = raw[0:1]
    orig_w, orig_h = struct.unpack('>II', raw[1:9])
    img_bytes = raw[9:]

    # Decode based on format
    img_format = 'WebP' if format_byte == b'W' else 'JPEG'
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    if img.size != (orig_w, orig_h):
        img = img.resize((orig_w, orig_h), Image.BICUBIC)

    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))

    out = io.BytesIO()
    img.save(out, format='PNG', optimize=False)
    return out.getvalue()


def get_compression_ratio(original_bytes: bytes, compressed_bytes: bytes) -> float:
    return len(original_bytes) / len(compressed_bytes)