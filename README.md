# 🎵 BEAT - Semantic Raw Format (SRF) Standard

<br />

## Overview

BEAT is a unified protocol where writing and reading events coexist on the same timeline, with consistent interpretation across diverse domains and platforms (Edge, xPU, Embedded, WebAssembly, etc.).

Traditional data formats separate `Events → Writes → Reads` sequentially, introducing latency. In BEAT, `Events ~ Writes ~ Reads` flow as one. This is achieved through its Semantic Raw Format (SRF) structure, where a zero-allocation scan eliminates the need for separate parsing or transformation. Additionally, it expresses human decision flow (5W1H) as a semantic stream, so humans and AI can read it together like natural language. This goes beyond simple performance optimization. It enables feedback loops where AI can interpret its own events immediately upon recording and refine decisions in real time. These characteristics align well with Physical AI, Agentic AI, and World Models. They can also contribute to exploratory research into AGI and quantum computing.

The result is as follows.

```
Traditional Parsing: Bytes → Tokenization → Parsing → Tree Construction (Memory) → Field Mapping (CPU) → Value Extraction → Handling
⛔ 7 Steps, μs to ms-level overhead (varies by payload)

BEAT: Bytes ~ zero-allocation scan (Topological Coordinates) → Handling
✅ 2 Steps, ns to μs-level overhead

# No Tokenization
# No Parsing
# No Tree & Object Allocation
```

**1. Zero-Allocation Stability (Space)**: 0 allocations per event. No parsing trees, no intermediate objects, no GC pressure. Events can be handled as they arrive, with no buffering required. Latency remains constant under load and stable across environments.

**2. Maximizing Engine Potential (Time)**: 0 allocation scan over contiguous memory. No tokenization, no parsing overhead. The CPU walks each byte in sequence, achieving high cache locality. This reaches memory-bound throughput, a territory unreachable by conventional formats or regex-based parsing. It only becomes possible when zero-allocation scanning is assumed from the start.

**3. Predictability & Security (Depth)**: O(n) worst-case guaranteed with deterministic latency. No recursion, no backtracking. Execution never stalls regardless of input. This makes complexity attacks like ReDoS structurally impossible.

<br />

## Example

The example below is not meant to claim BEAT's superiority over other formats, but to illustrate its structural characteristics. It reaches compression near the semantic limit while preserving the causal story (Semantic) and event visibility that can be harder to follow in traditional formats. BEAT is designed to coexist with and respect the value of standard formats like JSON.

Do not interpret this comparison as mere data compression. BEAT is not merely a faster format. It folds the semantic stream into tensor-like multi-index notation, replacing compute-bound parsing with direct zero-allocation scanning. The essence of BEAT is defined in the Specification, especially in the Topological Coordinates section.

### JSON - Traditional Format

**777 Bytes (Minified)**

`{"device":"mobile","referrer":"direct","scroll":56,"click":15,"duration":1205.2,"events":[{"tab":1,"context":"home"},{"tab":1,"time":23.7,"action":"nav-2"},{"tab":1,"time":190.8,"action":"nav-3"},{"tab":1,"time":37.5,"action":"help","flow":[12.3]},{"tab":1,"time":112.8,"action":"more-1"},{"tab":1,"time":4.3,"context":"prod"},{"tab":1,"time":103.4,"action":"button-12"},{"tab":1,"time":105,"action":"p1","to":2},{"tab":2,"context":"p1"},{"tab":2,"time":240.3,"action":"img-1"},{"tab":2,"time":119.4,"action":"buy-1"},{"tab":2,"time":1.3,"action":"buy-1-up","flow":[0.8,0.8]},{"tab":2,"time":53.2,"action":"review"},{"tab":2,"time":1.4,"context":"review"},{"tab":2,"time":192.3,"action":"nav-1","to":1},{"tab":1,"time":5.4,"action":"mycart","to":3},{"tab":3,"context":"cart"}]}`

### BEAT - Semantic Raw Format

**275 Bytes**

`_device:mobile_referrer:direct_scroll:56_click:15_duration:1205.2_beat:!home~23.7*nav-2~190.8*nav-3~37.5/12.3*help~112.8*more-1~4.3!prod~103.4*button-12~105.0*p1@---2!p1~240.3*img-1~119.4*buy-1~1.3/0.8/0.8*buy-1-up~53.2*review~1.4!review~192.3*nav-1@---1~5.4*mycart@---3!cart`

### ⚡ Zero-Allocation Impact: O(N) vs O(1) Scaling

The true power of BEAT is not just speed, but its constant-time extraction capability. As the payload grows, JSON's processing time increases linearly, while BEAT remains perfectly flat.

| Extractor Engine | Small Payload (1x) | Large Payload (5x) | Complexity |
| :--- | :--- | :--- | :--- |
| `JSON.parse` | ~5,703 ns | ~25,540 ns | ⚠️ O(N) (Linear Growth) |
| `BEAT Reader` | ~190 ns | ~190 ns | 🚀 O(1) (Constant Time) |
| **결과 설명** | **29.9x Faster** | **134.4x Faster** | **특징 설명** |

*[View Full Benchmark Report ↗](./BENCHMARK.md)*

### ⚠️ TL;DR: BEAT is NOT just a fast format

다음 비교는 공개 벤치마크 정보와 일반 실행 환경을 기준으로 1만 건 처리 비용만 단순히 스케일링한 추정입니다. BEAT Reader 구현체는 불리한 조건을 포함한 비교임을 우선 명확히 전달합니다.

| 시스템 | 일반 실행 환경 | 1만 건 총 지연 추정 | 네트워크 | 무엇까지 포함 |
|---|---|---:|---:|---|
| **BEAT Reader** | **구조적으로 same-runtime** | **약 0.4 ms** | **0 ms** | **6만 record stream 중 wildcard pattern으로 관련 1만 건 필터링, value range 추출, callback 실행부 진입, handler dispatch 가능** |
| **BEAT Reader for JSON** | **구조적으로 same-runtime** | **약 0.5 ms** | **0 ms** | **JSON 입력을 tree 없이 BEAT 좌표 stream처럼 읽고, 관련 1만 건 필터링, value range 추출, callback 실행부 진입, handler dispatch 가능** |
| simdjson C++ | native boundary 또는 별도 service | 약 10에서 100 ms 이상 | 있음 | payload 전달, parse, 결과 반환, app 실행부 전달 |
| yyjson C | native boundary 또는 별도 service | 약 10에서 120 ms 이상 | 있음 | payload 전달, parse, 결과 반환, app 실행부 전달 |
| RapidJSON C++ | native boundary 또는 별도 service | 약 20에서 160 ms 이상 | 있음 | payload 전달, DOM/SAX parse, 결과 반환 |
| Boost.JSON | native boundary 또는 별도 service | 약 20에서 180 ms 이상 | 있음 | payload 전달, parse, 결과 반환 |
| Node.js JSON.parse | Node app 내부 | 약 5에서 50 ms | 0 ms | V8 parse, JS object tree 생성, 실행부 전달 |
| Go encoding/json | Go app 내부 | 약 20에서 100 ms | 0 ms | decode, Go object 생성, 실행부 전달 |
| Python orjson | Python app 내부, Rust extension | 약 20에서 120 ms | 0 ms | decode, Python object 생성, 실행부 전달 |
| Python json | Python app 내부 | 약 80에서 400 ms | 0 ms | decode, Python object 생성, 실행부 전달 |
| SQLite | same-process DB | 약 10에서 80 ms | 0 ms | SQL 실행, row materialization, row access |
| DuckDB | same-process OLAP DB | 약 10에서 100 ms | 0 ms | vectorized query, result materialization |
| Redis pipeline | remote memory store | 약 5에서 80 ms | 있음 | RTT, command batch, response transfer, client decode |
| PostgreSQL | remote DB | 약 30에서 200 ms 이상 | 있음 | query, result set 구성, 전송, driver decode |
| MySQL | remote DB | 약 30에서 200 ms 이상 | 있음 | query, result set 구성, 전송, driver decode |
| MongoDB | remote document DB | 약 40에서 300 ms 이상 | 있음 | find, BSON batch, getMore 가능성, 전송, driver decode |
| Elasticsearch | remote search engine | 약 80에서 500 ms 이상 | 있음 | query, filtering/scoring, JSON response, 전송, decode |
| BigQuery | remote analytics service | 수백 ms에서 수 초 | 있음 | planning, distributed execution, result return |

BEAT Reader의 0.4 ms는 JavaScript 구현체 기준이며, 단순 1만 건 조회가 아니라 6만 record stream에서 wildcard pattern으로 관련 1만 건을 필터링하고, value range를 추출하고, callback 실행부에 진입하며, handler dispatch까지 포함한다. lower-level C 구현체에서는 더 빠른 결과를 기대할 수 있다.

BEAT Reader for JSON 구현체는 일반적인 JSON을 BEAT Notation을 사용하는 `_key:value` 형식으로 전처리하여, 메모리 증폭을 발생시키는 `JSON.parse` 과정 없이 BEAT.read로 흘려보냅니다. 즉, BEAT뿐만 아니라 JSON에서도 zero-allocation 스캔과 Topological Coordinates의 가치를 경험할 수 있습니다.

See the [Topological Coordinates](#topological-coordinates) section for the core structure behind this result.

<br />

## Specification

### BEAT Notation

**BEAT (Basis Event Alignment Transcript)** is a multi-dimensional data format, including the space where events occur, the time when events occur, and the depth of each event, expressed as linear sequences with Topological Coordinates. BEAT sequences express meaning without parsing (Semantic), preserve information in their original state (Raw), and maintain a fully organized structure (Format). Therefore, BEAT is the Semantic Raw Format (SRF) standard.

BEAT expresses a 5W1H semantic stream using customizable token assignments within Printable ASCII (0x20 to 0x7E). BEAT is domain-agnostic and can be applied to Finance, Game, Healthcare, IoT, Logistics, and other environments. Each domain may freely adjust token assignments while maintaining this semantic stream. Other language, platform, or architecture implementations can be placed or linked under `/implementation` in the repository root.

**`!` = Contextual Space (who)**

**`~` = Time (when)**

**`^` = Position (where)**

**`*` = Action (what)**

**`/` = Flow (how)**

**`:` = Causal Value (why)**

BEAT achieves binary-level (zero-allocation scan) performance while preserving the human readability of a text sequence. BEAT defines six core tokens within an eight-state (3-bit) semantic layout. Aligned with 5W1H, they fully capture the intent of human-designed architectures while leaving two states for domain-specific extensions. Together, they form the core notation of the BEAT format.

The underscore `_` is one example of an extension token used for serialization and to express meta fields, such as `_device:mobile_referrer:search_beat:!page~10*button:small~15*menu`. These meta fields flow with BEAT expressions without altering the core notation while preserving zero-allocation scan performance.

In implementations such as Web Advaiser, the at sign `@` is used as an extension token. It links multiple BEAT sequences, including cross-tab transitions. Extension tokens can be used in a similar way for app instances, device clusters, or any other parallel sequences in other domains.

Hyphens `-` and spaces ` ` are generally not treated as extension states and can be used freely as flexible bind markers.

### BEAT Layout

The eight-state semantic layout defines a structural constraint of the BEAT specification. To maximize expressive power, BEAT is designed so that all 2^3 states can be used. As a result, the semantic stream can be scanned efficiently across both classical and quantum computing environments.

The 3-bit (2^3) state layout is simply a design chosen in light of various trade-offs, and implementations such as Web Advaiser can choose a Power Mode (POW) that uses only a 2-bit subset of the eight states, gaining simpler immediate batching at the cost of accepting fragmented streams. Conversely, expanding BEAT's states to 4 bits increases expressive power, but also carries the possibility that constraints become looser, the format becomes unwieldy, and it becomes harder to maintain semantic discipline. Accordingly, BEAT will continue to evolve through ongoing research and refinement aimed at reducing these trade-offs, even when the number of states is reduced or increased.

BEAT's semantic stream remains substantially similar regardless of token assignment or how data is stored or transmitted, provided implementations follow BEAT's eight-state semantic layout. See the Compatibility criteria in the License section.

The examples below show one possible style. Constant definitions and code conventions may vary.

**Edge platform example**
```javascript
const S = '!';	// Contextual Space (who)
const T = '~';	// Time (when)
const P = '^';	// Position (where)
const A = '*';	// Action (what)
const F = '/';	// Flow (how)
const V = ':';	// Causal Value (why)
const M = '_';	// Domain-specific extension
const D = ' ';	// Domain-specific extension
```

**xPU platform example**
```python
s = srf == 33			# '!' Contextual Space (who)
t = srf == 126			# '~' Time (when)
p = srf == 94			# '^' Position (where)
a = srf == 42			# '*' Action (what)
f = srf == 47			# '/' Flow (how)
v = srf == 58			# ':' Causal Value (why)
m = srf == 95			# '_' Domain-specific extension
d = srf == 32			# ' ' Domain-specific extension
```

**Embedded platform example**
```c
#define SRF_S '!'				// Contextual Space (who)
#define SRF_T '~'				// Time (when)
#define SRF_P '^'				// Position (where)
#define SRF_A '*'				// Action (what)
#define SRF_F '/'				// Flow (how)
#define SRF_V ':'				// Causal Value (why)
#define SRF_M '_'				// Domain-specific extension
#define SRF_D ' '				// Domain-specific extension
```

**WebAssembly platform example**
```wat
(i32.eq (local.get $srf) (i32.const 33))	;; '!' Contextual Space (who)
(i32.eq (local.get $srf) (i32.const 126))	;; '~' Time (when)
(i32.eq (local.get $srf) (i32.const 94))	;; '^' Position (where)
(i32.eq (local.get $srf) (i32.const 42))	;; '*' Action (what)
(i32.eq (local.get $srf) (i32.const 47))	;; '/' Flow (how)
(i32.eq (local.get $srf) (i32.const 58))	;; ':' Causal Value (why)
(i32.eq (local.get $srf) (i32.const 95))	;; '_' Domain-specific extension
(i32.eq (local.get $srf) (i32.const 32))	;; ' ' Domain-specific extension
```

**Quantum platform example**
```
|000> = 33   ;; '!' Contextual Space (who)
|001> = 126  ;; '~' Time (when)
|010> = 94   ;; '^' Position (where)
|011> = 42   ;; '*' Action (what)
|100> = 47   ;; '/' Flow (how)
|101> = 58   ;; ':' Causal Value (why)
|110> = 95   ;; '_' Domain-specific extension
|111> = 32   ;; ' ' Domain-specific extension

// For tensor-like multi-index notation, see the Topological Coordinates section
```

This example illustrates how a BEAT sequence such as `!military~10^3000*training~10/15/10/20/10/15*study~200*medical-licensing-exam:pass~100!hospital~10*consultation` can flow across layers without translation and be handled with a zero-allocation scan. For practical examples of how BEAT can be used in real architectures, see the README and reference implementations under `/implementation`.

As the Semantic Raw Format (SRF) standard, BEAT removes most of the traditional parsing pipeline. Handling only needs address arithmetic to load and store tokens. In short, it achieves binary-level performance while preserving the human readability of a text sequence.

### BEAT Architecture

Traditional data formats, such as JSON, are like dots. They organize individual events well, but understanding what story they tell requires parsing and interpretation. That's why this approach demands heavy data pipelines and massive infrastructure.

BEAT is like a line. It captures the same events, but because the user journey flows like music, the story becomes clear right away. It dramatically reduces the need for heavy data pipelines and massive infrastructure. It can even eliminate them entirely.

```
_device:1_referrer:0_scroll:32_click:8_duration:12047_beat:!home~237*nav-2~1908*nav-3~375/123*help~1128*more-1~43!prod~1034*button-12~1050*p1@---2~54*mycart@---3
_device:1_referrer:1_scroll:24_click:7_duration:11993_beat:!p1~2403*img-1~1194*buy-1~13/8/8*buy-1-up~532*review~14!review~1923*nav-1@---1
_device:1_referrer:1_scroll:0_click:0_duration:12052_beat:!cart
```

A BEAT sequence captures a complete journey on a single line at the moment it unfolds, the way a memory naturally surfaces as one continuous flow rather than disconnected fragments. And as that continuous flow stacks line by line, whole memories come together into a larger story. Across Finance, Game, Healthcare, IoT, Logistics, and other environments, BEAT's self-contained semantic stream allows fast merging and easy compatibility with their respective formats.

BEAT expresses its semantic states using only Printable ASCII (0x20 to 0x7E) tokens that pass smoothly through compute and security layers. No separate encoding or decoding is required, and because it's small enough to live in native storage, real-time analysis runs without delay across most environments.

So BEAT is raw data, but it's also self-contained. No semantic parsing needed. This sounds grand, but it's really not. The BEAT expressive format is inspired by the most common data format in the world. The oldest data format in human history. Natural language.

And AI is the expert at understanding natural language.

```
[DATA] `_device:mobile_referrer:direct_scroll:56_click:15_duration:1205.2_beat:!home ~23.7 *nav-2 ~190.8 *nav-3 ~37.5/12.3 *help ~112.8 *more-1 ~4.3 !prod ~103.4 *button-12 ~105.0 *p1 @---2 !p1 ~240.3 *img-1 ~119.4 *buy-1 ~1.3/0.8/0.8 *buy-1-up ~53.2 *review ~1.4 !review ~192.3 *nav-1 @---1 ~5.4 *mycart @---3 !cart`
[SUMMARY] Confused behavior. Landed on homepage, hesitated in help section with repeated clicks at 37 and 12 second intervals. Moved to product page, opened details in a new tab, viewed images for about 240 seconds. Tapped buy button three times at 1.3, 0.8, and 0.8 second intervals. Returned to the first tab and opened cart shortly after, but didn't proceed to checkout.
[ISSUE] Cart reached but purchase not completed. Repeated buy actions may reflect either intentional multi-item additions or friction in option selection. Long delay before checkout suggests uncertainty.
[ACTION] Evaluate if repeated buy or cart actions represent deliberate comparison behavior or checkout friction. If friction is likely, simplify option handling and highlight key product details earlier in the flow.
```

Humans learn the meaning of their actions as they acquire language. AI, by contrast, excels at generating language but struggles to autonomously structure and interpret the full contextual fabric (5W1H) of its own actions. With BEAT, AI can record its behavior as sequences that read like natural language and analyze that flow in real time (zero-allocation scan), providing the foundation for feedback loops through which it can monitor its own errors and improve its outcomes.

Writing and reading coexist on the same timeline. Scaling computation alone may not lead to AGI. These feedback loops can serve as nerves for AI, where `Events ~ Writes ~ Reads` flow as one.

Beyond classical computing, BEAT's 3-bit semantic layout maps naturally to a 3-qubit state space. Its parsing-free semantic stream and Topological Coordinates are well-suited to quantum environments.

<br />

### Topological Coordinates

비트에서 JSON-like의 key & value 표현이 필요한 경우, 일반적으로 `_`는 meta 구간을 열고 `:`는 key와 value의 경계를 표시합니다.

In implementations such as Web Advaiser, `_device:mobile_referrer:direct_scroll:56_click:15_duration:1205.2_beat:!home~23.7`와 같이 일반적인 BEAT 형식으로 표현됩니다. duration 값이 필요한 경우, `k = s.indexOf("_du"), v = s.indexOf(":", k)`와 같이 앞부분인 `_du`만 zero-allocation 스캔하여 값을 즉시 읽을 수 있습니다. 바로 이것이 Payload와 무관하게 O(1) extraction에 가까운 성능을 유지할 수 있는 핵심입니다.

하지만 부모와 자식 간의 관계가 필요한 계층 구조는 다소 어려운 고민입니다. `/`와 같은 Notation을 활용해 단축 표기할 수 있지만, 구조가 깊어질수록 효율적이지 않습니다. 이는 대부분의 선형 포맷이 가지는 단점으로 여겨지며, JSON과 같은 Tree형 포맷이 주류로 자리잡은 이유 중 하나입니다.

JSON은 열고 닫는 기준이 뚜렷하고, 약속된 명세가 정확합니다. 다만 역설적으로 Tree형의 전제 조건인 닫힌 구조는, target field에 도달하기 위해 전체 tree context를 스캔해야 한다는 단점을 만듭니다. 그 결과 Payload가 커질수록 구조적 오버헤드는 선형적으로 증가하고, cache locality도 불리해집니다.

물론, simdjson과 같이 C++의 최적화를 극대화한 reader는 JSON 처리 속도를 크게 끌어올리지만, 구조 해석, field access, value extraction은 여전히 필요합니다. AI 시대에 데이터 규모와 메모리 비용이 함께 폭증하면서, 이 구조적 비용은 점점 더 무시할 수 없는 큰 병목이 되고 있습니다.

BEAT의 tensor-like multi-index notation은 이 문제를 우아하게 풀어냅니다. 이를 체계화한 Topological Coordinates는 BEAT를 단순히 parsing을 줄인 빠른 포맷이 아니라, 계층 구조를 선형 스트림 위에서 동적으로 다룰 수 있는 강력한 표현으로 확장합니다.

**JSON - Traditional Format**

```
{
  "schema-version": "1.0.0",
  "frame": {
    "id": 2077,
    "scenario": "urban-junction",
    "ego": {
      "localization": {
        "lane": "L2",
        "pose": {
          "x": 184.2,
          "y": 72.8,
          "yaw": -2.1
        }
      },
      "planning": {
        "intent": "yield",
        "path": "keep-lane"
      },
      "control": {
        "speed": 42,
        "brake": 0.32
      }
    }
  },
  "objects": {
    "021": {
      "name": "taxi-021",
      "type": "vehicle",
      "object-data": {
        "bbox": {
          "x": 612,
          "y": 244,
          "w": 96,
          "h": 64
        },
        "attributes": {
          "distance": 18.6,
          "confidence": 0.96,
          "intent": "cut-in"
        }
      }
    }
  },
  "events": [
    {"time": 0.1, "action": "sensor-fusion"},
    {"time": 0.1, "action": "detect-lane"},
    {"time": 0.1, "action": "detect-traffic-light"},
    {"time": 0.1, "action": "detect-vehicle"},
    {"time": 0.1, "action": "detect-vehicle"},
    {"time": 0.1, "action": "detect-vehicle"},
    {"time": 0.2, "action": "classify-vehicle"},
    {"time": 0.3, "action": "predict-cut-in"},
    {"time": 0.4, "action": "yield"},
    {"time": 0.2, "action": "brake"},
    {"time": 0.2, "action": "brake"},
    {"time": 0.3, "action": "brake"},
    {"time": 1.0, "action": "hold-position"},
    {"time": 0.8, "action": "hold-position"},
    {"time": 1.6, "action": "clear-path"},
    {"time": 0.7, "action": "resume-lane-following"},
    {"time": 0.4, "action": "accelerate"},
    {"time": 0.4, "action": "accelerate"},
    {"time": 0.5, "action": "lane-centering"}
  ]
}
```

**BEAT - Semantic Raw Format (Topological Coordinates)**

```
_1 schema-version:1.0.0

_2 frame
_2-1 id:2077
_2-2 scenario:urban-junction
_2-3 ego
_2-3-1 localization
_2-3-1-1 lane:L2
_2-3-1-2 pose
_2-3-1-2-1 x:184.2
_2-3-1-2-2 y:72.8
_2-3-1-2-3 yaw:-2.1
_2-3-2 planning
_2-3-2-1 intent:yield
_2-3-2-2 path:keep-lane
_2-3-3 control
_2-3-3-1 speed:42
_2-3-3-2 brake:0.32

_3 objects
_3-1 021
_3-1-1 name:taxi-021
_3-1-2 type:vehicle
_3-1-3 object-data
_3-1-3-1 bbox

_3-1-3-1-1 x:612			// Topological Coordinates와 zero-allocation 스캔은 612 값을 파싱 없이 즉시 확인 가능

_3-1-3-1-2 y:244
_3-1-3-1-3 w:96
_3-1-3-1-4 h:64
_3-1-3-2 attributes
_3-1-3-2-1 distance:18.6
_3-1-3-2-2 confidence:0.96
_3-1-3-2-3 intent:cut-in

_4 beat:!urban-junction~0.1*sensor-fusion~0.1*detect-lane~0.1*detect-traffic-light~0.1/0.1/0.1*detect-vehicle~0.2*classify-vehicle~0.3*predict-cut-in~0.4*yield~0.2/0.2/0.3*brake~1.0/0.8*hold-position~1.6*clear-path~0.7*resume-lane-following~0.4/0.4*accelerate~0.5*lane-centering

```

Tree 기반의 기존 포맷은 의미를 닫힌 구조에 묶어 둡니다. 그래서 위치를 알기 위해 tree context를 따라가야 합니다. Payload가 커질수록 target field에 도달하기 위해 전체 순회, 검증, 객체 할당, field access, value extraction 비용이 함께 증가하고, 이 과정에서 처리 비용과 메모리 사용량도 늘어납니다.

반면 BEAT는 Topological Coordinates와 zero-allocation scan을 통해 이 비용을 만들지 않습니다. `_1` 또는 `_3-1-2`와 같이 각 field가 좌표로 시작하기 때문에, 컴퓨터는 tree를 세우지 않고도 해당 byte 구간을 즉시 읽습니다. 즉, 1차원 선형 스트림이 Topological Coordinates를 통해 다차원 의미 공간처럼 펼쳐집니다.

물리적 순서가 논리적 위계에 묶이지 않으므로 아무런 구조적 장애물이 없습니다. `_3 objects`과 `_3-1 021` 사이에 새로운 `_999 new`가 끼어들어도, `_3` 계층 구조는 논리적으로 파괴되지 않고 성능이 유지됩니다. 또한 `_3 objects`를 식별하기 위해 필요한 핵심 byte는 전체 스트림 중 `3`, 단 1바이트에 불과합니다.

따라서 BEAT는 부모와 자식 간의 관계가 필요한 계층 구조를 동적으로 표현하면서도 O(1) extraction에 가까운 성능을 유지합니다. 이 말은 AI가 특정 기억을 떠올릴 때 allocation이 발생하지 않는다는 뜻입니다. 

하드웨어 가속 구현에서는 예시에 있는 총 32개의 좌표 `_N`이 동시에 병렬로 스캔될 수 있습니다.

```
_4 !urban-junction~0.1*s... // 좌표 숫자 지정은 의미상 우선순위 또는 그룹화된 구조 등을 표현하는 용도로 사용되며 스캔 순서는 무관

_1 1.0.0                    // 1 means schema-version

_2                          // 2 means frame
_2-1 2077                   // 2-1 means id
_2-2 urban-junction         // 2-2 means scenario
_2-3                        // 2-3 means ego
_2-3-1                      // 2-3-1 means localization
_2-3-1-1 L2                 // 2-3-1-1 means lane
_2-3-1-2                    // 2-3-1-2 means pose
_2-3-1-2-1 184.2            // 2-3-1-2-1 means x
_2-3-1-2-2 72.8             // 2-3-1-2-2 means y
_2-3-1-2-3 -2.1             // 2-3-1-2-3 means yaw
_2-3-2                      // 2-3-2 means planning
_2-3-2-1 yield              // 2-3-2-1 means intent
_2-3-2-2 keep-lane          // 2-3-2-2 means path
_2-3-3                      // 2-3-3 means control
_2-3-3-1 42                 // 2-3-3-1 means speed
_2-3-3-2 0.32               // 2-3-3-2 means brake

_5 new						// Topological Coordinates는 기존 논리 구조가 파괴되지 않으므로 원하는 위치에 필드 추가 가능

_3							// 3 means objects
_3-1                        // 3-1 means 021
_3-1-1 taxi-021             // 3-1-1 means name
_3-1-2 vehicle              // 3-1-2 means type
_3-1-3                      // 3-1-3 means object-data
_3-1-3-1                    // 3-1-3-1 means bbox
_3-1-3-1-1 612              // 3-1-3-1-1 means x
_3-1-3-1-2 244              // 3-1-3-1-2 means y
_3-1-3-1-3 96               // 3-1-3-1-3 means w
_3-1-3-1-4 64               // 3-1-3-1-4 means h
_3-1-3-2                    // 3-1-3-2 means attributes
_3-1-3-2-1 18.6             // 3-1-3-2-1 means distance
_3-1-3-2-2 0.96             // 3-1-3-2-2 means confidence
_3-1-3-2-3 cut-in           // 3-1-3-2-3 means intent
```

key & value 표현에서 key가 각 좌표 `_N`에 사전 할당된 경우, BEAT를 `_1 value ` 형식으로 compact하게 표현할 수 있습니다. `_1-key:value` 또는 `_1.key:value` 형식으로 key & value 간의 스캔 지점을 더욱 명확히 표현하거나, `_1 key value`와 같이 ` ` 순서로만 판단할 수도 있으며 이는 도메인에 따른 선택 사항입니다.

`_1-1-1-1-1`과 같은 인덱싱은 `$\alpha_{1,1,1,1,1}$`와 같은 양자 텐서와 구조적으로 평행을 이룹니다. 이는 BEAT가 tensor-like multi-index notation에 적합하다는 의미로서, 고전 데이터를 양자 텐서에 매핑할 때 별도의 인덱스 변환 비용이 발생하지 않습니다.

Topological Coordinates 체계에서는 `_1 key:value ` 구조를 기본 form으로 권장합니다. 한줄로 나열하면 다음과 같습니다. `_1 schema-version:1.0.0 _2 frame _2-1 id:2077 _2-2 scenario:urban-junction _2-3 ego`...

이 구조는 사람이 읽기 쉽고, 컴퓨터가 key & value 표현의 경계를 ` `와 `:` 순서만으로 쉽게 판단할 수 있어, 공용 BEAT reader가 다양한 언어와 환경에서 일관된 해석을 할 수 있는 중요한 기반이 됩니다.

```javascript
const BEAT = {
	META: '_', VALUE: ':', MODE: -1, CACHE: new WeakMap(), EMPTY: new Int32Array(0), // META는 위상좌표의 시작점이며 VALUE는 키와 값의 경계이다 // MODE는 발화 방식을 결정하며 -1이 ALL이고 0이 IN이며 1이 ONE을 의미한다 // 모든 모드의 핫패스는 Events ~ Writes ~ Reads가 하나로 흐르는 제로 얼로케이션 스캔이다 // CACHE에 상주하는 산물은 Int32Array 실행 이미지 단 한 장이며 클램프도 콜 맨 앞의 한 줄이 유일해 모든 사실이 한 곳에서 결정된다 // EMPTY는 산물이 없는 좌표 배열들이 공유하는 빈 이미지이며 같은 배열의 다음 콜은 빌드 없이 바로 스캔한다 // 길이가 0이어도 판독이 전부 비트 연산이라 범위 밖 undefined가 0으로 읽혀 그대로 유효하다 // 즉 비트는 빈 상태를 저장 없이 표현한다
	read(beat, coordinates, callback) { // beat는 META로 구분된 record가 이어지는 원문 스트림이다 // coordinates는 조회할 좌표가 들어 있는 배열이다 // 좌표는 top부터 bottom까지 계층으로 이어지고 각 segment는 하이픈으로 나뉘며 별이나 빈 segment가 있으면 wild다 // callback은 발화할 때마다 실행되며 beat와 좌표 경계 ms와 me와 키 경계 ks와 ke와 값 경계 vs와 ve와 좌표 index를 받고 false를 반환하면 스캔을 멈춘다
		const M = BEAT.META, V = BEAT.VALUE, mode = BEAT.MODE | 0, match = mode >= 0, one = mode > 0; // mode는 호출을 시작할 때 MODE에서 읽은 값이며 스캔 도중 MODE가 바뀌어도 이번 호출은 처음 읽은 mode로 끝까지 동작한다 // match는 매칭만 발화하는 IN과 ONE의 공통 표지이고 one은 ONE 전용 표지다
		let image;
		const over = coordinates.length > 0x7FFFFF, count = over ? 0x7FFFFF : coordinates.length, words = (count + 31) >> 5; // 콜드패스와 핫패스는 같은 count와 words를 공유한다 // count는 coordinates에서 읽을 항목 수이고 over는 coordinates 길이가 23비트로 표현할 수 있는 최대 좌표 수를 넘었는지 나타낸다 // coordinates가 비면 count는 0이고 길이가 23비트로 표현할 수 있는 최대 좌표 수를 넘으면 count는 그 최대 좌표 수로 고정되므로 빈 배열 여부는 count만으로 판정한다 // words는 ONE이 image의 낮은 index에서 쓰는 편승 bitmap의 word 수이며 count로 계산하므로 coordinates에서 count 이후의 항목을 포함하지 않고 계산 결과도 음수가 되지 않는다
		if (count === 0) { if (match) return; image = BEAT.EMPTY; } // coordinates가 비면 IN과 ONE은 발화 없이 반환하고 ALL은 공유 빈 image로 메인 루프에 합류해 모든 record를 index -1로 발화한다
		else if (!(image = BEAT.CACHE.get(coordinates))) { // CACHE에 image가 없을 때만 coordinates로 image를 빌드하고 같은 배열 객체로 다시 호출하면 그 image를 재사용한다
			let chars = 0, entries = 0; for (let i = 0; i < count; i++) { const entry = coordinates[i]; if (entry) { entries++; chars += entry.length; } } // coordinates를 한 번 순회해 chars와 entries를 확정하고 registry를 한 번만 할당한다 // chars는 글자 수이고 entries는 비어 있지 않은 좌표 수이며 두 값으로 registry의 좌표 메타 구역과 mid header 구역 크기를 계산한다 // 고정 segment마다 글자가 하나 이상 있고 segment 사이에는 하이픈이 있으므로 mid header 수는 chars와 entries 합의 절반을 넘지 않는다
			const units = entries * 2, registry = new Int32Array(units + Math.ceil((chars + entries) / 4)); // registry는 좌표 분석 결과를 저장하고 topology 구성과 image 기입까지 재사용하는 단일 배열이다 // registry의 낮은 index부터 wild 메타를 채우고 literal 메타는 units 경계에서 두 slot씩 낮은 index 방향으로 채우며 units부터는 mid header를 word당 두 unit씩 담는다 // wild와 literal 메타는 좌표마다 두 word를 쓰며 합계가 entries의 두 배를 넘지 않아 양쪽에서 채워도 충돌하지 않는다 // units는 entries의 두 배이며 좌표 메타 구역의 끝이자 mid header 구역의 시작이다 // depth와 anchor와 segment가 각각 6비트와 13비트와 10비트 범위를 넘은 좌표는 mid header 기입 전에 제외하므로 기입되는 header 값은 모두 16비트 범위에 들어간다
			let flags = over ? 8 : 0, costs = 1, slots = 0, drop = units, tops = 0, bottoms = 0, losses = 0; // costs의 초기 1은 root node 몫이다 // 포화 nibble은 다음 네 종류를 기록한다 // 포화 nibble은 image[0]을 5비트 오른쪽으로 민 뒤 하위 4비트에서 읽는다 // 값 1은 wild depth나 중복 chain에 넣을 depth가 63을 넘은 경우이고 값 2는 anchor 길이가 8191을 넘은 경우이며 값 4는 segment 길이가 1023을 넘은 경우이고 값 8은 coordinates 길이가 8388607을 넘었거나 trie와 verify와 chain과 base 배치가 23비트 주소 범위에 들어가지 못한 경우다 // 포화로 분류된 좌표는 발화하지 않는다 // losses는 발화 대상 수에 포함됐다가 포화로 분류된 좌표 수다 // tail 기입은 등록 순회가 registry 여백에 쌓은 index와 registry의 literal 포화 비트와 audit 구역의 wild 포화 표지를 읽어 포화 목록을 만든다 // 직접 terminal의 index+1은 23비트이고 중복 head의 registry 주소는 24비트 안에 들어가서 비트30 표지와 겹치지 않는다 // literal은 terminal 기입 뒤 literal 메타 word의 비트23을 점유하고 wild는 chain 기입 뒤 r0의 비트2를 점유한다 // tops와 bottoms는 top anchor와 bottom anchor를 가진 wild 수이며 빌드 중 감소하지 않는다
			for (let i = 0, entry, wild, cost; i < count; i++) {
				entry = coordinates[i]; if (!entry) continue;
				const topStar = entry.charCodeAt(0) === 42;
				let low = 0, high = entry.length; if (topStar) { low = 1; if (low >= high) continue; } // top에 별이 있으면 entry를 자르지 않고 low offset을 1로 바꿔 top의 별을 범위에서 제외한다
				const first = entry.charCodeAt(low), last = entry.charCodeAt(high - 1); wild = topStar || first === 45 || last === 45 || last === 42; if (!wild) { cost = first < 256 ? 1 : 2; for (let n = low + 1, previous = first; n < high; n++) { const c = entry.charCodeAt(n); cost += c < 256 ? 1 : 2; if (c === 45 && previous === 45) { wild = true; break; } previous = c; } } // top이나 bottom에 별이 있거나 첫 글자나 마지막 글자가 하이픈이거나 내부에 빈 segment가 있으면 wild다 // 이전 반복에서 읽은 c를 previous로 승계해 글자당 한 번만 읽는다
				if (wild) {
					const bottomStar = last === 42; if (bottomStar) { high--; if (low >= high) continue; } // bottom에 별이 있으면 high offset에서 1을 뺀다
					let depth = 1; for (let n = low; n < high; n++) if (entry.charCodeAt(n) === 45) depth++; // segment 수는 하이픈 수에 1을 더한 값이다
					let topChars = 0, topDepth = 0; if (!topStar && first !== 45) for (let j = low; ;) { while (j < high && entry.charCodeAt(j) !== 45) j++; topDepth++; if (j === high || j + 1 === high || entry.charCodeAt(j + 1) === 45) { topChars = j - low; break; } j++; } // 고정 글자 구간이 anchor다 // topChars는 top에서 이어지는 연속 고정 anchor의 글자 길이이며 내부 하이픈을 포함한다
					let bottomChars = 0, bottomDepth = 0; if (!bottomStar && last !== 45) for (let j = high - 1; ;) { while (j >= low && entry.charCodeAt(j) !== 45) j--; bottomDepth++; if (j === low - 1 || j === low || entry.charCodeAt(j - 1) === 45) { bottomChars = high - 1 - j; break; } j--; } // bottomChars는 bottom에서 이어지는 연속 고정 anchor의 글자 길이이며 거꾸로 세고 내부 하이픈을 포함한다 // anchor 글자는 units에 담지 않고 필요할 때 entry에서 직접 읽는다
					const stop = depth - bottomDepth;
					let blocks = 0, flag = 0; for (let n = topDepth, cursor = low + (topChars ? topChars + 1 : 0); n < stop; n++) { let length = 0; while (cursor + length < high && entry.charCodeAt(cursor + length) !== 45) length++; if (length) { if (length > 0x3FF) { flag |= 4; break; } blocks++; } cursor += length + 1; } // mid 고정 segment를 entry에서 바로 스캔하며 segment index n을 함께 센다 // 각 mid segment의 시작 위치는 저장하지 않고 직전까지 읽은 위치에서 target과 직전 segment index의 차만큼 이동해 구한다 // mid segment 길이가 10비트 범위를 넘으면 현재 좌표의 등록 순회를 중단해 범위를 넘는 header를 만들지 않는다 // 각 segment는 n을 10비트 밀고 length를 더한 한 unit으로 units에 담긴다
					if (!topChars && !bottomChars && !blocks && !flag) continue; // 좌표에는 고정 segment가 적어도 하나는 있어야 한다 // 고정 segment를 하나도 등록하지 못했더라도 flag가 0이 아니면 문법 오류로 건너뛰지 않는다
					if (depth > 0x3F) flag |= 1; if (topChars > 0x1FFF || bottomChars > 0x1FFF) flag |= 2; if (flag) { flags |= flag; if (topChars) { if (bottomChars) bottoms++; else tops++; registry[registry.length - ++losses] = i + 1; } continue; } // blocks는 현재 좌표에서만 계산하므로 현재 좌표가 포화로 분류돼도 되돌릴 값이 없다 // flag는 현재 좌표에서 depth와 anchor와 segment가 각각 6비트와 13비트와 10비트 범위를 넘은 종류를 기록하며 0이 아니면 flags에 합친다 // flag가 0이 아니고 topChars가 있는 좌표는 index에 1을 더해 registry의 높은 index부터 낮은 index 방향으로 쌓으며 0을 스택의 끝으로 남긴다 // topChars가 있는 포화 좌표는 bottomChars가 있으면 bottoms에 1을 더하고 없으면 tops에 1을 더하며 losses에도 1을 더한다 // topChars가 없으면 tops와 bottoms와 losses를 모두 바꾸지 않는다
					costs += (bottomChars ? bottomChars : topChars) << 1; // 대표 anchor는 글자를 읽지 않고 길이의 두 배를 costs에 더하며 이 값은 글자마다 최대 두 node가 생기는 경우까지 포함한다
					registry[slots] = (i << 9) | (depth << 3) | (topStar ? 0x1 : 0) | (bottomStar ? 0x2 : 0); registry[slots + 1] = (topChars << 19) | (bottomChars << 6) | blocks; slots += 2; // wild 메타는 처음부터 topology가 읽는 r0과 r1 두 word 형식으로 저장한다 // r0은 index와 depth와 별 flag이고 r1은 topChars와 bottomChars와 blocks다 // mid unit 시작은 앞선 r1의 blocks 누적값으로 구하고 따로 저장하지 않는다
					if (bottomChars) bottoms++; else if (topChars) tops++; // bottom anchor가 있으면 bottom anchor를 mirror 가지에 넣고 남은 top과 mid는 verify record에 담는다 // bottom anchor가 없고 top anchor가 있으면 top anchor를 정방향 가지에 넣고 남은 mid는 verify record에 담는다 // 양끝 anchor가 없으면 mid만 slide로 보낸다 // 일반적인 계층 구조에서는 fan-out이 누적되는 bottom 쪽이 엔트로피가 더 높아 bottom을 대표 anchor로 잡는다
				} else { drop -= 2; registry[drop] = i; costs += cost; } // literal로 확정된 경우에만 cost를 반영하고 wild로 판명되면 누적한 cost를 사용하지 않는다
			} if (bottoms) costs++; // bottoms가 있으면 mirror root 한 node의 비용을 costs에 더한다
			
			let body = 0, mids = 0; for (let w = 0, unit = 0; w < slots; w += 2) { const r0 = registry[w], r1 = registry[w + 1], blocks = r1 & 0x3F; let need = blocks; if (!need) continue; const entry = coordinates[r0 >>> 9], topChars = r1 >>> 19, low = r0 & 0x1 ? 1 : 0, high = entry.length - (r0 & 0x2 ? 1 : 0); let n = topChars ? 1 : 0; for (let i = low, e = low + topChars; i < e; i++) if (entry.charCodeAt(i) === 45) n++; let cursor = low + (topChars ? topChars + 1 : 0); for (; need; n++) { let length = 0; while (cursor + length < high && entry.charCodeAt(cursor + length) !== 45) length++; if (length) { const slot = units + (unit >> 1), shift = (unit & 1) << 4; registry[slot] = (registry[slot] & ~(0xFFFF << shift)) | (((n << 10) | length) << shift); unit++; need--; } cursor += length + 1; } if ((r1 >>> 6) === 0) { let u = unit - blocks; const midChars = (registry[units + (u >> 1)] >>> ((u & 1) << 4)) & 0x3FF; let size = (midChars - 1) >> 1; while (++u < unit) size += 1 + (((registry[units + (u >> 1)] >>> ((u & 1) << 4)) & 0x3FF) >> 1); body += size; mids++; } }  // mid header 기입 순회는 verify와 slide 기입부가 읽을 순서대로 mid header를 units에 이어 쓴다 // n은 top anchor의 segment 수에서 시작해 blocks개의 header를 쓰면 끝난다 // top anchor와 bottom anchor가 모두 없는 wild는 그 좌표의 mid header를 읽어 slide 본문 크기를 body에 더하고 mids에 1을 더한다 // body는 모든 slide 본문에 필요한 word 수의 합이고 mids는 slide 좌표 수다 // slide 구역 크기는 trie 구성 전에 확정한다
			if (drop < units || tops || bottoms) { // budget이 0 이하가 되어도 별도 분기가 없다 // 한 trie가 정방향 가지와 mirror 가지를 함께 담고 핫패스는 record마다 각 root에서 한 번씩 순회한다
				const wilds = slots / 2, budget = 0x7FFFFB - words - mids * 3 - body, width = 1 + tops + bottoms, chain = (costs < 0x800000 ? costs : 0x800000) * 3, link = chain + width, audit = link + width, topology = new Int32Array(audit + wilds); // budget은 words와 lane마다 쓰는 세 word와 body를 먼저 뺀 값이며 links와 extras와 extent가 늘어날수록 trie에 쓸 수 있는 범위가 줄어든다 // audit에서 포화로 판정된 좌표도 reserve가 예약한 verify 자리를 채워 다음 head 위치를 유지한다
				let extras = 0, extent = 1, links = 1, nodes = 1, span = 0; // topology는 trie node와 chain을 구성하는 빌드 전용 임시 배열이다 // trie node는 stride 3으로 이어지고 chain과 link lane은 각각 width만큼 이어지며 audit부터 wild 포화 표지 구역이 이어진다 // node의 0번 slot은 첫 child이고 1번 slot은 symbol과 형제 link이며 2번 slot은 payload다 // payload는 depth와 index+1을 담은 직접 literal과 비트30과 registry 주소를 담은 중복 head와 links를 비트 반전한 wild chain head 중 하나이며 이전 상태로 돌아가지 않는다 // payload가 바뀌면 기존 값을 registry 둘째 slot이나 link slot에 비트 반전해 저장하고 최종 image 기입에서 복원한다 // root가 node 0을 쓰므로 child index 0은 비어 있음을 나타내고 0으로 채워진 초기 topology가 빈 trie다 // extent는 reserve가 계산한 verify 구역의 누적 크기다 // extras는 chain 밖에서 tail에 따로 들어가는 literal item 수다
				const ensure = (node, c) => { let e, child; if (c >= 256) { const page = (c >> 8) + 256; if (page > span) span = page; child = 0; const head = topology[node * 3]; for (e = head; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === page) { child = e; break; } e = w & 0x7FFFFF; } if (!child) { child = nodes++; topology[child * 3 + 1] = (page << 23) | head; topology[node * 3] = child; } node = child; c &= 0xFF; } if (c > span) span = c; child = 0; const head = topology[node * 3]; for (e = head; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === c) { child = e; break; } e = w & 0x7FFFFF; } if (!child) { child = nodes++; topology[child * 3 + 1] = (c << 23) | head; topology[node * 3] = child; } return child; }; // ensure는 조회와 생성을 함께 수행해 child chain에서 symbol을 찾고 없으면 새 node를 sibling head에 붙인다 // charCodeAt 값이 256 이상인 글자는 상위 symbol과 하위 바이트 두 symbol로 나눈다
				const reserve = (w, extra, mark) => { const r1 = registry[w + 1], topChars = r1 >>> 19, bottomChars = (r1 >>> 6) & 0x1FFF, blocks = r1 & 0x3F, front = bottomChars && topChars ? 1 : 0; const head = extent; let next = extent + 1 + blocks + (front ? 1 + (topChars >> 1) : 0); for (let m = 0, unit = mark; m < blocks; m++, unit++) next += (((registry[units + (unit >> 1)] >>> ((unit & 1) << 4)) & 0x3FF) >> 1); if (next + links + 1 + extras + extra > budget + 2) return -2; extent = next; return head; }; // reserve는 내용을 쓰지 않고 크기만 계산해 자리를 예약하고 head를 확정한다 // verify 기입 순회는 reserve가 예약한 순서대로 registry의 내용을 쓴다 // reserve는 verify record를 더한 총량이 budget+2를 넘는지 먼저 보고 넘으면 extent를 바꾸지 않고 -2를 반환한다 // chain word의 비트31은 정방향 가지에서는 bottomStar를 mirror 가지에서는 topStar를 표시하고 비트30은 chain의 마지막 item을 비트29는 redirect를 표시하며 비트6부터 비트28은 payload이고 하위 6비트는 depth다 // block은 target 6비트와 첫 글자 16비트와 length 10비트다 // 글자 수는 charCodeAt unit을 기준으로 센다 // front는 mirror verify 앞에 덧붙는 top anchor 전용 block의 존재 표지다 // front가 있으면 첫 block만 target 없이 length 13비트를 쓰며 표지는 head의 비트6이다 // 첫 글자를 block에 함께 담아 첫 대조에서 다시 읽지 않고 글자 스트림은 둘째 글자부터 두 글자씩 word에 담는다
				for (let g = units - 2, entry, length, node; g >= drop; g -= 2) { entry = coordinates[registry[g]]; length = entry.length; if (nodes + length * 2 > budget - links - extras - extent) { flags |= 8; continue; } let depth = 1; node = 0; for (let i = 0; i < length; i++) { const c = entry.charCodeAt(i); node = ensure(node, c); if (c === 45) depth++; } const slot = node * 3 + 2, payload = topology[slot]; if (payload > 0) { if (depth > 0x3F) { flags |= 1; continue; } const e = payload & 0x40000000 ? payload & 0xFFFFFF : 0; if (!e) extras++; registry[g + 1] = e || ~payload; topology[slot] = 0x40000000 | ((depth & 0x3F) << 24) | (g + 1); extras++; } else topology[slot] = ((depth & 0x3F) << 24) | (registry[g] + 1); registry[g] |= 0x800000; } // literal은 글자마다 최대 두 node를 쓰므로 현재 nodes에 길이의 두 배를 더한 값이 남은 예산을 넘으면 flags의 비트8을 점유하고 등록하지 않는다 // 같은 좌표의 중복 literal은 registry chain에 연결하고 image 기입 때 같은 depth의 chain item으로 합친다 // 중복 literal의 depth가 6비트 범위를 넘으면 chain에 넣지 않고 flags의 비트1을 점유하며 처음 등장한 literal의 직접 terminal에는 이 depth 제한을 적용하지 않는다
				for (let w = 0, node, cursor = 0, mark = 0; w < slots; w += 2) { const r0 = registry[w], r1 = registry[w + 1], topChars = r1 >>> 19, bottomChars = (r1 >>> 6) & 0x1FFF; mark = cursor; cursor += r1 & 0x3F; if (bottomChars || !topChars) continue; if (nodes + topChars * 2 > budget - links - extras - extent) { flags |= 8; continue; } const blocks = r1 & 0x3F, depth = (r0 >>> 3) & 0x3F, index = r0 >>> 9, bottomStar = (r0 & 0x2) !== 0; node = 0; const entry = coordinates[index]; for (let i = 0; i < topChars; i++) node = ensure(node, entry.charCodeAt(i)); const payload = topology[node * 3 + 2]; if (blocks) { const extra = payload > 0 && !(payload & 0x40000000) ? 1 : 0; const head = reserve(w, extra, mark); if (head < 0) { flags |= 8; continue; } topology[chain + links] = (bottomStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else topology[chain + links] = (bottomStar ? 0x80000000 : 0) | (index << 6) | depth; registry[w] |= 0x4; topology[link + links] = payload ? ~payload : 0; if (payload > 0 && !(payload & 0x40000000)) extras++; topology[node * 3 + 2] = ~links; links++; } // mid가 있으면 verify record와 redirect item을 만들고 없으면 index를 payload로 하는 발화 item을 넣는다
				let mirror = 0; if (bottoms) { const band = 1; mirror = nodes++; topology[mirror * 3 + 1] = (band << 23) | topology[0]; topology[0] = mirror; if (band > span) span = band; } // band는 mirror 진입에 쓰는 제어 대역 상수 1이며 정방향 child와 겹치지 않는다
				for (let w = 0, node, cursor = 0, mark = 0; w < slots; w += 2) { const r0 = registry[w], r1 = registry[w + 1], topChars = r1 >>> 19, bottomChars = (r1 >>> 6) & 0x1FFF; mark = cursor; cursor += r1 & 0x3F; if (!bottomChars) continue; if (nodes + bottomChars * 2 > budget - links - extras - extent) { flags |= 8; continue; } const blocks = r1 & 0x3F, depth = (r0 >>> 3) & 0x3F, index = r0 >>> 9, topStar = (r0 & 0x1) !== 0; node = mirror; const entry = coordinates[index], low = entry.length - bottomChars; for (let i = bottomChars - 1; i >= 0; i--) node = ensure(node, entry.charCodeAt(low + i)); if (topChars || blocks) { const head = reserve(w, 0, mark); if (head < 0) { flags |= 8; continue; } topology[chain + links] = (topStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else { topology[chain + links] = (topStar ? 0x80000000 : 0) | (index << 6) | depth; } registry[w] |= 0x4; const payload = topology[node * 3 + 2]; topology[link + links] = payload < 0 ? ~payload : 0; topology[node * 3 + 2] = ~links; links++; } // bottom 고정 anchor는 글자를 역순으로 넣는다 // top이나 mid가 있으면 verify record를 만들고 top anchor는 front가 표지하는 첫 block에 담는다 // mirror 서브트리에 literal terminal은 없다 // payload는 0 또는 head를 반전한 음수다
				const items = links - 1 + extras, split = 2 + words + mids * 3 + body + items, trie = split + (extent > 1 ? extent : 0), limit = 0x7FFFFE - trie, bound = limit < 0 ? 0 : limit, range = bound + span + 2, pad = items && span < 63 ? 64 : span + 1; // capacity는 placement에서 slot 구역의 현재 길이이며 시작값은 정확성과 무관한 힌트다 // limit은 base와 trie를 더한 주소의 다음 slot이 23비트 범위를 넘지 않는 base의 최댓값이고 bound는 limit이 0보다 작으면 0이고 아니면 limit이다 // base가 limit보다 크면 flags의 비트8을 점유하고 node를 미배치로 남기며 방출은 base 0을 미배치 표지로 읽는다
				let capacity = span + 1 + ((nodes * 2 * (bound + 1) / (nodes * 2 + bound + 1)) | 0), heads = capacity + nodes, placement = new Int32Array(capacity + nodes + pad); 
				const grow = (usage) => { const mark = capacity; capacity = usage + ((usage * (range - usage) / range) | 0); const space = new Int32Array(capacity + nodes + pad); space.set(placement); space.copyWithin(capacity, mark, mark + nodes + pad); space.fill(0, mark, capacity); heads = capacity + nodes; placement = space; }; // grow는 필요한 폭을 한 번에 확보하되 사용량과 남은 범위에 비례해 새 폭을 계산하며 child가 있는 node와 child가 없는 terminal의 배치가 함께 쓴다 // placement는 base 검색 과정과 배치 결과를 함께 저장하는 배열이다 // 낮은 index에는 slot 상태 구역이 capacity부터는 node base 구역이 heads부터는 symbol별 chain head 구역이 놓인다 // slot word의 비트30은 그 slot의 점유를 표시하고 비트31은 base slot을 표시하며 하위 24비트는 다음 검사 위치를 담아 같은 후보를 다시 검사하지 않는다 // base 후보를 찾는 루프는 slot 구역의 끝을 따로 검사하지 않으며 capacity 이후 값의 비트30이 0이면 빈 slot으로 읽고 멈춘다 // base는 배정 뒤 해제되지 않으며 free는 아직 base로 배정되지 않은 가장 작은 slot이므로 base 후보는 free부터 검사해도 first-fit 결과가 같다 // 같은 symbol 버킷에서 직전 base가 free 이상이고 child symbol 목록이 같으며 직전 node가 terminal이 아니거나 현재 node가 terminal이면 직전 base 다음 위치를 다음 검색의 시작값으로 승계한다
				let peak = trie - 1, free = 0; for (let s = 0; s < nodes; s++) { const e = topology[s * 3]; if (!e) continue; const symbol = topology[e * 3 + 1] >>> 23; placement[capacity + s] = placement[heads + symbol]; placement[heads + symbol] = s + 1; } // 모든 trie node가 미배치여도 image 길이가 lane 구역과 두 count word를 포함하도록 peak를 trie-1로 초기화한다 // 배치 순서는 버킷 symbol이 큰 node부터다 // 버킷 link는 배치 전에 비어 있는 node base 구역을 임시로 쓰고 s에 1을 더해 저장하며 0을 빈 slot으로 읽어 별도 초기화 루프를 두지 않는다 // least는 child 중 최소 symbol이며 그 전이 slot을 기준으로 후보 base를 오름차순 검사하고 어느 child를 기준으로 삼아도 first-fit 결과는 같다
				for (let symbol = span; symbol >= 0; symbol--) for (let h = placement[heads + symbol], next, previous = -1, b = -1; h !== 0; h = next) { const s = h - 1; next = placement[capacity + s]; const child = topology[s * 3], terminal = topology[s * 3 + 2] !== 0; let least = symbol, cover = b >= free && (topology[previous * 3 + 2] === 0 || terminal), peer = cover ? topology[topology[previous * 3] * 3 + 1] & 0x7FFFFF : 0; for (let e = topology[child * 3 + 1] & 0x7FFFFF; e; ) { const w = topology[e * 3 + 1], c = w >>> 23; if (c < least) least = c; if (cover) { if (!peer) cover = false; else { const word = topology[peer * 3 + 1]; if ((word >>> 23) !== c) cover = false; else peer = word & 0x7FFFFF; } } e = w & 0x7FFFFF; } if (peer) cover = false; const step = least + 1; outer: for (let f = (cover ? b + 1 : free) + step; ; f++) { while (placement[f] & 0x40000000) { const q = placement[f] & 0xFFFFFF, hop = placement[q]; if (hop & 0x40000000) { const far = hop & 0xFFFFFF; placement[f] = (placement[f] & 0xC0000000) | far; f = far; } else f = q; } b = f - step; if (placement[b] < 0) continue; if (terminal) { const word = placement[b + 1]; if (word & 0x40000000) { f += (word & 0xFFFFFF) - b - 2; continue; } } for (let e = child; e; ) { const w = topology[e * 3 + 1], c = w >>> 23, t = b + c + 1, word = placement[t]; if (word & 0x40000000) { let far = word & 0xFFFFFF; const hop = placement[far]; if (hop & 0x40000000) { far = hop & 0xFFFFFF; placement[t] = (word & 0xC0000000) | far; } if (far > t + 1) f = far - c + least - 1; continue outer; } e = w & 0x7FFFFF; } break; } previous = s; if (b > limit) { flags |= 8; placement[capacity + s] = 0; continue; } if (b + span + 1 >= capacity) grow(b + span + 2); placement[capacity + s] = b + trie; placement[b] |= 0x80000000; if (b === free) while (placement[free] < 0) free++; if (terminal) { const slot = b + 1; placement[slot] |= 0x40000000 | (slot + 1); if (slot + trie > peak) peak = slot + trie; } for (let e = child; e; ) { const w = topology[e * 3 + 1], t = b + (w >>> 23) + 1; placement[t] |= 0x40000000 | (t + 1); if (t + trie > peak) peak = t + trie; e = w & 0x7FFFFF; } } // 같은 slot이 점유돼 기각되는 후보만 건너뛰므로 first-fit 결과가 달라지지 않고 f는 매번 최소 한 slot 증가해 루프가 끝난다
				for (let s = 0; s < nodes; s++) { if (topology[s * 3] !== 0 || topology[s * 3 + 2] === 0) continue; let f = free + 1; for (;;) { while (placement[f] & 0x40000000) { const q = placement[f] & 0xFFFFFF, hop = placement[q]; if (hop & 0x40000000) { const far = hop & 0xFFFFFF; placement[f] = (placement[f] & 0xC0000000) | far; f = far; } else f = q; } if (placement[f - 1] >= 0) break; f++; } const b = f - 1; if (b > limit) { flags |= 8; break; } if (f >= capacity) grow(f + 1); placement[capacity + s] = b + trie; placement[b] |= 0x80000000; free = b + 1; placement[f] |= 0x40000000 | (f + 1); if (f + trie > peak) peak = f + trie; } // child가 없는 terminal마다 고유한 base를 배정해 다른 node의 terminal word를 현재 node의 기록으로 오인하지 않게 한다 // child가 없는 terminal은 같은 배치 조건을 쓰고 한 번 기각된 후보는 다시 유효해지지 않으므로 first-fit base가 증가하며 free를 다음 terminal의 검색 시작값으로 쓴다 // child가 없는 terminal의 first-fit base가 limit보다 크면 뒤에 남은 terminal도 limit 이하의 base를 받을 수 없으므로 배치를 끝낸다
				if (flags) { const seek = (node, c) => { if (c >= 256) { let child = 0; for (let e = topology[node * 3]; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === (c >> 8) + 256) { child = e; break; } e = w & 0x7FFFFF; } if (!child) return 0; node = child; c &= 0xFF; } for (let e = topology[node * 3]; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === c) return e; e = w & 0x7FFFFF; } return 0; }; const check = (node, entry, start, end) => { if (!placement[capacity + node]) return 0; for (let i = start, d = start < end ? 1 : -1; i !== end; i += d) { node = seek(node, entry.charCodeAt(i)); if (!node || !placement[capacity + node]) return 0; } return 1; }; for (let g = units - 2; g >= drop; g -= 2) { const word = registry[g], i = word & 0x7FFFFF; if (!(word & 0x800000) || !check(0, coordinates[i], 0, coordinates[i].length)) { registry[g] |= 0x1000000; losses++; } } for (let w = 0; w < slots; w += 2) { const r0 = registry[w], r1 = registry[w + 1], topChars = r1 >>> 19, bottomChars = (r1 >>> 6) & 0x1FFF; if (!topChars && !bottomChars) continue; const i = r0 >>> 9, entry = coordinates[i]; if (!(r0 & 0x4) || (bottomChars ? !check(mirror, entry, entry.length - 1, entry.length - 1 - bottomChars) : !check(0, entry, 0, topChars))) { topology[audit + (w >> 1)] = 0x40000000; losses++; } } } // audit은 flags가 0이 아닐 때 모든 literal을 검사하고 wild는 topChars나 bottomChars가 있는 경우만 검사한다 // literal은 terminal 기입 여부와 전체 좌표 경로의 모든 node에 base가 배정됐는지 검사하고 wild는 chain 기입 여부와 대표 anchor 경로의 모든 node에 base가 배정됐는지 검사한다 // 기입 검사나 base 검사 중 하나라도 실패하면 그 좌표를 포화로 표시하고 losses에 1을 더한다 // audit 구역은 audit 시작 전까지 0으로 남아 별도로 초기화하지 않는다 // seek는 node를 만들지 않고 기존 child만 찾는다 // check는 start와 end의 순서로 방향을 정해 정방향 anchor와 mirror anchor를 같은 코드로 검사한다
				let tail = split - items; if (items) placement.fill(0, heads, heads + 64); image = new Int32Array(peak + 2 + (losses ? losses + 1 : 0)); // 모든 구역 크기를 확정한 뒤 image를 한 번만 할당한다 // image의 낮은 index부터 root와 편승 bitmap과 literal 수와 top anchor 수의 합을 담은 word와 lane 구역과 tail과 verify와 trie가 놓인다 // image의 마지막 word에는 bottom anchor 수를 담는다 // 전이 주소는 base에 c를 더한 값이고 c가 0 이상이라 base보다 작아지지 않으며 모든 base가 tail보다 높은 index에서 시작하므로 tail 구역을 가리킬 수 없다 // trie에 없는 글자는 전이 slot의 tag가 맞지 않아 전이가 성립하지 않으며 범위 밖 읽기는 undefined가 비트 연산에서 0이 된다
				for (let s = 0; s < nodes; s++) { const base = placement[capacity + s]; if (!base) continue; const payload = topology[s * 3 + 2]; let terminal = payload > 0 && payload < 0x40000000 ? payload : 0, repeat = payload >= 0x40000000 ? payload & 0xFFFFFF : 0, depth = repeat ? (payload >>> 24) & 0x3F : terminal >>> 24, h = payload < 0 ? ~payload : 0; if (h || repeat) { const offset = tail; let min = 63, max = 0, total = 0; for (let e = h; e; ) { const d = topology[chain + e] & 0x3F, next = topology[link + e]; placement[heads + d]++; total++; if (d < min) min = d; if (d > max) max = d; if (next < 0) { const previous = ~next; depth = (previous >>> 24) & 0x3F; if (previous & 0x40000000) repeat = previous & 0xFFFFFF; else terminal = previous; break; } e = next; } for (let r = repeat; r > 0; ) { const previous = registry[r]; placement[heads + depth]++; total++; if (previous < 0) { terminal = ~previous; break; } r = previous; } if (terminal) { placement[heads + depth]++; total++; if (depth < min) min = depth; if (depth > max) max = depth; } for (let d = min + 1; d <= max; d++) placement[heads + d] += placement[heads + d - 1]; for (let r = repeat; r > 0; r = registry[r]) image[offset + --placement[heads + depth]] = ((registry[r - 1] & 0x7FFFFF) << 6) | depth; for (; h; ) { const item = topology[chain + h], next = topology[link + h]; image[offset + --placement[heads + (item & 0x3F)]] = item & 0x20000000 ? (item & ~0x1FFFFFC0) | ((((item >>> 6) & 0x7FFFFF) + split) << 6) : item; if (next < 0) break; h = next; } if (terminal) image[offset + --placement[heads + depth]] = (((terminal & 0xFFFFFF) - 1) << 6) | depth; for (let d = min; d <= max; d++) placement[heads + d] = 0; tail += total; image[tail - 1] |= 0x40000000; image[base + 1] = (offset << 9) | 0x20; } else if (terminal) image[base + 1] = (terminal & 0xFFFFFF) << 9; for (let e = topology[s * 3]; e; ) { const w = topology[e * 3 + 1], symbol = w >>> 23, child = placement[capacity + e] + 1; if (child > 1) image[base + symbol + 1] = (child << 9) | symbol; e = w & 0x7FFFFF; } } // terminal 기록은 image[base+1] 한 주소이며 그 symbol 값이 terminal 종류를 가르는 tag다 // tag 0은 단일 literal terminal이며 payload에 index+1을 담아 바로 발화한다 // tag 0x20은 chain terminal이며 payload는 tail의 절대 offset이다 // 0x20은 좌표를 끝내는 공백의 코드값이라 원문 좌표에 없고 0과 함께 terminal 자리에서 전이와 겹치지 않는다 // chain item은 64개의 depth 버킷에 안정 분배하고 같은 depth에서는 literal 다음 wild 다음 중복 등록순을 유지한다 // chain 순회는 level이 depth를 넘으면 조기 탈출한다
				const root = placement[capacity] ? placement[capacity] + 1 : 0, proxy = !root && mirror && placement[capacity + mirror] ? placement[capacity + mirror] + 1 : 0; image[0] = ((root || proxy) << 9) | (losses ? 0x8 : 0) | (proxy ? 0x4 : 0) | (tops ? 0x1 : 0); image[1 + words] = ((((units - drop) >> 1) + tops) << 9) | 0x100; image[image.length - 1] = (bottoms << 9) | 0x100; if (losses) { image[image.length - 2] = (losses << 9) | 0x100; let k = image.length - 3; for (let r = 1, loss; r <= losses && (loss = registry[registry.length - r]); r++) image[k--] = ((loss - 1) << 9) | 0x100; for (let g = units - 2; g >= drop; g -= 2) if (registry[g] & 0x1000000) image[k--] = ((registry[g] & 0x7FFFFF) << 9) | 0x100; for (let w = 0; w < wilds; w++) if (topology[audit + w] === 0x40000000) image[k--] = ((registry[w * 2] >>> 9) << 9) | 0x100; } // image[0]의 비트2가 0이면 상위 23비트가 정방향 root이고 1이면 mirror root다 // 정방향 root를 배치하지 못하고 mirror root만 남으면 비트2를 점유하고 상위 23비트에 mirror root를 담아 bottom 가지를 보존한다 // base를 받지 못한 정방향 root와 mirror root는 0으로 남아 해당 trie 순회를 시작하지 않는다 // count word는 symbol 256 tag를 써서 전이나 terminal로 오인되지 않는다 // 포화 목록 구역은 포화 좌표 수와 좌표 index로 이뤄지고 image의 마지막 word 앞에 놓인다 // 포화 목록이 있으면 image[0]의 비트3을 점유한다
				if (extent > 1) { let fill = split + 1; for (let side = 0; side < 2; side++) for (let w = 0, cursor = 0; w < slots; w += 2) { const r0 = registry[w], r1 = registry[w + 1], bottomChars = (r1 >>> 6) & 0x1FFF, mark = cursor; cursor += r1 & 0x3F; if ((bottomChars ? !side : side) || !(r0 & 0x4) || !(bottomChars ? (r1 >>> 19) || (r1 & 0x3F) : r1 & 0x3F)) continue; const index = r0 >>> 9, topChars = r1 >>> 19, blocks = r1 & 0x3F, origin = bottomChars ? ((r0 >>> 3) & 0x3F) - 1 : -1, front = bottomChars && topChars ? 1 : 0, total = front + blocks, entry = coordinates[index]; let segment = topChars ? 1 : 0; for (let i = 1; i < topChars; i++) if (entry.charCodeAt(i) === 45) segment++; const seed = segment, start = (r0 & 0x1) + (topChars ? topChars + 1 : 0); let q = start; image[fill++] = (index << 9) | (front << 6) | total; if (front) image[fill++] = (entry.charCodeAt(0) << 13) | topChars; let unit = mark; for (let m = 0; m < blocks; m++) { const block = (registry[units + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; image[fill++] = ((origin < 0 ? target : origin - target) << 26) | (entry.charCodeAt(q) << 10) | length; q += length; } if (front) for (let i = 1; i < topChars; i += 2) image[fill++] = entry.charCodeAt(i) | (i + 1 < topChars ? entry.charCodeAt(i + 1) << 16 : 0); unit = mark; segment = seed; q = start; for (let m = 0; m < blocks; m++) { const block = (registry[units + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; for (let i = 1; i < length; i += 2) image[fill++] = entry.charCodeAt(q + i) | (i + 1 < length ? entry.charCodeAt(q + i + 1) << 16 : 0); q += length; } } } // verify 구역의 첫 word는 0으로 남기고 head는 1부터 시작해 0을 미사용 표지로 보존한다 // verify 구역은 split부터 trie 직전까지라 전이 주소와 겹치지 않는다 // redirect payload는 방출할 때 split을 더해 절대 주소로 바꾸며 그 주소는 23비트 주소 범위에 들어간다 // record는 스트림 등장순으로 발화하고 한 record 안에서는 정방향 다음 mirror 다음 slide 순으로 발화한다 // slide 발화는 등록순이다 // IN과 ONE의 발화도 이 기본 순서를 보존한다
			}
			if (!image && (flags || mids)) { image = new Int32Array(2 + words + mids * 3 + body + 1); image[1 + words] = 0x100; image[image.length - 1] = 0x100; } // literal이 없고 tops와 bottoms가 모두 0인데 lane이 있거나 flags가 0이 아니면 최소 image를 만든다 // 이 경우 두 count word는 모두 0이고 포화 목록 구역도 없다 // 최소 image도 일반 image와 같은 layout으로 두 count word 사이에 lane 구역을 둔다
			if (mids) { image[0] |= 0x10; let lane = 2 + words; for (let w = 0, m = 0, cursor = 0; w < slots && m < mids; w += 2) { const r1 = registry[w + 1], mark = cursor; cursor += r1 & 0x3F; if (r1 >>> 6) continue; const r0 = registry[w], depth = (r0 >>> 3) & 0x3F, entry = coordinates[r0 >>> 9]; let block = (registry[units + (mark >> 1)] >>> ((mark & 1) << 4)) & 0xFFFF; const midChars = block & 0x3FF, topGap = block >> 10, rest = (r1 & 0x3F) - 1, start = (r0 & 0x1) + topGap; const inner = lane + 3; let fill = inner; image[lane] = (entry.charCodeAt(start) << 16) | entry.charCodeAt(start + midChars - 1); let i = 1; for (; i + 1 < midChars - 1; i += 2) image[fill++] = entry.charCodeAt(start + i) | (entry.charCodeAt(start + i + 1) << 16); if (i < midChars - 1) image[fill++] = entry.charCodeAt(start + i); let unit = mark + 1, segment = topGap, q = start + midChars; for (let b = 0; b < rest; b++) { block = (registry[units + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF; unit++; const target = block >> 10, length = block & 0x3FF; q += target - segment; segment = target; image[fill++] = (entry.charCodeAt(q) << 16) | block; let j = 1; for (; j + 1 < length; j += 2) image[fill++] = entry.charCodeAt(q + j) | (entry.charCodeAt(q + j + 1) << 16); if (j < length) image[fill++] = entry.charCodeAt(q + j); q += length; } const size = fill - inner; image[lane + 1] = (r0 & ~0x1FF) | (rest << 3) | (m + 1 === mids ? 0x4 : 0) | (r0 & 0x3); image[lane + 2] = ((size > 0x3FF ? 0 : size) << 22) | (midChars << 12) | (topGap << 6) | depth; m++; lane = fill; } } if (flags) { image[0] |= flags << 5; } // lane 구역은 slide 좌표마다 s0과 s1과 s2 세 word와 본문을 등록순으로 잇는다 // s0은 first와 last다 // s1은 index와 rest와 마지막 lane 표지와 별 flag다 // s2는 size와 midChars와 topGap과 depth다 // rest가 있는데 size가 0이면 lane 본문 크기가 size의 10비트 범위를 넘었다는 뜻이다 // 첫 mid anchor의 첫 글자와 끝 글자는 s0에 두고 본문에는 중간 글자만 담는다 // 본문은 header 세 word 뒤에서 시작하며 첫 mid anchor의 중간 글자를 두 글자씩 word에 담는다 // 뒤따르는 각 mid segment는 첫 글자를 block word에 담고 나머지 글자를 두 글자씩 word에 담는다 // lane 기입은 mid header 기입 순회가 units에 적은 mid header를 읽어 image의 확정 자리에 쓴다 // lane 주소는 팩하지 않고 산술 index로 쓰므로 주소 자체에 별도의 비트폭 제한을 두지 않는다
			if (!image) image = BEAT.EMPTY; BEAT.CACHE.set(coordinates, image); // image를 빌드한 뒤에는 coordinates 배열의 길이와 항목을 바꾸면 안 된다 // CACHE는 빌드한 image를 재사용하지만 ONE top 전환 처리는 coordinates를 다시 읽는다
		}
		const control = image[0], gate = control & 0x1, lane = 2 + words; // lane은 words에 2를 더해 구하고 경계를 따로 저장하지 않는다
		let ms, me, ks, ke, vs, ve, find = 0, left = 0, topAlive = 0, bottomAlive = 0, midAlive = 0, topRoot = control & 0x4 ? 0 : control >>> 9; // find는 V 검색 결과를 보관하며 -1이 아니고 현재 ks보다 작을 때만 다음 V를 찾는다
		const move = topRoot ? image[topRoot + 1] | 0 : 0;
		let bottomRoot = control & 0x4 ? control >>> 9 : (move & 0x1FF) === 1 ? move >>> 9 : 0, // control의 비트2가 1이면 topRoot를 0으로 두고 상위 23비트를 bottomRoot로 읽으며 비트2가 0이면 bottomRoot를 topRoot의 band 전이에서 구한다
			 slides = control & 0x10, bitmap = null, start = -2, end = -1, work = 0; // bitmap과 start와 end와 work는 호출마다 초기화되고 ONE에서만 바뀐다 // slides는 lane 구역의 존재 표지이자 lane 루프의 진입 gate다 // fire-once bitmap은 image의 낮은 index 스크래치 구역을 사용하고 추가 상주 메모리는 편승 bitmap뿐이다
			if (one) { topAlive = image[lane - 1] >>> 9; bottomAlive = image[image.length - 1] >>> 9; if (slides) for (let w = lane; w; ) { midAlive++; const s1 = image[w + 1], s2 = image[w + 2], inner = w + 3, rest = (s1 >>> 3) & 0x3F, size = s2 >>> 22; if (s1 & 0x4) w = 0; else if (size || !rest) w = inner + size; else { let f = inner + ((((s2 >>> 12) & 0x3FF) - 1) >> 1); for (let b = 0; b < rest; b++) f += 1 + ((image[f] & 0x3FF) >> 1); w = f; } } left = topAlive + bottomAlive + midAlive; if (control & 0x8) left -= image[image.length - 2] >>> 9; if (!left) return; bitmap = image; if ((control & 0x2) === 0) { bitmap.fill(0, 1, 1 + words); image[0] = control | 0x2; } else bitmap = new Int32Array(1 + words); if (control & 0x8) for (let g = (image[image.length - 2] >>> 9) - 1; g >= 0; g--) { const i = image[image.length - 3 - g] >>> 9; bitmap[1 + (i >> 5)] |= 1 << i; } if (topAlive || bottomAlive) start = -1; } // ONE은 스캔 전에 topAlive와 bottomAlive와 midAlive를 구하고 fire-once bitmap을 준비한다 // word 하나에 좌표 32개를 담고 shift 횟수의 하위 5비트만 반영해 별도 나머지 연산을 쓰지 않는다 // left는 topAlive와 bottomAlive와 midAlive의 합에서 포화 목록의 좌표 수를 뺀 값이며 0이면 발화 가능한 좌표가 모두 처리된 상태다 // 포화 목록의 좌표는 bitmap에 미리 표시한다 // 재진입 표지는 image[0]의 비트1을 점유하고 control은 복원할 값으로 보존하며 finally 한 곳에서 해제한다 // 중첩 재진입 호출은 독립 bitmap을 사용한다
			try { let p = beat.indexOf(M); while (p !== -1) { if (p === 0 || beat.charCodeAt(p - 1) <= 32) break; p = beat.indexOf(M, p + 1); } // record 경계가 아닌 M을 건너뛰고 첫 record의 시작을 찾는다
		while (p !== -1) { // 메인 루프는 모든 record를 한 번 순회한다
			ms = p + 1; me = beat.indexOf(' ', ms); if (me === -1) break;
			p = beat.indexOf(M, me + 1); while (p !== -1 && beat.charCodeAt(p - 1) > 32) p = beat.indexOf(M, p + 1);
			ve = p === -1 ? beat.length : p - 1; // p에 다음 M 위치를 먼저 저장해 매칭 전에 값 끝을 확정하고 p는 다음 record의 시작 표지를 가리킨다 // ve가 경계 계산 전까지 record 끝을 보관하며 find가 ve보다 작으면 값이 있고 아니면 키만 있다
				if (!match) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } // ALL은 record를 읽는 즉시 경계를 계산하고 IN과 ONE은 첫 발화 시점에 한 번 계산한다 // ks는 항상 me+1이고 V가 있으면 ke가 find이고 vs와 ve가 값이며 없으면 ke가 record 끝이고 vs와 ve가 -1이다 // 발화 경로는 합치지 않고 인라인 직선 코드를 유지한다
			let hit = false, depth = 0; // record 깊이는 처음 필요할 때 한 번만 구해 모든 발화 gate가 공유한다
			if (start > -2) { e: { const length = end - start; if (start >= 0) { let k = 0; while (k < length && beat.charCodeAt(start + k) === beat.charCodeAt(ms + k)) k++; if (k === length && (ms + length === me || beat.charCodeAt(ms + length) === 45)) break e; } let split = ms; while (split < me && beat.charCodeAt(split) !== 45) split++; if (start >= 0) { if ((work + count) * 4 > beat.length - ms) { start = -2; break e; } work += count; let more = 0; const lead = beat.charCodeAt(start); for (let low = 0; low < count; low += 32) { const word = bitmap[1 + (low >> 5)]; if (word === -1) continue; const stop = low + 32 < count ? low + 32 : count; for (let i = low; i < stop; i++) { if ((word & (1 << i)) !== 0) continue; const entry = coordinates[i]; if (!entry) continue; const first = entry.charCodeAt(0); if (first === 42 || first === 45) continue; if (first !== lead) { more = 1; continue; } const chars = entry.length; if (chars < length) { more = 1; continue; } let k = 1; while (k < length && entry.charCodeAt(k) === beat.charCodeAt(start + k)) k++; if (k < length) { more = 1; continue; } const c = length < chars ? entry.charCodeAt(length) : 0; if (c !== 0 && c !== 45 && !(c === 42 && length === chars - 1)) { more = 1; continue; } bitmap[1 + (i >> 5)] |= 1 << i; const last = entry.charCodeAt(chars - 1); let bottom = 0; if (last !== 42 && last !== 45) for (let g = length + 1; g < chars; g++) if (entry.charCodeAt(g) === 45 && entry.charCodeAt(g - 1) === 45) { bottom = 1; break; } if (bottom) { if (!--bottomAlive) bottomRoot = 0; } else if (!--topAlive) topRoot = 0; if (--left === 0) return; } } if (!more) { start = -2; break e; } } start = ms; end = split; } } // ONE top 전환 처리는 top이 바뀌면 닫힌 top과 일치하는 미발화 고정 top 좌표를 bitmap에 표시한다 // bottom anchor가 있으면 bottomAlive에서 1을 빼고 없으면 topAlive에서 1을 빼며 left에서도 1을 뺀다 // record는 단일 트리 DFS 순서로 이어지므로 닫힌 서브트리는 다시 등장하지 않는다 // 현재 record의 top을 직전 record의 top과 직접 대조하고 같으면 top 전환 처리를 건너뛴다 // 좌표의 top을 닫힌 top과 대조하고 경계 글자를 검사해 정확히 같은지 판정한다 // 이미 bitmap에 표시된 좌표는 건너뛰어 topAlive나 bottomAlive와 left를 두 번 줄이지 않는다 // bitmap은 word 단위로 검사하고 모든 비트가 1인 word는 통째로 건너뛴다 // top 전환 처리를 실행할 때마다 work에 count를 더한다 // work에 다음 top 전환 처리의 count를 더한 값의 4배가 남은 글자 수를 넘으면 중단한다 // 처리 뒤 bitmap에 표시되지 않은 고정 top 좌표가 남지 않으면 이후 top 전환 처리를 중단한다 // 어느 조건으로 중단해도 매칭과 발화는 그대로이고 닫힌 top 좌표를 bitmap에 미리 표시하는 최적화만 멈춘다
			if (topRoot) { let base = topRoot, fit = true, layer = 0; for (let j = ms, c, word, page; j < me; j++) { c = beat.charCodeAt(j); if (gate && c === 45) { layer++; const status = image[base] | 0; if ((status & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = layer + 1; for (let g = j + 1; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item & 0x20000000) { if (item < 0 || depth === level) { const head = (item >>> 6) & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) v: { let cursor = head + 1 + blocks, q = j + 1, segment = layer; for (let i = 0; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment < target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment++; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 10) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } } else if (item < 0 || depth === level) { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } } if (c < 256) { word = image[base + c] | 0; if ((word & 0x1FF) !== c) { fit = false; break; } base = word >>> 9; } else { word = image[base + (page = (c >> 8) + 256)] | 0; if ((word & 0x1FF) !== page) { fit = false; break; } base = word >>> 9; word = image[base + (c & 0xFF)] | 0; if ((word & 0x1FF) !== (c & 0xFF)) { fit = false; break; } base = word >>> 9; } } if (fit) { const status = image[base] | 0, tag = status & 0x1FF; if (tag === 0x20) { let h = status >>> 9; if (!depth) { if (gate) depth = layer + 1; else { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if ((item < 0 || depth === level) && !(item & 0x20000000)) { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } else if (tag === 0 && status) { const index = (status >>> 9) - 1; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } } } // 정방향 순회는 literal과 top 고정이 함께 담긴 trie를 topRoot에서 순회한다 // literal은 terminal에서 판정하고 top 고정은 segment 경계마다 판정한다 // gate가 1이면 terminal depth를 순회 중 센 layer로 구하고 0이면 record 좌표의 하이픈을 직접 세어 구한다
			if (bottomRoot && me > ms) { let base = bottomRoot; for (let j = me - 1, c = beat.charCodeAt(j), previous = 0, word, page, status; ; j--, c = previous) { if (c < 256) { word = image[base + c] | 0; if ((word & 0x1FF) !== c) break; base = word >>> 9; } else { word = image[base + (page = (c >> 8) + 256)] | 0; if ((word & 0x1FF) !== page) break; base = word >>> 9; word = image[base + (c & 0xFF)] | 0; if ((word & 0x1FF) !== (c & 0xFF)) break; base = word >>> 9; } if ((j === ms || (previous = beat.charCodeAt(j - 1)) === 45) && ((status = image[base] | 0) & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item < 0 || depth === level) { if (item & 0x20000000) { const head = (item >>> 6) & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) v: { let cursor = head + 1 + blocks, q = ms, segment = depth - 1; if (record & 0x40) { const block = image[head + 1], length = block & 0x1FFF; if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 13) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } for (let i = (record >>> 6) & 0x1; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment > target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment--; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 10) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomRoot = 0), --left === 0)) return; } } else { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bitmap[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomRoot = 0), --left === 0)) return; } } } if (item & 0x40000000) break; h++; } while (true); } if (j === ms) break; } } // mirror 순회는 같은 trie를 bottomRoot에서 시작해 record 좌표를 끝에서부터 읽는다 // mirror verify는 q를 ms에서 시작하고 segment를 depth에서 1을 뺀 값으로 시작하며 다음 segment로 이동할 때마다 q를 하이픈 다음 위치로 옮기고 segment에서 1을 뺀다 // front가 있으면 첫 block을 전용 형식으로 먼저 대조한다 // 경계 검사에서 읽은 앞 글자를 다음 반복의 c로 승계해 글자당 한 번만 읽는다
			if (slides) for (let w = lane; w; ) { // mid anchor와 뒤따르는 block이 모두 일치한 뒤 bottomGap을 depth - 1 - segment로 구한다
				const s0 = image[w], s1 = image[w + 1], s2 = image[w + 2], first = s0 >>> 16, last = s0 & 0xFFFF, midChars = (s2 >>> 12) & 0x3FF, inner = w + 3, rest = (s1 >>> 3) & 0x3F, bottomStar = (s1 & 0x2) !== 0; { const size = s2 >>> 22; if (s1 & 0x4) w = 0; else if (size || !rest) w = inner + size; else { let f = inner + ((midChars - 1) >> 1); for (let b = 0; b < rest; b++) f += 1 + ((image[f] & 0x3FF) >> 1); w = f; } } // s0과 s1과 s2를 읽고 마지막 lane 표지와 본문 길이로 다음 lane 주소 w를 계산한다
					if (one) { const index = s1 >>> 9; if ((bitmap[1 + (index >> 5)] & (1 << index)) !== 0) continue; } if (((s2 & 0x3F) << 1) - 1 > me - ms) continue; // ONE에서 slide 좌표가 bitmap에 표시돼 있으면 그 lane의 anchor 검사를 건너뛴다 // record 좌표의 글자 수가 depth의 두 배에서 1을 뺀 값보다 작으면 anchor를 스캔하기 전에 제외한다
				let fit = false, topStar = (s1 & 0x1) !== 0, topGap = (s2 >>> 6) & 0x3F, q = ms; if (topStar && !bottomStar) { if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } const gap = depth + topGap - (s2 & 0x3F); if (gap < topGap) q = me; else { topGap = gap; topStar = false; } } // top이 별이고 bottom 쪽 segment 수가 고정이면 anchor 위치가 하나로 정해지므로 slide 없이 그 자리만 시도한다
				if (!topStar) for (let g = 0; g < topGap; g++) { while (q < me && beat.charCodeAt(q) !== 45) q++; q++; } // anchor 위치가 하나로 정해지면 topGap개의 segment를 건너뛴 자리에서만 anchor를 맞춘다
				for (let topSide = 0; q + midChars <= me; q++) {
					if (q > ms) { if (beat.charCodeAt(q - 1) === 45) topSide++; else continue; } // segment 경계에서만 anchor를 시도하며 anchor 앞의 조상 수를 센다
					const stop = q + midChars; v: { if (beat.charCodeAt(q) !== first || beat.charCodeAt(stop - 1) !== last) break v; let k = 1; for (; k + 1 < midChars - 1; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[inner + (k >> 1)]) break v; if (k < midChars - 1 && beat.charCodeAt(q + k) !== (image[inner + (k >> 1)] & 0xFFFF)) break v; // 첫 글자와 끝 글자는 s0의 first와 last로 대조하고 중간만 본문을 읽는다 // 글자가 하나면 first와 last가 같아 두 대조가 모두 통과한다
					if (stop < me && beat.charCodeAt(stop) !== 45) break v;
					if (!topStar || topSide >= topGap) { // top이 별이면 조상 수가 topGap 이상이어야 한다
						let e = stop, segment = (s2 >>> 6) & 0x3F, offset = inner + ((midChars - 1) >> 1); for (let i = 0; i < rest; i++) { const block = image[offset], target = (block >>> 10) & 0x3F, length = block & 0x3FF, cursor = offset + 1; while (segment < target) { while (e < me && beat.charCodeAt(e) !== 45) e++; e++; segment++; } const next = e + length; if (next > me || (next < me && beat.charCodeAt(next) !== 45) || beat.charCodeAt(e) !== (block >>> 16)) break v; k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(e + k) | (beat.charCodeAt(e + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(e + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; e = next; segment = target; offset = cursor + (length >> 1); } // block의 첫 글자를 먼저 대조하고 나머지는 두 글자씩 묶어 대조한다
						const bottomGap = (s2 & 0x3F) - 1 - segment; if (bottomStar && bottomGap === 0) fit = true; else { let bottomSide = 0; for (let j = e; j < me; j++) if (beat.charCodeAt(j) === 45) bottomSide++; fit = bottomStar ? bottomSide >= bottomGap : bottomSide === bottomGap; } // bottomStar가 참이면 bottomSide가 bottomGap 이상이어야 하고 거짓이면 정확히 bottomGap이어야 한다
					} }
					if (fit || !topStar) break; // topStar가 거짓이면 한 자리만 보고 참이면 맞을 때까지 slide한다
				}
				if (fit) { const index = s1 >>> 9; if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bitmap[1 + (index >> 5)] |= 1 << index, --midAlive || (slides = 0), --left === 0)) return; } // slide 좌표는 첫 글자가 별이나 하이픈이라 top 전환 처리 대상이 아니다
			}
			if (!match && !hit && callback(beat, ms, me, ks, ke, vs, ve, -1) === false) return;
		} } finally { if (bitmap === image) image[0] = control; }
	}
};



const A = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 1; // ONE 모드는 좌표별 첫 매칭만 발화하고 더 발화할 수 있는 좌표가 없으면 즉시 종료한다
BEAT.read(stream, A, (beat, ms, me, ks, ke, vs, ve, index) => {


	switch (index) {
		case 0:
			break;
		case 1:
			// 3--3-1-1 wild에 처음 매칭된 record만 파싱 없이 이 실행부에 도달하며 값 범위를 cache에 남길 수 있다
			// cache.speed = [beat, vs, ve];
			break;
	}
});



const B = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 0; // IN 모드는 매칭된 record만 발화하고 callback이 false를 반환하지 않으면 원문 끝까지 스캔한다
BEAT.read(stream, B, (beat, ms, me, ks, ke, vs, ve, index) => {


	switch (index) {
		case 0:
			break;
		case 1:
			// 3--3-1-1 wild에 매칭된 모든 record가 파싱 없이 이 실행부에 도달하며 값 범위를 cache에 남길 수 있고 매 발화마다 cache를 갱신할 수 있다
			// cache.speed = [beat, vs, ve];
			break;
	}
});



const C = [
	'1', // schema-version:1.0.0
	'2',
	'3',
	'4'
];

BEAT.MODE = -1; // ALL 모드는 원문을 한 번 스캔해 N개의 논리적 layer를 동시에 처리한다
BEAT.read(stream, C, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE가 -1이면 모든 record가 여기로 흐르고 미매칭 record는 index가 -1로 발화한다

	switch (index) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			break;
		case -1:
			break;
	}


});
```

BEAT reader는 zero-allocation 스캔으로 바코드를 찍듯 데이터를 검증합니다. BEAT Notation과 Topological Coordinates 체계가 이미 의미론적으로 완성되어 있으므로 전체 데이터를 검증할 필요가 없습니다. 잘못된 데이터가 비처럼 쏟아져도 물에 젖지 않습니다.

데이터 무결성이 중요한 경우 다음과 같은 시도를 할 수 있습니다. `_4dva1ser-2-3-1-2-1 x:184.2 _4dva1ser-2-3-1-2-2 y:72.8 _4dva1ser-2-3-1-2-3 yaw:-2.1` 예시는 `4dva1ser`와 같은 meta prefix를 좌표 안에 배치하여 스캔 허용 기준으로 삼습니다.

이는 단순히 데이터 거버넌스의 목적뿐만 아니라, `_A-1-1 x:2025 _B-1-1 x:2077 _C-1-1 x:2100`과 같이 동일한 규격의 스트림이 쏟아지는 환경에서 단일 BEAT reader로 안정된 성능을 유지하며 구분할 수 있음을 시사합니다. AI, Edge 컴퓨팅과 같이 멀티 테넌시가 중요한 환경에서 유용합니다.

```
_users-0000000001-1 info
_users-0000000001-1-1 username:aidgn
_users-0000000001-1-2 email:info@aidgn.com
_users-0000000001-1-3 status:active
_users-0000000001-2 meta
_users-0000000001-2-1 ...
```

또한 BEAT는 기존 Database의 구조적 한계를 넘어, 읽기와 쓰기가 공존하는 Datastream을 만들 수 있습니다. 데이터가 처음부터 Topological Coordinates를 가지므로, 별도의 tree 구성이나 key lookup과 같은 형식에 의존하지 않고 하드웨어 가속 병렬 스캔에 최적화됩니다.

상기 예시에서 `users-0000000001` 부분은 Topological Coordinates 안에 포함된 meta prefix로서, `users`는 데이터의 종류를, `0000000001`은 ID에 해당합니다. BEAT 리더에서 `users--1-1`과 같이 변동값에 해당하는 ID 위치를 비우고 스캔하면 모든 username을 스캔할 수 있습니다.

`_users-0000000001-info_users-0000000001-info-username:aidgn`처럼 Topological Coordinates를 모두 meta prefix로 할당하는 방법도 있습니다. 재밌게도 이 방법은 Web Advaiser implementation의 `_key:value` 예시처럼 일반적인 BEAT 형식을 계층적으로 표현한 것입니다.

BEAT Reader for JSON 구현체는 일반적인 JSON을 BEAT Notation을 사용하는 `_key:value` 형식으로 전처리하여, 메모리 증폭을 발생시키는 `JSON.parse` 과정 없이 BEAT.read로 흘려보냅니다. 즉, BEAT뿐만 아니라 JSON에서도 zero-allocation 스캔과 Topological Coordinates의 가치를 경험할 수 있습니다.

BEAT는 처음부터 다른 언어 및 포맷들과 공존하도록 설계되었습니다. 그리고 BEAT의 가장 큰 장점은, 양자 텐서 사례처럼 across diverse domains and platforms에서 동일한 표현으로 Interpretation할 수 있다는 점입니다. 로우 레벨부터 하이 레벨까지, translation layer가 필요하지 않습니다.

<br />

## Interpretation

BEAT is a data format because it defines multi-dimensional data as linear sequences using semantic states. It is also a protocol because those same states enable consistent interpretation across diverse domains and platforms, while supporting real-time streaming where readers can scan bytes as they arrive.

Semantic Raw Format (SRF) expresses this dual nature. BEAT is the SRF standard and has potential as a World Models Language (WML). Therefore, consistent interpretation of BEAT across different environments is important to maintain semantic compatibility.

### INTERPRETATION LAYER

In the **INTERPRETATION LAYER**, the BEAT specification is adopted directly, ensuring consistent interpretation of the semantic streams it expresses.

### CUSTOM LAYER

In the **CUSTOM LAYER**, all other logic may be modified or extended as needed, including but not limited to control flow, routing, resource management, output policy, AI components, analytics, security, and domain-specific strategies.

<br />

## Essence

BEAT is an all-for-one expressive format, and a one-for-all interpretive protocol.

<br />

## License

Copyright (c) 2025 Aidgn

- **BEAT Local Implementation**: GPL-3.0-or-later License
- **BEAT Network Implementation**: AGPL-3.0-or-later License

BEAT is the Semantic Raw Format (SRF) standard. BEAT sequences express meaning without parsing (Semantic), preserve information in their original state (Raw), and maintain a fully organized structure (Format). This enables direct readability for humans and AI.

BEAT licensing applies across Finance, Game, Healthcare, IoT, Logistics, and other environments. Internal use is unrestricted. **BEAT Local Implementations** use GPL-3.0-or-later when modified or distributed, allowing integration in any environment including SSR or game servers without extending copyleft to backend code. **BEAT Network Implementations** use AGPL-3.0-or-later, ensuring source sharing when BEAT-based logic is provided over a network like SaaS.

BEAT is defined as an expressive format, including but not limited to semantic streams and Topological Coordinates, whether expressed together or separately. Consistent interpretation of BEAT across different environments is also important to maintain semantic compatibility. Therefore, alternative implementations that claim equivalence are expected to use the Compatibility criteria provided below to verify interpretation consistency.

**Compatibility**: BEAT is considered compatible even if the tokens vary within Printable ASCII (0x20 to 0x7E) or the implementation differs, as long as data is expressed using the sequential notation defined in the BEAT specification, preserves expressive semantics including but not limited to the space where events occur, the time when events occur, the depth of each event, and maintains a substantially similar semantic stream regardless of how it is stored or transmitted. Semantic compatibility is determined by the semantic stream expressed within BEAT's eight-state (3-bit) semantic layout, irrespective of implementation details such as token choice, token order, token subsets, or storage representation. Any such compatible implementation constitutes a derivative work under copyright law and must comply with the BEAT license.

See individual source files for detailed license information.

<br />

## Resources

If you would like to get in touch, feel free to reach out via email or DM on X. Thank you.

- **Email**: [info@aidgn.com](mailto:info@aidgn.com)
- **X**: [https://x.com/aidgncom](https://x.com/aidgncom)
- **YouTube**: [https://www.youtube.com/@aidgn](https://www.youtube.com/@aidgn)

<br />
