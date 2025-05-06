from dataclasses import dataclass
from enum import Enum
from typing import Optional

class EmbeddingProvider(Enum):
    BEDROCK = "bedrock"
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"

@dataclass
# 强制类型标注，提高代码可读性和类型安全性
# 这里可以对比一下pydantic和dataclass的区别

class EmbeddingConfig:
    provider: EmbeddingProvider
    model_name: str  # 直接使用字符串，而不是枚举
    aws_region: Optional[str] = None
