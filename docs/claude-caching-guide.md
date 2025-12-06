# Claude API 프롬프트 캐싱 가이드 - 드림 해석 앱

## 핵심 개념

Claude의 프롬프트 캐싱은 `cache_control` 파라미터로 특정 지점까지의 프롬프트를 캐시해두고, 후속 요청에서 재사용하는 방식이다. 캐시된 토큰은 기본 입력 가격의 **10%**만 청구되므로 비용 절감 효과가 크다.

---

## 가격 구조 (Claude Sonnet 4.5 기준)

| 항목 | 가격 (MTok당) |
|------|---------------|
| 기본 입력 토큰 | $3 |
| 5분 캐시 쓰기 | $3.75 (1.25배) |
| 1시간 캐시 쓰기 | $6 (2배) |
| **캐시 히트** | **$0.30 (0.1배)** |
| 출력 토큰 | $15 |

**예시**: 10,000 토큰 시스템 프롬프트를 100번 요청할 경우
- 캐시 없이: 10,000 × 100 × $3/MTok = $3
- 캐시 사용: (10,000 × $3.75) + (10,000 × 99 × $0.30) / MTok = $0.33
- **절감률: 약 89%**

---

## 최소 토큰 요구사항

| 모델 | 최소 캐시 가능 토큰 |
|------|---------------------|
| Claude Sonnet 4.5 / 4 | 1,024 |
| Claude Opus 4.5 | 4,096 |
| Claude Haiku 4.5 | 4,096 |
| Claude Haiku 3.5 | 2,048 |

> ⚠️ 최소 토큰 미만이면 캐시가 무시되고 일반 요청으로 처리됨

---

## 드림앱 적용 전략

### 1. 캐시 구조 설계

```
[캐시 영역 - 변하지 않음]
├── 시스템 프롬프트 (꿈 해석 가이드라인)
├── 상징 데이터베이스 (선택적)
└── 예시 해석들

[비캐시 영역 - 매번 변함]
└── 사용자의 꿈 내용
```

### 2. 기본 구현 (Python)

```python
import anthropic

client = anthropic.Anthropic()

# 시스템 프롬프트 - 모든 요청에서 동일
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
- 이빨 빠짐: 자존감, 외모에 대한 불안
- 시험: 준비되지 않음에 대한 불안
- 뱀: 변화, 치유, 때로는 위협
- 바다: 깊은 무의식, 감정의 깊이
[... 더 많은 상징들 ...]

## 응답 형식
친근하고 따뜻한 톤으로 해석해주세요. 너무 부정적이거나 무서운 해석은 피하고,
성장과 자기 이해의 관점에서 의미를 찾아주세요.
"""

def interpret_dream(user_dream: str) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system=[
            {
                "type": "text",
                "text": DREAM_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}  # ← 캐시 브레이크포인트
            }
        ],
        messages=[
            {
                "role": "user",
                "content": user_dream
            }
        ]
    )
    
    # 캐시 사용량 확인
    usage = response.usage
    print(f"캐시 생성: {usage.cache_creation_input_tokens} 토큰")
    print(f"캐시 히트: {usage.cache_read_input_tokens} 토큰")
    print(f"일반 입력: {usage.input_tokens} 토큰")
    
    return response.content[0].text
```

### 3. 첫 번째 요청 vs 후속 요청

**첫 번째 요청 (캐시 생성)**
```json
{
  "cache_creation_input_tokens": 1500,
  "cache_read_input_tokens": 0,
  "input_tokens": 50,
  "output_tokens": 500
}
```

**후속 요청 (캐시 히트)**
```json
{
  "cache_creation_input_tokens": 0,
  "cache_read_input_tokens": 1500,
  "input_tokens": 45,
  "output_tokens": 480
}
```

---

## 고급 패턴: 멀티턴 대화 캐싱

사용자가 후속 질문을 하는 경우, 대화 히스토리도 캐시할 수 있다.

```python
def continue_dream_conversation(conversation_history: list, new_message: str) -> str:
    # 마지막 메시지에 cache_control 추가
    messages = conversation_history.copy()
    
    # 이전 대화의 마지막 어시스턴트 응답에 캐시 설정
    for i in range(len(messages) - 1, -1, -1):
        if messages[i]["role"] == "assistant":
            if isinstance(messages[i]["content"], str):
                messages[i]["content"] = [
                    {
                        "type": "text",
                        "text": messages[i]["content"],
                        "cache_control": {"type": "ephemeral"}
                    }
                ]
            break
    
    # 새 메시지 추가
    messages.append({
        "role": "user",
        "content": new_message
    })
    
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system=[
            {
                "type": "text",
                "text": DREAM_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}
            }
        ],
        messages=messages
    )
    
    return response.content[0].text
```

---

## 1시간 캐시 TTL 사용하기

기본 캐시는 5분 후 만료된다. 사용자가 드문드문 요청하는 앱이라면 1시간 TTL이 유리하다.

```python
system=[
    {
        "type": "text",
        "text": DREAM_SYSTEM_PROMPT,
        "cache_control": {
            "type": "ephemeral",
            "ttl": "1h"  # 1시간 캐시
        }
    }
]
```

**5분 vs 1시간 선택 기준**:
- 5분 이내 재요청이 빈번: 5분 캐시 (기본)
- 5분~1시간 사이 재요청: 1시간 캐시
- 1시간 이상 간격: 캐시 효과 없음

---

## 캐시 무효화 주의사항

다음 변경 시 캐시가 무효화된다:

1. **시스템 프롬프트 수정** - 한 글자만 바뀌어도 새 캐시 생성
2. **도구(Tools) 정의 변경**
3. **이미지 추가/제거**
4. **tool_choice 변경**

> 💡 시스템 프롬프트는 버전 관리하고, 프로덕션에서는 변경을 최소화할 것

---

## TypeScript/JavaScript 구현

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const DREAM_SYSTEM_PROMPT = `...`; // 위와 동일

async function interpretDream(userDream: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: DREAM_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      }
    ],
    messages: [
      {
        role: "user",
        content: userDream
      }
    ]
  });

  console.log('Cache stats:', {
    created: response.usage.cache_creation_input_tokens,
    read: response.usage.cache_read_input_tokens,
    input: response.usage.input_tokens
  });

  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
}
```

---

## 비용 모니터링 코드

```python
def calculate_cost(usage, model="claude-sonnet-4-5"):
    """요청별 비용 계산"""
    
    # Claude Sonnet 4.5 가격 (MTok 당)
    PRICES = {
        "input": 3.0,
        "cache_write": 3.75,
        "cache_read": 0.30,
        "output": 15.0
    }
    
    cost = (
        (usage.input_tokens * PRICES["input"] / 1_000_000) +
        (usage.cache_creation_input_tokens * PRICES["cache_write"] / 1_000_000) +
        (usage.cache_read_input_tokens * PRICES["cache_read"] / 1_000_000) +
        (usage.output_tokens * PRICES["output"] / 1_000_000)
    )
    
    # 캐시 없었을 경우 비용
    no_cache_cost = (
        ((usage.input_tokens + usage.cache_creation_input_tokens + 
          usage.cache_read_input_tokens) * PRICES["input"] / 1_000_000) +
        (usage.output_tokens * PRICES["output"] / 1_000_000)
    )
    
    savings = no_cache_cost - cost
    savings_percent = (savings / no_cache_cost * 100) if no_cache_cost > 0 else 0
    
    return {
        "actual_cost": round(cost, 6),
        "without_cache": round(no_cache_cost, 6),
        "savings": round(savings, 6),
        "savings_percent": round(savings_percent, 1)
    }
```

---

## 체크리스트

- [ ] 시스템 프롬프트가 최소 토큰 이상인지 확인 (Sonnet: 1,024+)
- [ ] `cache_control` 을 static 콘텐츠 끝에 배치
- [ ] usage 응답으로 캐시 히트 확인
- [ ] 프로덕션에서 시스템 프롬프트 변경 최소화
- [ ] 5분 TTL vs 1시간 TTL 사용 패턴에 맞게 선택
