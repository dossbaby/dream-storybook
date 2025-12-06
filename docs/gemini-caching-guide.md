# Gemini API 컨텍스트 캐싱 가이드 - 드림 해석 앱

## 핵심 개념

Gemini는 두 가지 캐싱 방식을 제공한다:
1. **암시적 캐싱**: Gemini 2.5 모델에서 자동 적용 (별도 설정 불필요)
2. **명시적 캐싱**: 개발자가 직접 캐시를 생성하고 관리

---

## 암시적 캐싱 (Gemini 2.5)

### 자동으로 작동하는 방식

Gemini 2.5 모델에서는 별도 설정 없이 캐시가 자동 적용된다. 동일한 프롬프트 프리픽스를 반복 사용하면 비용이 자동 할인된다.

### 최소 토큰 요구사항

| 모델 | 최소 토큰 |
|------|-----------|
| Gemini 2.5 Flash | 1,024 |
| Gemini 2.5 Pro | 4,096 |
| Gemini 3 Pro Preview | 2,048 |

### 암시적 캐시 적중률 높이기

```python
from google import genai

# ✅ 좋은 예: 공통 콘텐츠를 프롬프트 시작에 배치
prompt = """
[긴 시스템 지침 - 변하지 않음]
당신은 전문 꿈 해석가입니다...
(1000+ 토큰의 지침)

[사용자 입력 - 매번 변함]
어젯밤 꿈을 꿨는데요...
"""

# ❌ 나쁜 예: 변하는 내용이 앞에 있음
prompt = """
[사용자 입력]
어젯밤 꿈을 꿨는데요...

[시스템 지침]
위 꿈을 다음 원칙에 따라 해석해주세요...
"""
```

### 암시적 캐싱 확인

```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="프롬프트 내용..."
)

# usage_metadata에서 캐시 적중 토큰 확인
print(response.usage_metadata)
# cached_content_token_count 필드로 캐시 히트 확인
```

---

## 명시적 캐싱 (권장)

비용 절감을 **보장**받으려면 명시적 캐싱을 사용해야 한다.

### 작동 방식

1. 캐시 생성 → 고유 캐시 이름 반환
2. 후속 요청에서 캐시 이름 참조
3. TTL(기본 1시간) 후 자동 삭제

### 기본 구현 (Python)

```python
from google import genai
from google.genai.types import Content, Part

client = genai.Client(api_key="YOUR_API_KEY")

# 꿈 해석 시스템 프롬프트
DREAM_SYSTEM_PROMPT = """
당신은 전문 꿈 해석가입니다. 사용자의 꿈을 분석할 때 다음 원칙을 따르세요:

## 해석 프레임워크
1. 감정 분석: 꿈에서 느낀 감정의 의미
2. 상징 해석: 등장하는 사물, 인물, 장소의 상징적 의미
3. 개인적 맥락: 사용자의 현재 상황과의 연결
4. 무의식적 메시지: 꿈이 전달하려는 핵심 메시지

## 상징 사전
- 물: 감정, 무의식
- 집: 자아, 마음의 상태
- 비행: 자유, 해방에 대한 욕구
- 추락: 통제력 상실에 대한 두려움
...
(최소 1024 토큰 이상이어야 함)
"""

# 1단계: 캐시 생성 (앱 시작 시 또는 서버 초기화 시)
cache = client.caches.create(
    model="gemini-2.5-flash",
    config={
        "system_instruction": DREAM_SYSTEM_PROMPT,
        "ttl": "3600s"  # 1시간
    }
)

print(f"캐시 생성됨: {cache.name}")
# 출력: cachedContents/abc123xyz

# 2단계: 캐시를 사용해 응답 생성
def interpret_dream(user_dream: str, cache_name: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_dream,
        config={"cached_content": cache_name}
    )
    return response.text

# 사용
result = interpret_dream(
    "어젯밤 하늘을 나는 꿈을 꿨어요...",
    cache.name
)
print(result)
```

### JavaScript/TypeScript 구현

```typescript
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

const DREAM_SYSTEM_PROMPT = `...`; // 위와 동일

async function initializeCache(): Promise<string> {
  const cache = await ai.caches.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: DREAM_SYSTEM_PROMPT,
      ttl: "3600s"
    }
  });
  
  console.log("Cache created:", cache.name);
  return cache.name;
}

async function interpretDream(
  userDream: string, 
  cacheName: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userDream,
    config: { cachedContent: cacheName }
  });
  
  return response.text;
}

// 앱 시작 시
const cacheName = await initializeCache();

// 각 요청마다
const result = await interpretDream("꿈 내용...", cacheName);
```

---

## 캐시 관리

### 캐시 목록 조회

```python
# 모든 캐시 조회
pager = client.caches.list(config={"page_size": 10})
for cache in pager.page:
    print(f"캐시: {cache.name}")
    print(f"모델: {cache.model}")
    print(f"만료: {cache.expire_time}")
    print(f"토큰: {cache.usage_metadata}")
```

### 캐시 TTL 업데이트

```python
# 만료 시간 연장 (2시간으로)
updated_cache = client.caches.update(
    name=cache.name,
    config={"ttl": "7200s"}  # 2시간
)
print(f"새 만료 시간: {updated_cache.expire_time}")
```

### 캐시 삭제

```python
# 더 이상 필요 없는 캐시 삭제
client.caches.delete(name=cache.name)
```

---

## 드림앱 아키텍처 패턴

### 패턴 1: 서버 시작 시 캐시 생성

```python
# app.py
from flask import Flask, request, jsonify
from google import genai

app = Flask(__name__)
client = genai.Client(api_key="YOUR_API_KEY")

# 글로벌 캐시 (서버 시작 시 생성)
DREAM_CACHE = None

def init_cache():
    global DREAM_CACHE
    DREAM_CACHE = client.caches.create(
        model="gemini-2.5-flash",
        config={
            "system_instruction": DREAM_SYSTEM_PROMPT,
            "ttl": "3600s"
        }
    )
    print(f"Dream cache initialized: {DREAM_CACHE.name}")

@app.route("/interpret", methods=["POST"])
def interpret():
    dream = request.json.get("dream")
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=dream,
        config={"cached_content": DREAM_CACHE.name}
    )
    
    return jsonify({"interpretation": response.text})

@app.before_first_request
def startup():
    init_cache()

if __name__ == "__main__":
    app.run()
```

### 패턴 2: 캐시 자동 갱신

```python
import time
import threading

class CacheManager:
    def __init__(self, client, system_prompt: str, ttl_seconds: int = 3600):
        self.client = client
        self.system_prompt = system_prompt
        self.ttl_seconds = ttl_seconds
        self.cache = None
        self.last_refresh = 0
        
    def get_cache_name(self) -> str:
        """캐시 이름 반환, 필요시 갱신"""
        now = time.time()
        
        # TTL의 80% 지나면 갱신 (여유 두기)
        if self.cache is None or (now - self.last_refresh) > (self.ttl_seconds * 0.8):
            self._refresh_cache()
            
        return self.cache.name
    
    def _refresh_cache(self):
        """새 캐시 생성"""
        # 이전 캐시 삭제
        if self.cache:
            try:
                self.client.caches.delete(name=self.cache.name)
            except:
                pass
        
        # 새 캐시 생성
        self.cache = self.client.caches.create(
            model="gemini-2.5-flash",
            config={
                "system_instruction": self.system_prompt,
                "ttl": f"{self.ttl_seconds}s"
            }
        )
        self.last_refresh = time.time()
        print(f"Cache refreshed: {self.cache.name}")

# 사용
cache_manager = CacheManager(client, DREAM_SYSTEM_PROMPT)

def interpret_dream(user_dream: str) -> str:
    cache_name = cache_manager.get_cache_name()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_dream,
        config={"cached_content": cache_name}
    )
    return response.text
```

---

## 비용 구조

Gemini 명시적 캐싱 비용:
- **캐시 토큰 저장**: TTL 동안 저장 비용 발생
- **캐시 사용 시**: 할인된 입력 토큰 가격

> 정확한 가격은 [Gemini API 가격 페이지](https://ai.google.dev/pricing) 참조

### 비용 효율 계산

```python
def should_use_caching(
    prompt_tokens: int,
    expected_requests: int,
    ttl_hours: float = 1.0
) -> dict:
    """캐싱 사용 여부 결정 도우미"""
    
    # 예상 비용 (실제 가격은 공식 문서 참조)
    # 캐싱 시: 저장 비용 + (요청 수 × 할인된 입력 비용)
    # 캐싱 안할 시: 요청 수 × 일반 입력 비용
    
    if prompt_tokens < 1024:
        return {
            "recommend": False,
            "reason": "최소 토큰(1024) 미달"
        }
    
    if expected_requests < 5:
        return {
            "recommend": False,
            "reason": "요청 수가 적어 캐싱 효과 미미"
        }
    
    return {
        "recommend": True,
        "reason": f"{expected_requests}회 요청 시 캐싱으로 비용 절감 예상"
    }
```

---

## Claude vs Gemini 캐싱 비교

| 특성 | Claude | Gemini |
|------|--------|--------|
| 캐싱 방식 | 요청 내 `cache_control` | 별도 캐시 객체 생성 |
| 기본 TTL | 5분 | 1시간 |
| 최대 TTL | 1시간 | 제한 없음 |
| 캐시 관리 | 자동 | 수동 (생성/삭제) |
| 멀티 브레이크포인트 | 최대 4개 | 1개 (캐시 단위) |
| 암시적 캐싱 | 없음 | 2.5 모델에서 자동 |

---

## 주의사항

1. **TTL 만료**: 캐시가 만료되면 `cached_content` 참조 시 에러 발생
   - 에러 핸들링으로 캐시 재생성 로직 필요

2. **캐시 내용 수정 불가**: 생성 후 내용 변경 불가, 새로 생성해야 함

3. **비용**: 캐시 저장 자체에 비용 발생
   - 요청이 적으면 오히려 손해일 수 있음

4. **지역**: 캐시는 생성된 리전에서만 사용 가능

---

## 에러 핸들링

```python
from google.api_core.exceptions import NotFound

def safe_interpret_dream(user_dream: str) -> str:
    global DREAM_CACHE
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_dream,
            config={"cached_content": DREAM_CACHE.name}
        )
        return response.text
        
    except NotFound:
        # 캐시 만료 시 재생성
        print("Cache expired, recreating...")
        DREAM_CACHE = client.caches.create(
            model="gemini-2.5-flash",
            config={
                "system_instruction": DREAM_SYSTEM_PROMPT,
                "ttl": "3600s"
            }
        )
        
        # 재시도
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_dream,
            config={"cached_content": DREAM_CACHE.name}
        )
        return response.text
```

---

## 체크리스트

- [ ] 시스템 프롬프트가 최소 1,024 토큰 이상인지 확인
- [ ] 서버 시작 시 캐시 초기화 로직 구현
- [ ] TTL 만료 대비 에러 핸들링 추가
- [ ] 캐시 갱신 로직 구현 (TTL 80% 시점 등)
- [ ] 사용하지 않는 캐시 정리 로직 추가
- [ ] 비용 모니터링 설정
