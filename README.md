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

비트에서 JSON-like의 key & value 표현이 필요한 경우, 일반적으로 `_`는 key를 포함하는 meta 구간을 열고 `:`는 value 구간을 표시합니다.

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
	META: '_', VALUE: ':', MODE: -1, CACHE: new WeakMap(), EMPTY: new Int32Array(4), // META는 BEAT 위상좌표의 시작점을 표현하며 VALUE는 키와 값의 경계를 표현한다 // MODE는 발화 방식을 결정하며 -1이 ALL이고 0이 IN이며 1이 ONE을 의미한다 // 모든 모드는 Events ~ Writes ~ Reads가 하나로 흐르는 제로 얼로케이션 스캔이다 // CACHE에 상주하는 산물은 Int32Array 실행 이미지 단 한 장이다 // 클램프도 콜 맨 앞의 한 줄이 유일해 모든 사실이 한 곳에서 결정된다 // EMPTY는 산물 없는 프리픽스 전부가 공유하는 빈 이미지라 매칭기가 없고 재빌드도 없다 // 빈 자리를 넘어 읽어도 범위 밖 undefined가 0으로 정규화되어 그대로 안전하다
	read(beat, prefix, on) {
		const M = BEAT.META, V = BEAT.VALUE, mode = BEAT.MODE | 0, match = mode >= 0, one = mode > 0; // mode는 콜마다 스냅샷으로 잡아 콜 중간의 MODE 변경이 진행 중인 스캔을 흔들지 못한다 // ALL은 -1로 전 레코드를 발화하고 IN은 0으로 매칭만 발화하며 ONE은 1로 니들당 첫 발화만 하고 전원 해소되면 즉시 종료한다 // match는 매칭만 발화하는 IN과 ONE의 공통 표지이고 one은 ONE 전용 표지다 // ALL과 IN은 공통 메인 스캔을 사용한다
		let ms, me, ks, ke, vs, ve, find = 0, image; // find는 레코드 사이에 걸쳐 쓰는 메모로 지금까지 검색이 증명한 범위의 첫 V 위치이거나 V 부재의 -1이다 // ks가 레코드 진행으로 단조 증가하므로 find가 ks 이상이면 ks부터 find 앞까지 V가 없음이 이미 증명되어 그대로 재사용하고 -1이면 남은 스트림 전체에 V가 없어 다시 찾지 않으며 이는 경계 계산이 발화 레코드에서만 드문드문 일어나는 IN과 ONE에서도 성립한다 // 초기 find 0은 모든 실제 ks보다 작아 첫 검색을 강제한다
		const over = prefix.length > 0x7FFFFF, count = over ? 0x7FFFFF : prefix.length, words = (count + 31) >> 5; // 클램프 결정이 이 한 줄이라 콜드와 핫이 같은 count와 words를 공유한다 // 빈 프리픽스는 count 0 words 0으로 자연 정합하고 over가 참이면 count가 천장값이라 0이 아니므로 빈 판정은 count로 충분하다
		if (count === 0) { if (match) return; image = BEAT.EMPTY; } // 프리픽스가 비면 IN과 ONE은 발화 없이 즉시 반환한다 // ALL은 공유 빈 이미지로 공용 메인 루프에 합류해 전 레코드를 -1로 발화하며 할당이 없다
		else if (!(image = BEAT.CACHE.get(prefix))) { // 프리픽스 배열은 처음 한 번만 분석한다 // 리터럴과 탑 고정은 정방향 trie에 넣고 바텀 고정은 거울 가지에 넣으며 탑과 바텀이 열린 미드는 슬라이드 레인으로 넣는다
			let flags = over ? 8 : 0, costs = 2; // count는 유효 반복 상한으로 맨 앞의 단일 클램프가 P 초과의 기록 근거 over와 루프 경계를 함께 준다 // words도 count 기준이라 편승 비트맵이 등록 가능 범위만 덮고 P가 int32에 접히는 희소 배열에서도 음수가 되지 않는다 // costs 초기 2는 루트와 hook 몫이다 // 포화 니블은 천장 히트를 기록한다 // 비트1은 깊이 63으로 6비트 level에 실리는 체인 편입분의 천장이며 직발화 리터럴은 트라이 경로가 곧 깊이 게이트라 천장이 없고 중복으로 체인에 편입되는 리터럴은 같은 천장을 받는다 // 비트2는 앵커 8191이 상한이다 // 비트4는 세그 1023이 상한이다 // 비트8은 P로 프리픽스 루프 캡과 트라이 nodes 예산과 verify head와 슬라이드 팩과 체인 시작과 배치 천장 limit을 아우르는 23비트 스케일 가족과 arena 유닛 커서의 26비트 천장과 글자 니들 합산의 31비트 천장을 회수한다 // 카운트는 P까지 차고 리터럴 종단은 index+1을 실으므로 i가 0x7FFFFF 미만인 것이 공통 안전선이다 // 천장 밖 니들은 조용히 불발하므로 이 니블이 아니면 흔적이 없다 // flags가 서면 image가 반드시 존재하므로 판독 자리가 사라지는 형상은 없다 // 판독은 image[0]을 5비트 오른쪽으로 민 뒤 하위 4비트를 읽으며 루트 비트4부터 2까지는 예약이다
			const meta = M.charCodeAt(0);
			let chars = 0, paths = 0, cut = count; for (let i = 0; i < cut; i++) { const path = prefix[i]; if (path) { if (chars + path.length + paths + 1 > 0x7FFFFFFF) { flags |= 8; cut = i; } else { chars += path.length; paths++; } } } // 선측정 한 바퀴가 길이만 읽어 두 상한을 확정하므로 성장과 가드가 없다 // 글자와 니들 수의 합이 31비트를 넘으면 notes 크기식의 시프트가 int32로 접혀 과소 할당의 조용한 유실이 되므로 그 니들부터 끊고 비트8을 기록하며 이는 count 클램프와 같은 앞쪽 절단이고 메인 파스도 같은 cut을 상한으로 쓴다
			const arena = paths * 3, notes = new Int32Array(arena + ((((chars + paths) >> 1) + 2) >> 1)); // notes는 파스 기록 한 장이다 // 바닥에서 와일드 3레인이 자라고 중간 지대에 중복 쌍이 살며 리터럴은 arena 경계에서 거꾸로 자라고 arena부터는 미드 헤더가 한 워드에 둘씩 팩되어 산다 // 와일드는 비지 않은 니들의 부분집합이고 니들당 세 레인이라 paths 곱 3이 상한이다 // arena는 미드 블록 헤더만 담고 헤더는 비지 않은 세그당 하나인데 세그마다 글자 하나 이상에 세그 사이 하이픈 하나라 세그 수 합이 전체 길이 더하기 니들 수의 절반을 넘지 못한다 // 리터럴은 arena 경계 drop에서 거꾸로 자라며 와일드가 세 칸에 리터럴이 한 칸이라 와일드 수 곱 3 더하기 리터럴 수가 3paths를 넘지 못해 마주 자라도 충돌하지 않고 arena 구역은 미드 헤더 전용이라 리터럴과 영토가 겹치지 않는다 // 생존 니들의 헤더 값은 전부 65535 이하이고 기입이 0xFFFF 마스크로 Uint16 절단을 재현하므로 회수 예정 니들의 초과 세그 인덱스도 이웃 유닛을 침범하지 못한다 // units가 유닛 커서고 lanes가 레인 커서다 // 메타 정보를 객체 없이 평탄 배열 한 장에 담는다
			let lanes = 0, units = 0, drop = arena, tops = 0, bottoms = 0; // tops와 bottoms는 가지 등록 수이며 파스 시점에 확정된 뒤로는 감산 없이 그대로 유지된다 // 게이트는 tops가 0보다 클 때 켜지고 거울 생성은 bottoms가 0보다 클 때 일어나며 카운트 워드는 등록값 그대로다 // 천장에서 스킵되었거나 방출이 유실된 니들은 계수에 남아 left가 0에 닿지 못하므로 ONE은 그 경우 조기 종료 대신 끝까지 완주한다 // 이는 조기 종료만 포기하고 발화 완전성은 지키는 것이며 전이 백스톱과 같은 계약이다 // 자유 탑 회수는 스윕에서 면제되어 계수에 넣지 않으므로 그 경우의 조기 종료는 그대로 보존된다 // 등록 수가 생존 수 이상이라 게이트는 생존 니들이 있으면 항상 켜진다
			for (let i = 0, path, wild, cost; i < cut; i++) {
				path = prefix[i]; if (!path) continue;
				let low = 0, high = path.length, topStar = path.charCodeAt(0) === 42; if (topStar) { low = 1; if (low >= high) continue; } // 탑에 별이 있으면 슬라이스 없이 low 오프셋을 옮겨 범위로 처리한다
				const first = path.charCodeAt(low), last = path.charCodeAt(high - 1); wild = topStar || first === 45 || last === 45 || last === 42; if (!wild) { cost = first < 256 ? 1 : 2; for (let n = low + 1; n < high; n++) { const c = path.charCodeAt(n); cost += c < 256 ? 1 : 2; if (c === 45 && path.charCodeAt(n - 1) === 45) { wild = true; break; } } } // 별이나 탑 바텀의 하이픈이나 빈 세그 중 하나라도 있으면 와일드다
				if (wild) {
					const bottomStar = last === 42; if (bottomStar) { high--; if (low >= high) continue; } // 바텀에 별이 있으면 high 오프셋을 줄인다
					let depth = 1; for (let n = low; n < high; n++) if (path.charCodeAt(n) === 45) depth++; // 세그 수는 하이픈 수에 1을 더한 값이며 parts나 length 변수 없이 바로 센다
					let topChars = 0, topDepth = 0; if (!topStar && first !== 45) for (let j = low; ;) { while (j < high && path.charCodeAt(j) !== 45) j++; topDepth++; if (j === high || j + 1 === high || path.charCodeAt(j + 1) === 45) { topChars = j - low; break; } j++; } // 탑에서 이어지는 연속 고정 닻 구간의 문자 길이이며 내부 하이픈을 포함한다 // 같은 자리를 이미 읽은 first라 재독이 없다
					let bottomChars = 0, bottomDepth = 0; if (!bottomStar && last !== 45) for (let j = high - 1; ;) { while (j >= low && path.charCodeAt(j) !== 45) j--; bottomDepth++; if (j === low - 1 || j === low || path.charCodeAt(j - 1) === 45) { bottomChars = high - 1 - j; break; } j--; } // 바텀에서 이어지는 연속 고정 닻 구간의 문자 길이이며 내부 하이픈을 포함하고 거꾸로 센다 // bottomStar 거짓 가드 안이라 high가 원위치이고 last가 그 자리다
					const mark = units; // 닻 글자는 원본 path가 단일 진실이라 arena에 싣지 않고 소비자가 path를 직접 읽는다 // arena는 미드 블록의 헤더 한 유닛만 담는다
					let blocks = 0, flag = 0, stop = depth - bottomDepth; for (let n = topDepth, cursor = low + (topChars ? topChars + 1 : 0); n < stop; n++) { let length = 0; while (cursor + length < high && path.charCodeAt(cursor + length) !== 45) length++; if (length) { if (length > 0x3FF) { flag |= 4; break; } const slot = arena + (units >> 1), shift = (units & 1) << 4; notes[slot] = notes[slot] & ~(0xFFFF << shift) | ((((n << 10) | length) & 0xFFFF) << shift); units++; blocks++; } cursor += length + 1; } // 미드 고정 세그를 path에서 바로 스캔하며 세그 인덱스 n을 함께 따라간다 // 위치는 저장하지 않는다 // 블록 사이 세그는 전부 빈 세그뿐이라 블록 간 문자 거리가 타깃 인덱스 차와 같고 소비자가 이전 위치 더하기 이전 길이 더하기 타깃 차의 항등식으로 유도한다 // 초과 세그는 그 자리에서 끊어 죽을 적재와 10비트를 넘친 헤더가 아예 생기지 않으며 flag 니블이 문법 거부의 선점을 막아 복합 천장 기록이 보존된다 // 각 세그는 n을 10비트 왼쪽으로 민 값에 length를 더한 헤더 한 유닛으로 arena에 담긴다
					if (!topChars && !bottomChars && !blocks && !flag) continue; // 고정 세그가 적어도 하나는 있어야 하되 flag가 선 니들은 절단으로 arena가 비어도 문법 거부가 아니라 회수 결산으로 보내며 정상 니들은 첫 비교가 거짓이라 단락 평가로 flag를 읽지 않는다 // 탑과 바텀과 미드 셋 다 없음을 파스 플래그로 직접 판정한다 // 별과 하이픈만으로는 좌표를 가리킬 수 없으므로 등록하지 않으며 이는 별 하나만 있는 경우를 거부하는 규칙의 일반형이다
					if (depth > 63) flag |= 1; if (topChars > 0x1FFF || bottomChars > 0x1FFF) flag |= 2; if (blocks && mark > 0x3FFFFFF) flag |= 8; if (flag) { flags |= flag; units = mark; if (topChars) { if (bottomChars) bottoms++; else tops++; } continue; } // lane2의 mark는 26비트 팩이라 그 너머의 유닛 커서는 절단 별칭이 되므로 블록을 가진 니들만 회수하며 블록 없는 니들은 mark 필드를 어떤 소비자도 읽지 않아 그대로 산다 // flag는 이 니들의 천장 니블로 각 판정이 자기 비트를 한 번 세우고 회수가 flags에 한 번 합치므로 종류 기록과 회수 표지라는 두 상태가 하나이며 니들 로컬 flag와 전역 flags가 단복수 쌍이다 // 천장 회수를 hash와 레인 등록보다 앞에서 끝내 그 두 폐기 작업을 만들지 않으며 이미 적재한 이 니들의 arena 헤더는 mark로 즉시 되돌린다 // 잘못된 별칭 발화 대신 조용히 불발시키며 초과 사실은 포화 니블에 기록되고 판독은 image[0]을 5비트 오른쪽으로 민 뒤 하위 4비트를 읽는다 // 스윕 패리티를 위해 스윕 가능한 회수 니들 즉 topChars가 1 이상인 니들은 진영 계수를 유지하는데 결제 가능한 니들이 계수에 있어야 ONE 감산이 균형을 이루기 때문이다 // 자유 탑은 스윕에서 면제되어 계수에 넣지 않는다
					let hash; if (bottomChars) { hash = bottomChars + 1; for (let q = 0; q < bottomChars; q++) { const c = path.charCodeAt(high - bottomChars + q); hash = ((hash * 31) ^ c) & 0x7F; costs += c < 256 ? 1 : 2; } hash = ((hash * 31) ^ 32) & 0x7F; } else if (topChars) { hash = ((topChars + 1) * 31 ^ meta) & 0x7F; for (let q = 0; q < topChars; q++) { const c = path.charCodeAt(low + q); hash = ((hash * 31) ^ c) & 0x7F; costs += c < 256 ? 1 : 2; } } else hash = (31 ^ meta) & 0x7F; // 군집을 확정하기 전에 경로 비교 앞단에서 쓰는 7비트 정수 지문이다 // 군집의 전체 폭 해시와 같은 재귀식이라 규칙을 바꿀 때는 두 자리를 함께 바꾼다 // 니들 글자와 경계 문자를 문자열 없이 바로 롤링 해시하며 경계 문자는 바텀 고정이면 공백이고 탑 고정이면 밑줄이다 // 계층 프리픽스는 미드가 변별점이라 길이나 첫 글자나 끝 글자만으로는 약하다 // 같은 니들은 같은 hash가 나오므로 놓치는 경우가 없다
					notes[lanes] = (i << 9) | (hash << 2) | (topStar ? 0x1 : 0) | (bottomStar ? 0x2 : 0); notes[lanes + 1] = (topChars << 19) | (bottomChars << 6) | blocks; notes[lanes + 2] = (mark << 6) | depth; lanes += 3; // 와일드 메타를 세 레인으로 담는다 // 레인0은 index와 7비트 hash와 탑 바텀 별 플래그다 // 레인1은 topChars와 bottomChars와 blocks다 // 레인2는 미드 시작 mark와 depth다 // 슬라이드 닻 메타인 midChars와 topGap과 bottomGap과 first와 last와 inner는 레인이 아니라 상주 본문을 빌드할 때 미드 헤더와 원본 path에서 도출한다 // 콜드 빌드의 닻 글자는 원본 path에서 직접 읽으며 탑은 앞에서 topChars만큼이고 바텀은 끝에서 bottomChars만큼이라 별도 오프셋이 없다
					if (bottomChars) bottoms++; else if (topChars) tops++; // 닻 위치로 분류하는데 바텀 고정은 거울 가지로 가서 탑 블록까지 흡수하고 탑 고정은 정방향 가지로 가서 미드까지 흡수하며 탑과 바텀이 열린 미드 고정만 슬라이드로 보낸다 // 바텀이 고정된 니들은 계층 트리의 fan-out 특성상 바텀 쪽 경로가 통계적으로 더 높은 엔트로피를 가지므로 바텀을 대표 닻으로 잡아 거울 가지로 우선 귀속시키고 탑과 미드 블록은 그 verify에서 확인한다
				} else { notes[--drop] = i; costs += cost; } // 리터럴 확정 시에만 cost를 커밋하므로 이중 하이픈으로 와일드가 된 니들의 누적은 버려진다
			}
			const wilds = lanes / 3, width = 1 + tops + bottoms, chain = costs * 3, link = chain + width, forms = link + width, frame = new Int32Array(forms + lanes + wilds), mask = (wilds ? 1 << (31 - Math.clz32(wilds)) : 1) - 1; // 빌드는 arena의 미드 헤더와 오프셋을 읽고 글자는 단일 진실인 원본 path에서 직접 읽는다 // 상주하는 것은 산물뿐이라 스크래치는 어느 것도 상주하지 않는다 // 니들과 shape와 hash가 같은 와일드를 forms에서 서로 인접하게 두면서 군집을 적재한다 // 발화 동률 계약에 따라 depth가 같으면 와일드 등록순 즉 군집 순서를 따른다 // 니들 해시 체인으로 기대 O(n)에 군집하며 크기 장부는 0부터 n까지 체인 장부는 n부터 2n까지 버킷 장부는 2n부터 2n+B까지 쓰며 B는 n 이하의 2의 거듭제곱이다 // 이 장부는 전부 forms의 스크래치를 0으로 채운 것을 재해석해 빈 칸을 0으로 읽으므로 추가 할당이 없다
			for (let i = 0; i < wilds; i++) { const s = i * 3, label = notes[s], form = notes[s + 1], tag = label & 0x1FC, shape = form >>> 6, topChars = shape >>> 13, bottomChars = shape & 0x1FFF, length = bottomChars ? bottomChars : topChars, needle = prefix[label >>> 9], start = bottomChars ? needle.length - bottomChars : 0; let hash = length + 1; for (let k = 0; k < length; k++) hash = ((hash * 31) ^ needle.charCodeAt(start + k)) | 0; const bucket = (wilds << 1) + ((hash ^ shape ^ tag) & mask); let h = frame[forms + bucket] - 1; for (; h !== -1; h = frame[forms + wilds + h] - 1) { const t = h * 3; if ((notes[t + 1] >>> 6) !== shape || (notes[t] & 0x1FC) !== tag) continue; const other = prefix[notes[t] >>> 9], low = bottomChars ? other.length - bottomChars : 0; let k = 0; for (; k < length; k++) if (needle.charCodeAt(start + k) !== other.charCodeAt(low + k)) break; if (k < length) continue; break; } if (h === -1) { frame[forms + wilds + i] = frame[forms + bucket]; frame[forms + bucket] = i + 1; h = i; } frame[forms + lanes + i] = h; frame[forms + h]++; } // 등록순으로 한 번 훑으며 니들 롤링 해시가 버킷 키이고 파스의 7비트 지문과 같은 규칙 즉 시드는 길이에 1을 더한 값이고 31을 곱하며 XOR하는 규칙의 전체 폭 판이다 // 같은 버킷에서는 군집 머리 체인만 shape와 7비트 tag 프리필터와 앵커 글자 순으로 직접 비교하며 머리가 없으면 자신이 새 머리가 되어 앞에 붙는다 // order 항목은 소속 머리를 가리키고 forms의 머리 자리는 군집 크기를 담는다
			for (let i = 0, base = 0; i < wilds; i++) if (frame[forms + lanes + i] === i) { const size = frame[forms + i]; frame[forms + i] = base; base += size; } // 머리가 등장한 순서 즉 등록순으로 누적합을 만들어 군집별 forms 시작 오프셋을 정한다
			for (let j = 0; j < wilds; j++) frame[forms + lanes + j] = frame[forms + frame[forms + lanes + j]]++; // 등록순으로 훑으면서 같은 군집에 연속 슬롯을 부여하고 오프셋을 하나씩 올려가며 채워 order를 확정한다
			for (let j = 0; j < wilds; j++) { const e = frame[forms + lanes + j] * 3, s = j * 3; frame[forms + e] = notes[s] & ~0x1FC; frame[forms + e + 1] = notes[s + 1]; frame[forms + e + 2] = notes[s + 2]; } // 산포하며 lane0의 hash 7비트를 소거해 군집 잔값을 비우고 그 자리 비트2가 예약 표지 전용이 된다 // order가 일대일 대응이라 3n개 워드를 전부 덮어써 스크래치를 지우면서 forms에 적재하며 이후 파이프라인인 레인 선측정과 trie 빌드는 이 값을 바꾸지 않는다
			let body = 0, mids = 0; for (let w = 0; w < lanes; w += 3) { const form = frame[forms + w + 1]; if (form >>> 6) continue; if (4 + words + ((mids + 1) << 2) + body > 0x7FFFFF) { flags |= 8; break; } const mark = frame[forms + w + 2] >>> 6, midChars = (notes[arena + (mark >> 1)] >>> ((mark & 1) << 4)) & 0x3FF, rest = (form & 0x3F) - 1; let gain = (midChars - 1) >> 1; for (let i = 0, unit = mark + 1; i < rest; i++, unit++) gain += 1 + (((notes[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0x3FF) >> 1); body += gain; mids++; } // 슬라이드 크기를 트라이보다 먼저 재는 것은 배열을 한 번 잡으려면 표 앞에 정박할 body까지 모든 크기가 먼저 필요하기 때문이며 이 패스는 forms에서 탑과 바텀이 모두 열린 미드 레인을 걸러 arena에서 크기만 읽어 배치와 무관하고 body와 mids를 장부로 남겨 둘째 패스가 같은 순서로 채우며 이는 reserve가 load만 재고 예약 표지만 남겨 후속 패스에 넘기는 것과 같은 계열이다 // 레인 시작의 절대 주소가 23비트를 넘으면 그 레인부터 끊고 비트8을 기록하는 커밋 전 판정이며 마지막 커밋의 검사가 최종 레인 수 기준의 시작 상한을 봉인하고 앞 레인은 body 단조로 자동 봉인되어 s2에 팩되는 전 레인 fill이 23비트 이하가 항등이고 이는 reserve의 커밋 후 총량 검사와 같은 원칙이다 // 본문 끝은 팩되지 않는 산술 인덱스라 천장 계약 밖이며 이는 트라이의 base 팩과 base 더하기 c 산술 접근의 관계와 같은 대칭이다 // body는 image에 정박할 슬라이드 본문의 워드 수로 앵커 중간 글자 2팩과 미드 블록당 헤더 겸 첫 글자 한 워드와 나머지 글자 2팩을 세며 mids는 살아남은 레인 수다
			const budget = 0x7FFFFA - words - (mids << 2) - body;
			let slide = 0; if (drop < arena || tops || bottoms) { if (budget <= 0) flags |= 8; else { // budget이 0 이하면 최소 산물 하나도 담을 공간이 없어 삽입 전원이 회수될 운명이라 트라이 빌드를 통째로 생략하고 비트8만 기록하며 니들 계수는 최소 이미지의 카운트가 유지해 ONE이 성급히 종료하지 않는다 // budget이 양수면 등록 지점마다 선행 검사가 items와 load의 합을 budget 이하로 묶어 trie가 23비트 미만이고 limit이 0 이상이라 배치와 성장의 전제가 선다 // forms를 패스별로 바로 디코드하는데 레인0은 index와 7비트 hash와 탑 바텀 별 플래그 레인1은 topChars와 bottomChars와 blocks 레인2는 미드 시작 mark와 depth이며 닻 글자 위치는 path와 별 플래그와 길이에서 즉시 나온다 // costs는 파스와 대표 닻 hash에 융합되어 forms 순회가 이 계산을 지지 않는다 // 한 trie가 두 갈래를 담아 리터럴과 탑 고정은 정방향이고 바텀 고정은 거울 가지이며 레코드마다 탑과 바텀 양쪽에서 한 번씩 걷는다
				let table = null, rest = 0, load = 1, links = 1, pair = lanes, nodes = 1, span = 0; // frame은 골조 한 장이다 // 0번지부터 트라이 노드가 stride 3으로 살고 chain부터 체인 아이템 레인이 width 폭으로 살고 link부터 같은 폭의 링크 레인이 살며 forms부터 군집 레코드와 order가 산다 // 세 구역 모두 파스 종료 시점에 크기가 확정되어 한 번에 카빙한다 // 노드는 한 노드가 인접한 Int32 세 칸 12바이트다 // 노드별 base 레인은 삽입 내내 죽어 있고 배치에서야 사는 레인이라 수명이 달라 배치 시점에 grid에 정확한 nodes 크기로 선다 // 0번 칸은 첫 자식 인덱스이고 0이면 자식이 없다 // 1번 칸은 byte를 23비트 왼쪽으로 민 값에 next를 더한 형제 링크이며 0이면 형제가 없다 // 2번 칸은 payload로 리터럴 종단은 깊이를 24비트 왼쪽으로 민 값에 index+1을 더한 양수이고 와일드 체인 머리는 head를 비트 반전한 음수이며 둘 다인 노드는 2번 칸에 리터럴 종단 payload를 양수로 두고 체인 head는 table 사이드 장부의 짝 키에 둔다 // base는 grid의 reach 뒤 구역에 산다 // 자식과 형제가 전부 직접 인덱스에 0 없음 인코딩이고 루트가 0번이라 어떤 자식도 0일 수 없으므로 typed 0필이 곧 빈 트리라 초기화 루프가 없다 // load는 verify의 누적 크기로 예약 셀 하나에서 시작하며 head가 내용의 주소가 아니라 크기의 누적이라 측정만으로 즉시 확정된다 // 예약 표지는 군집 확정 후 죽는 lane0 hash 비트2에 세우며 둘째 패스가 forms를 탑 진영 먼저 두 번 훑어 같은 순서를 재도출하므로 별도 예약 장부가 없다 // rest는 꼬리 셀 중 chain 등록분 밖의 리터럴 몫으로 중복 리터럴 아이템과 꼬리 블록에 합류하는 대표 리터럴 종단 아이템을 등록 시점에 세어 선행 순회 없이 꼬리 크기를 확정한다 // costs는 파스의 리터럴 스캔과 대표 닻 hash가 글자를 읽는 그 자리에서 함께 누적하므로 이 산정을 위한 후행 재독 패스가 없다 // 리터럴 니들은 prefix에서 notes 거울 구역의 인덱스로 바로 읽으므로 나란한 배열이 없고 캐시에도 넣지 않는다
				const put = (node, c) => { let e, n; if (c >= 256) { const page = (c >> 8) + 256; if (page > span) span = page; n = 0; const head = frame[node * 3]; for (e = head; e; ) { const w = frame[e * 3 + 1]; if ((w >>> 23) === page) { n = e; break; } e = w & 0x7FFFFF; } if (!n) { n = nodes++; frame[n * 3 + 1] = (page << 23) | (head & 0x7FFFFF); frame[node * 3] = n; } node = n; c &= 0xFF; } if (c > span) span = c; n = 0; const head = frame[node * 3]; for (e = head; e; ) { const w = frame[e * 3 + 1]; if ((w >>> 23) === c) { n = e; break; } e = w & 0x7FFFFF; } if (!n) { n = nodes++; frame[n * 3 + 1] = (c << 23) | (head & 0x7FFFFF); frame[node * 3] = n; } return n; };
				const reserve = (w, extra) => { const form = frame[forms + w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF, blocks = form & 0x3F, front = bottomChars && topChars ? 1 : 0; const head = load; let next = load + 1 + blocks + (front ? 1 + (topChars >> 1) : 0); for (let m = 0, unit = frame[forms + w + 2] >>> 6; m < blocks; m++, unit++) next += (((notes[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0x3FF) >> 1); if (next + links + 1 + rest + extra > budget + 2) return -2; load = next; frame[forms + w] |= 0x4; return head; }; // reserve는 내용 없이 블록 헤더 도약으로 크기만 재 자리를 예약하고 head를 확정하며 내용은 팩 마무리의 둘째 패스가 notes 순서대로 verify에 직접 쓴다 // 천장 술어는 이 레코드를 전부 적재한 뒤의 load에 뒤따르는 links와 rest를 더한 커밋 후 총량이 budget+2를 넘으면 회수하며 이는 trie가 23비트를 넘지 않을 필요충분 조건이다 // extra는 top 공존 노드가 실제 rest를 늘릴 때만 1이다 // origin과 front는 측정과 적재 양쪽에서 forms로만 파생되므로 forms에는 예약당 표지 비트 하나만 남고 호출부는 판단을 갖지 않는다 // 바텀이 있으면 거울이라 origin이 place 하위 6비트에서 나오고 front가 topChars 유무이며 아니면 정방향 상수다 // chain과 link 레인은 와일드 종단 체인을 빌드할 때 쓰는 임시 구조다 // chain 워드는 별 부호와 redirect 비트와 payload를 6비트 왼쪽으로 민 값과 depth로 이뤄진다 // depth를 하위 6비트에 둔 것은 레벨 게이트가 아이템마다 가장 많이 읽는 값이라 말단에서 한 번의 연산으로 뽑기 위해서다 // payload는 발화 아이템에서만 6비트 오른쪽으로 밀어 읽는다 // 이 값이 최종 chain 워드 그대로다 // backlink는 같은 앵커의 이전 머리를 가리키며 앞에 붙여 등록하므로 역방향 링크다 // 최종 chain은 연속된 블록이고 비트30이 블록의 끝을 표시한다 // verify head의 비트6은 프리펜드 표지이며 blocks는 구조상 62 이하 계약 깊이가 63이라 프리펜드를 더한 total이 비트6을 침범하지 않는다 // 블록은 target 6비트와 첫 글자 16비트와 length 10비트로 이뤄진다 // 글자는 UTF-16 코드 유닛 즉 charCodeAt 단위이며 서로게이트 쌍은 2로 세고 길이와 앵커 상한도 전부 유닛 기준이다 // 프리펜드 첫 블록만 전용 형식으로 target 없이 예약 3비트와 첫 글자 16비트와 length 13비트로 이뤄지며 표지는 head 비트6이다 // 프리펜드에 target을 싣지 않는 것은 자리가 탑에 고정되어 판독 시점의 segment와 항상 같은 순수 중복이기 때문이고 비운 자리를 length가 받아 탑 닻 상한이 정방향과 같은 8191이 된다 // target은 깊이 천장 63이라 arena 팩과 같은 6비트다 // 첫 글자를 실어 두면 첫 비교를 로드 없이 블록 마스크로 할 수 있고 글자 스트림은 둘째 글자부터 둘씩 묶으므로 홀수 길이 블록마다 워드 하나가 줄고 길이가 1이면 글자 워드가 아예 없다
				for (let g = arena - 1, needle, length, node; g >= drop; g--) { needle = prefix[notes[g]]; length = needle.length; if (nodes + length * 2 > budget - links - rest - load) { flags |= 8; continue; }
				let depth = 1; node = 0; for (let i = 0; i < length; i++) { const c = needle.charCodeAt(i); node = put(node, c); if (c === 45) depth++; } if (frame[node * 3 + 2] > 0) { if (depth > 63) { flags |= 1; continue; } if (!table) table = {}; const e = table[node * 2 + 1] || 0; if (!e) rest++; notes[pair] = notes[g]; notes[pair + 1] = e; table[node * 2 + 1] = pair + 1; pair += 2; rest++; } else frame[node * 3 + 2] = ((depth & 0x3F) << 24) | (notes[g] + 1); } // 예산은 budget 한 곳에서 결정된다 // 최대 base 0x7FFFFE에서 루트 둘과 카운트A와 레인 폭 셀 넉 장을 빼고 고정 확정된 words와 레인 존과 본문 body를 선차감한 값이며 links와 rest와 load는 자라는 값이라 검사식이 그때그때 뺀다 // 트라이가 앞쪽 영역 뒤에서 시작하므로 꼬리와 verify가 자라는 만큼 예산이 준다 // 꼬리 장부는 등록과 함께 자라는 단조 값이라 선행 순회 없이 그 시점의 하한을 그대로 쓴다 // 글자마다 상위와 하위로 최악 두 노드가 든다 // 256 이상 문자는 재배치한 상위 심볼과 하위 바이트 두 심볼로 나누며 상위 심볼은 c를 8비트 오른쪽으로 민 값에 256을 더한 값이고 경로가 충돌하지 않는 것은 문자 검사와 base 유일성 그리고 상위 뒤에는 하위 자식만 온다는 위상 분리가 보장한다 // 같은 needle인 중복 리터럴은 리터럴 depth를 세어 chain의 depth 게이트 아이템으로 흡수하며 중복 항목과 그 종단은 rest로 함께 센다 // 체인의 6비트 level 천장 63을 넘는 깊이는 편입하지 않고 flags 비트1로 회수하며 첫 등록의 직발화는 천장 밖이다
				for (let w = 0, node; w < lanes; w += 3) { const label = frame[forms + w], form = frame[forms + w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF; if (bottomChars || !topChars) continue; if (nodes + topChars * 2 > budget - links - rest - load) { flags |= 8; continue; } const blocks = form & 0x3F, depth = frame[forms + w + 2] & 0x3F, index = label >>> 9, bottomStar = (label & 0x2) !== 0; node = 0; const path = prefix[index]; for (let i = 0; i < topChars; i++) node = put(node, path.charCodeAt(i)); const payload = frame[node * 3 + 2]; if (blocks) { const extra = payload > 0 && (!table || (table[node * 2] === undefined && !table[node * 2 + 1])) ? 1 : 0; const head = reserve(w, extra); if (head < 0) { flags |= 8; continue; } frame[chain + links] = (bottomStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else frame[chain + links] = (bottomStar ? 0x80000000 : 0) | (index << 6) | depth; frame[link + links] = payload < 0 ? ~payload : ((table && table[node * 2]) || 0); const head = links++; if (payload > 0) { if (!table) table = {}; if (table[node * 2] === undefined && !table[node * 2 + 1]) rest++; table[node * 2] = head; } else frame[node * 3 + 2] = ~head; } // 탑 고정 닻을 정방향 가지에 넣는다 // 미드가 있으면 미드 블록을 탑 기준 오름차순 verify 레코드로 만들고 체인에는 redirect 비트 아이템을 넣으며 이때 게이트는 부호와 depth이고 payload는 레코드 head다 // 미드가 없으면 payload가 index인 단순 발화 아이템을 넣는다 // 공존 노드의 종단은 table 짝 키 최초 등록에서 rest로 세며 홀 키의 중복이 이미 센 노드는 건너뛴다
				let hook = 0; if (bottoms) { const band = 1; hook = nodes++; frame[hook * 3 + 1] = (band << 23) | (frame[0] & 0x7FFFFF); frame[0] = hook; if (band > span) span = band; } // 거울 가지를 거는 자리로 hook의 심볼 band는 거울 가지 입구 심볼이며 좌표 어휘 32 초과와 분해 상위 심볼 256 이상 어느 쪽도 닿지 않는 제어 대역 상수 1이라 정방향 자식과 겹치지 않고 스트림 워크에 누수가 없다
				for (let w = 0, node; w < lanes; w += 3) { const label = frame[forms + w], form = frame[forms + w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF; if (!bottomChars) continue; if (nodes + bottomChars * 2 > budget - links - rest - load) { flags |= 8; continue; } const blocks = form & 0x3F, depth = frame[forms + w + 2] & 0x3F, index = label >>> 9, topStar = (label & 0x1) !== 0; node = hook; const path = prefix[index], low = path.length - bottomChars; for (let i = bottomChars - 1; i >= 0; i--) node = put(node, path.charCodeAt(low + i)); if (topChars || blocks) { const head = reserve(w, 0); if (head < 0) { flags |= 8; continue; } frame[chain + links] = (topStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else { frame[chain + links] = (topStar ? 0x80000000 : 0) | (index << 6) | depth; } const payload = frame[node * 3 + 2]; frame[link + links] = payload < 0 ? ~payload : 0; frame[node * 3 + 2] = ~links; links++; } // 바텀 고정 닻을 글자 역순으로 거울 가지에 넣는다 // 탑이나 미드 블록이 있으면 키 내림차순 verify 레코드로 만드는데 형식은 index를 9비트 왼쪽으로 민 값에 프리펜드 표지 비트6과 blocks를 더한 헤더와 탑 닻이 있으면 그것을 length 13비트로 담는 프리펜드 전용 첫 블록과 target 6비트와 첫 글자 16비트와 length 10비트를 담은 미드 블록들과 둘째 글자부터 둘씩 묶은 글자 워드들이며 미드 블록은 정방향과 같은 문법이다 // 체인에는 redirect 비트 아이템을 넣고 탑과 미드가 없으면 단순 발화 아이템을 넣는다 // 거울 서브트리에는 리터럴 종단이 있을 수 없는데 리터럴은 hook를 거치지 않고 루트에서 삽입하며 band는 제어 대역이고 분해 심볼은 257 이상이라 겹치지 않기 때문이다 // payload는 0 아니면 head를 비트 반전한 음수뿐이라 정방향의 table 짝 키 분기가 필요 없고 무조건 반전값을 기록한다
				const items = links - 1 + rest, split = 4 + words + (mids << 2) + items, trie = split + (load > 1 ? load : 0) + (mids ? body : 0), limit = 0x7FFFFE - trie, range = limit + span + 2, capacity = span + 1 + ((nodes * 2 * (limit + 1) / (nodes * 2 + limit + 1)) | 0), pad = items && span < 63 ? 64 : span + 1; // capacity는 시작 폭 힌트다 // 수용은 성장 정리가 보증하므로 이 값은 정확성과 무관한 성능 파라미터다 // 성장 정리는 이렇다 // 후보 하나를 기각하는 원천이 base 표지 n개와 자식 오프셋별 슬롯 점유 2n개뿐이라 first-fit은 최대 갈래 k 기준 n + (k+1)·2n 안에서 반드시 자리를 찾고 성장은 usage에 range와 usage의 차를 range로 나눈 여유분을 더해 한 번에 필요폭을 덮으므로 재진입 없이 끝난다 // usage가 range에 멀면 여유분이 usage에 가까워 폭이 약 2배로 벌고 range에 가까우면 여유분이 0에 수렴해 정확폭이 되니 reserve가 닫은 trie 23비트 이하에서 usage는 range 이하이고 성장 결과는 usage 이상 range 이하라 표현 가능한 배치는 필요폭을 확보하고 표현 밖 배치는 비트8로 미등록된다 // 따라서 성장은 보험이 아니라 종료가 증명된 수요 추종 할당이다 // limit은 표현 천장 0x7FFFFF에서 역산한 배치 상한으로 base 더하기 trie 더하기 1이 23비트를 넘을 노드는 할당과 기록 전에 비트8로 불발하고 grid를 0으로 눕혀 미배치로 남긴다 // 표현 못 할 노드가 배치 전에 걸러져 방출에는 23비트 검사가 없으며 방출은 base 0을 미배치 표지로 읽어 노드와 전이를 조용히 건너뛴다 // 미배치 노드의 자식은 배치될 수 있으나 루트 워크가 닿지 못해 죽은 공간으로만 남는다
				let reach = capacity, roots = capacity + nodes, grid = new Int32Array(capacity + nodes + pad); // grid는 배치 격자 한 장이다 // 0번지부터 슬롯 장부가 살아 프로브가 무오프셋이고 장부 경계 reach 바로 뒤부터 노드 base들이 roots부터 심볼 체인 머리가 살며 배치가 끝나 죽은 roots 자리는 bins가 재사용한다 // reach가 장부 유효 폭이고 부족하면 usage에 여유분을 더한 폭으로 장부를 늘려 뒤 구역을 copyWithin으로 이사시킨다 // 점유와 base 표지는 장부 워드의 상위 두 비트에 산다 // 비트30이 점유이고 비트31이 base라 base 검사가 부호 판정 하나이며 값부 하위 30비트가 다음 비점유 후보인데 슬롯 인덱스는 성장 뒤에도 30비트를 넘지 못한다 // 장부가 한 스트림이라 프로브가 한 배열만 읽는다 // 프로브가 닿는 최소 주소가 trie라 장부는 trie 원점의 상대 공간이며 절대값은 base 기록과 peak 갱신에서만 만든다 // 노드 하나가 만지는 최대 주소가 base 더하기 span 더하기 1이라 기록 직전 검사 하나가 base와 종단과 전이 검문을 전부 흡수하고 리프는 f 하나로 같다 // grid 항목은 f 너머의 빈 슬롯으로 건너뛰는 경로 분할이다 // 슬롯은 단조 증가로만 쓰이므로 건너뛰기 구간이 영원히 유효하고 빈 슬롯을 건너뛰지 않는다
				let peak = trie - 1; for (let s = 0; s < nodes; s++) { const e = frame[s * 3]; if (!e) continue; const symbol = frame[e * 3 + 1] >>> 23; grid[reach + s] = grid[roots + symbol]; grid[roots + symbol] = s + 1; } // peak 바닥을 trie-1로 두어 배치가 전멸해도 길이가 레인 존과 본문과 카운트B를 덮는다 // 배치 순서를 심볼 큰 것부터로 잡는다 // roots는 심볼별 노드 체인 머리 전용 구역이며 폭은 span+1이다 // 링크는 reach 뒤 base 구역에 임시로 저장하는데 배치 전에는 비어 있는 자리라 배치가 s를 처리하며 base 값으로 덮어쓰고 next를 먼저 읽으므로 충돌이 없다 // 머리와 next를 s+1로 담아 0으로 채운 값을 빈 칸으로 읽으니 grid 장부의 lazy 0필 관습과 통일되고 노드 인덱스는 항상 s+1이라 1 이상이라 0과 겹치지 않는다 // 별도의 -1 초기화 루프가 없다
				for (let symbol = span; symbol >= 0; symbol--) for (let h = grid[roots + symbol], next; h !== 0; h = next) { const s = h - 1; next = grid[reach + s]; const branch = frame[s * 3], word = frame[branch * 3 + 1], step = (word >>> 23) + 1, full = frame[s * 3 + 2] !== 0; let b; outer: for (let f = step; ; f++) { while (f < reach && grid[f] & 0x40000000) { const q = (grid[f] & 0x3FFFFFFF) || f + 1; if (q < reach && grid[q] & 0x40000000) grid[f] = (grid[f] & 0xC0000000) | ((grid[q] & 0x3FFFFFFF) || q + 1); f = q; } b = f - step; if (grid[b] < 0) continue; if (full && grid[b + 1] & 0x40000000) continue; for (let e = word & 0x7FFFFF; e; ) { const w = frame[e * 3 + 1]; if (grid[b + (w >>> 23) + 1] & 0x40000000) continue outer; e = w & 0x7FFFFF; } break; } if (b > limit) { flags |= 8; grid[reach + s] = 0; continue; } if (b + span + 1 >= reach) { const mark = reach, usage = b + span + 2; reach = usage + ((usage * (range - usage) / range) | 0); const space = new Int32Array(reach + nodes + pad); space.set(grid); space.copyWithin(reach, mark, mark + nodes + pad); space.fill(0, mark, reach); roots = reach + nodes; grid = space; } grid[reach + s] = b + trie; grid[b] |= 0x80000000; if (full) { const slot = b + 1; grid[slot] |= 0x40000000; if (slot + trie > peak) peak = slot + trie; } for (let e = branch; e; ) { const w = frame[e * 3 + 1], t = b + (w >>> 23) + 1; grid[t] |= 0x40000000; if (t + trie > peak) peak = t + trie; e = w & 0x7FFFFF; } }
				for (let s = 0; s < nodes; s++) { if (frame[s * 3] !== 0 || frame[s * 3 + 2] === 0) continue; let f = 1; for (;;) { while (f < reach && grid[f] & 0x40000000) { const q = (grid[f] & 0x3FFFFFFF) || f + 1; if (q < reach && grid[q] & 0x40000000) grid[f] = (grid[f] & 0xC0000000) | ((grid[q] & 0x3FFFFFFF) || q + 1); f = q; } if (grid[f - 1] >= 0) break; f++; } const b = f - 1; if (b > limit) { flags |= 8; continue; } if (f >= reach) { const mark = reach, usage = f + 1; reach = usage + ((usage * (range - usage) / range) | 0); const space = new Int32Array(reach + nodes + pad); space.set(grid); space.copyWithin(reach, mark, mark + nodes + pad); space.fill(0, mark, reach); roots = reach + nodes; grid = space; } grid[reach + s] = b + trie; grid[b] |= 0x80000000; grid[f] |= 0x40000000; if (f + trie > peak) peak = f + trie; } // 이 패스는 자식 없는 리프 종단에 기록용 base를 배치한다 // 리프 최대 주소가 f라 기록 직전 검사 하나가 base와 기록 칸을 함께 덮는다 // 지점별 길이 검사는 이어지는 기록의 경계 증명이라 하중을 진다 // 자식이 없어도 기록 한 칸 즉 base+1은 갖는다 // base 등록은 의무다 // base 유일성이 다른 노드의 기록을 잘못 읽는 것을 막는 방어선이기 때문이다
				let tail = split - items; if (items) grid.fill(0, roots, roots + 64); image = new Int32Array(peak + 2); slide = trie - body; // 프리픽스 하나가 실행 이미지 하나다 // 모든 구역 크기가 이 자리에서 확정되므로 배열을 한 번만 잡고 뷰도 래퍼도 없다 // 앞에서부터 루트 둘과 편승 words와 카운트A와 레인 폭 셀과 레인 4워드들이 차고 그 뒤 꼬리 items개가 이어지며 verify가 있으면 그 뒤 split부터 load개가 레인이 있으면 그 뒤 slide부터 슬라이드 본문 body개가 이어지고 그 뒤가 트라이이고 마지막 셀이 카운트B다 // peak가 곧 최대 슬롯이라 전체가 peak 더하기 2 크기이고 카운트B가 peak 더하기 1에 앉는다 // 레인 존은 카운트A 바로 뒤 고정 자리라 핫이 맨 앞에서 확정된 words로 경계 저장 없이 진입한다 // 꼬리를 트라이 앞에 두는 것이 이 배열의 안전 계약이다 // 실패한 전이 로드 주소는 base와 c의 합이고 c가 0 이상이라 앞으로만 가는데 모든 base가 꼬리 뒤에서 시작하므로 꼬리에는 닿지 못한다 // 트라이 안 착지는 base 유일성이 심볼을 소유권 증명으로 만들어 안전하고 트라이 너머는 카운트B의 공백 심볼이나 범위 밖 0 정규화로 죽는다 // 블록 자리는 typed 0필이 채우므로 선채움 루프가 없다 // 어휘 밖 스트림 문자는 raw와 상위 심볼과 하위 바이트 모든 갈래에서 범위 밖 읽기가 undefined가 되는데 0으로 OR 하는 연산이 이를 빈 셀 0으로 정규화한다 // body가 0이면 본문 구역이 없으며 이는 verify 구역과 레인 존의 조건 존재와 같은 관습이다
				for (let s = 0; s < nodes; s++) { const base = grid[reach + s]; if (!base) continue; const payload = frame[s * 3 + 2], terminal = payload > 0 ? payload : 0, depth = terminal >>> 24, repeat = (table && table[s * 2 + 1]) || 0; let h = payload < 0 ? ~payload : ((table && table[s * 2]) || 0); if (h || repeat) { const offset = tail; let min = 63, max = 0, total = 0; if (terminal) { grid[roots + depth]++; total++; if (depth < min) min = depth; if (depth > max) max = depth; } for (let e = h; e; e = frame[link + e]) { const d = frame[chain + e] & 0x3F; grid[roots + d]++; total++; if (d < min) min = d; if (d > max) max = d; } for (let r = repeat; r; r = notes[r]) { grid[roots + depth]++; total++; } for (let d = min + 1; d <= max; d++) grid[roots + d] += grid[roots + d - 1]; for (let r = repeat; r; r = notes[r]) image[offset + --grid[roots + depth]] = (notes[r - 1] << 6) | depth; for (; h; h = frame[link + h]) { const word = frame[chain + h]; image[offset + --grid[roots + (word & 0x3F)]] = word & 0x20000000 ? (word & ~0x1FFFFFC0) | ((((word >>> 6) & 0x7FFFFF) + split) << 6) : word; } if (terminal) image[offset + --grid[roots + depth]] = (((terminal & 0xFFFFFF) - 1) << 6) | depth; for (let d = min; d <= max; d++) grid[roots + d] = 0; tail += total; image[tail - 1] |= 0x40000000; image[base + 1] = (offset << 9) | 0x20; } else if (terminal) image[base + 1] = (terminal & 0xFFFFFF) << 9; for (let e = frame[s * 3]; e; ) { const w = frame[e * 3 + 1], symbol = w >>> 23, child = grid[reach + e] + 1; if (child > 1) image[base + symbol + 1] = (child << 9) | symbol; e = w & 0x7FFFFF; } } // 종단 기록은 주소가 image[base+1] 하나이며 이는 c가 0인 자식 자리라 로드가 한 번이다 // 심볼이 태그 역할을 한다 // 0x20은 체인 시작을 9비트 왼쪽으로 민 값에 0x20을 더한 것으로 꼬리 절대 오프셋 23비트이며 태그는 와일드 진영이다 // 대표 리터럴이 함께 있어도 태그는 하나다 // 경계 워크의 발화 술어가 리다이렉트 비트를 요구해 리터럴 아이템을 자연 기각하므로 건너뛰기 표지가 필요 없고 종단 워크는 depth 일치로 정상 발화한다 // 태그 32는 좌표를 끝내는 공백이라 실패한 전이가 이 자리를 자식으로 오인하지 못한다 // status 자리는 종단이 있을 때만 예약하므로 종단 없는 노드의 그 자리에는 다른 노드의 전이가 들어올 수 있고 그래서 태그는 0x20 하나와 정확히 비교하며 단일 리터럴도 심볼이 0인지 본 뒤에 발화한다 // 0은 단일 리터럴로 index+1을 9비트 왼쪽으로 밀어 바로 발화하며 index+1은 23비트라 가족 천장에서 1을 뺀 값이고 실효 한계는 trie 슬롯이다 // 좌표 어휘가 32를 넘으므로 종단의 0과 태그의 32 모두 전이가 가질 수 없는 값이라 빈 칸이나 다른 노드가 차지한 자리와 심볼 비교로 구별하고 다른 기록과는 base 유일성으로 겹치지 않는다 // 공존 노드는 대표 리터럴이 체인 첫 아이템으로 레벨이 가장 작다 // 경계 워크는 리다이렉트만 발화하므로 리터럴 아이템은 술어에서 기각되고 종단 워크만 depth 일치로 발화하며 종단에서 전체가 일치하면 게이트가 항상 참이다 // 블록은 depth 64버킷으로 안정 분배하는데 동률이면 리터럴 다음 와일드 등록순 다음 중복 등록순이며 역순으로 훑으며 감소 배치하면 안정성이 생기고 앞에 붙인 체인의 자연스러운 워크가 역등록순이라 그 요구 순서와 맞아 꼬리에 바로 배치하며 모든 블록이 결정적 O(k)다 // bins는 64칸으로 depth 키 공간이며 체인이나 중복이 있을 때만 만드는데 크기가 아니라 존재 여부에 따른 조건이고 건드린 깊이 구간만 다시 0으로 되돌린다 // 중복은 정의상 같은 노드에 같은 depth의 리터럴 종단이 먼저 있으므로 중복 목록 생성 조건이 payload가 0보다 큰 경우이며 터미널이 이미 그 depth로 min과 max를 덮으니 repeat는 bins와 total에만 기여하고 depth도 terminal에서 읽으므로 따로 저장하지 않는다 // 발화 규칙은 범위 바깥에서 안쪽으로이며 좌표가 탑부터 읽히는 순서다 // 워크는 레벨이 depth보다 커지면 조기 탈출하며 남은 것은 전부 발화할 수 없다
				let mirror = hook && grid[reach + hook] ? grid[reach + hook] + 1 : 0, root = grid[reach] ? grid[reach] + 1 : 0; image[0] = (root << 9) | (tops ? 0x1 : 0); image[1] = mirror << 9; image[2 + words] = ((arena - drop + tops) << 9) | 0x20; image[image.length - 1] = (bottoms << 9) | 0x20; // image의 0번은 탑 정방향이고 1번은 바텀 역방향 즉 mirror로 흐른다 // ONE 가지 카운트는 앞 셀과 마지막 셀로 이뤄지는데 앞 셀은 2+words 자리라 베이스가 그 뒤에서 시작해 전이가 닿지 못하고 마지막 셀은 좌표를 끝내는 공백 심볼을 품어 전이가 자식으로 오인하지 못한다 // 기입식 카운트는 23비트를 9비트 왼쪽으로 민 뒤 0x20을 더한 형태로 심볼 32는 좌표를 끝내는 문자라 워크가 그 값으로 조회하지 못해 카운트 셀을 잘못 읽는 일이 구조적으로 없고 체인 워크는 종단 플래그를 만나 그 앞에서 멈춘다 // 레이아웃은 루트 두 셀 다음 fire-once 전방 편승 셀 ceil(count/32)개 다음 방벽인 카운트A 다음 레인 폭 셀 다음 레인 4워드들 다음 체인 꼬리 다음 verify 구역 다음 슬라이드 본문 다음 표 다음 카운트B 순이다 // 자식 없는 루트나 문은 0으로 눕혀 전멸 빌드에서 워크가 서지 않는다 // 편승 셀은 베이스 하한 아래라 실행되지 않는 전이가 닿지 못하므로 독약이 필요 없다 // 카운트 셀 주소는 카운트A가 2+words이고 카운트B가 image.length-1로 고정이다
				if (load > 1) { image[split] = 0x42454154; let fill = split + 1; for (let side = 0; side < 2; side++) for (let w = 0; w < lanes; w += 3) { const label = frame[forms + w], form = frame[forms + w + 1], bottomChars = (form >>> 6) & 0x1FFF; if (!(label & 0x4) || (bottomChars ? !side : side)) continue; const index = label >>> 9, topChars = form >>> 19, place = frame[forms + w + 2], mark = place >>> 6, blocks = form & 0x3F, origin = bottomChars ? (place & 0x3F) - 1 : -1, front = bottomChars && topChars ? 1 : 0, total = front + blocks, path = prefix[index]; let segment = topChars ? 1 : 0; for (let i = 1; i < topChars; i++) if (path.charCodeAt(i) === 45) segment++; const seed = segment, post = (label & 0x1) + (topChars ? topChars + 1 : 0); let q = post; image[fill++] = (index << 9) | (front << 6) | total; if (front) image[fill++] = (path.charCodeAt(0) << 13) | topChars; let unit = mark; for (let m = 0; m < blocks; m++) { const block = (notes[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; image[fill++] = ((origin < 0 ? target : origin - target) << 26) | (path.charCodeAt(q) << 10) | length; q += length; } if (front) for (let i = 1; i < topChars; i += 2) image[fill++] = path.charCodeAt(i) | (i + 1 < topChars ? path.charCodeAt(i + 1) << 16 : 0); unit = mark; segment = seed; q = post; for (let m = 0; m < blocks; m++) { const block = (notes[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; for (let i = 1; i < length; i += 2) image[fill++] = path.charCodeAt(q + i) | (i + 1 < length ? path.charCodeAt(q + i + 1) << 16 : 0); q += length; } } } // 예약 셀 값은 BEAT의 ASCII이고 인덱스 0은 워크에서 참조하지 않는다 // 팩은 닻 하이픈을 세어 미드 스캔 시작 세그를 얻고 블록 위치를 항등식 체인으로 유도하므로 arena에 위치 저장이 없다 // verify는 체인과 표 사이의 비전이 구역 split에 살며 배치 후보가 step에서 시작해 모든 base가 trie 원점 이상이라 전이가 verify를 밟지 못한다 // 트라이가 load만큼 밀리므로 budget이 load를 함께 회수하며 이는 이미지의 전 구역이 한 천장을 나누는 계약이다 // redirect payload는 파스 때 split이 미확정이라 방출 시점에 split을 더해 절대화한다 // 이 절대 주소는 검사 없이도 23비트가 증명된다 // 니들마다 예산 검사가 load를 선차감하므로 마지막 성공 니들에서 split 더하기 head가 links와 rest와 load의 합에 상수 여유를 더한 값 이하이고 그 합이 budget 부등식으로 0x7FFFFD를 넘지 못하며 교차 니들은 자기 예산 검사에서 먼저 회수된다 // 중복 리터럴은 notes의 빈 중간 지대에 인덱스와 이전 머리의 연결 쌍으로 살며 쌍 둘에 리터럴 하나라 와일드 수 곱 3 더하기 리터럴 수 더하기 중복 쌍 수 곱 2가 3paths를 넘지 못해 거울 꼭대기와 충돌하지 않는다 // 머리는 1을 더해 저장해 0이 없음이다 // 레인 앵커의 탑 쪽 세그는 전부 비어 있어 앵커 위치가 별 비트 더하기 topGap 그 자체다 // 팩을 마무리하는 단계로 거울 루트는 base+1을 9비트 왼쪽으로 민 값이며 하위 9비트는 예약이고 단순 체인과 확장 체인을 image 꼬리에 직접 적재하며 오프셋은 꼬리 절대 오프셋이고 체인 아이템이 없으면 꼬리 영역이 없다 // 순수 리터럴은 심볼이 0이라 바로 발화하므로 체인에 접근하지 않고 0x20이 가리키는 블록은 꼬리에 직접 적재되므로 트라이 영역과 겹칠 수 없다 // 워크 전이 주소는 base 더하기 c다 // 9와 23 비트로 팩하며 검증은 전이 심볼 9비트와 base 23비트이고 base 유일성 덕에 t와 심볼 쌍이 부모를 유일하게 결정한다 // 종단 기록은 image[base+1] 한 주소이며 심볼이 태그라 0x20은 체인이고 0은 단일 직발화이며 전멸 블록은 첫 아이템의 레벨이 depth보다 클 때 조기 종료한다 // 발화 순서 계약은 이렇다 // 레코드는 스트림 등장순이고 한 좌표의 다중 발화는 depth 오름차순으로 범위 바깥에서 안쪽으로이며 동률이면 리터럴 다음 와일드 등록순 다음 중복 등록순이다 // IN은 레코드 등장순이고 같은 레코드의 다중 발화는 리터럴이 먼저이고 이어서 와일드 군집 등록순이다 // ONE은 그 열의 니들별 첫 발화만 모은 부분열이고 전원 해소되면 즉시 종료하며 모드 간 순서는 설계상 서로 다르다 // chain은 6과 23 비트로 나뉘어 depth 게이트는 패턴 깊이 63이고 payload 23비트는 verify head나 index다 // label은 index를 9비트 왼쪽으로 민 값에 hash를 2비트 왼쪽으로 민 값과 별 플래그를 더한 것이고 record는 index를 9비트 왼쪽으로 민 값에 프리펜드 표지 비트6과 blocks 6비트를 더한 것으로 9와 23 비트에 정렬된다 // 시스템 한계는 23비트 가족인 chain payload와 base라 명목상 838만이고 실효 한계는 trie 크기인데 프리픽스 곱하기 니들 글자가 838만 슬롯 이하로 묶인다
			} }
			if (!image && (flags || mids)) { slide = 4 + words + (mids << 2); image = new Int32Array(slide + 1 + body); image[2 + words] = ((arena - drop + tops) << 9) | 0x20; image[image.length - 1] = (bottoms << 9) | 0x20; } // 레인이나 flags가 서면 최소 이미지가 항상 서고 카운트 두 셀은 트라이 형상과 같은 자리에 같은 형식으로 기입해 budget 생략으로 트라이가 없어도 회수 니들 계수가 남아 ONE 완주 계약이 유지된다 // 레이아웃 문법은 트라이 형상과 같아 루트 둘과 편승 words와 카운트A와 레인 폭 셀과 레인 존과 본문과 카운트B 순이며 두 카운트 셀 자리가 불변이며 레인이 없으면 body도 0이라 크기식과 slide가 조건 없이 한 꼴이다
			if (mids) { image[3 + words] = mids << 2; let fill = slide, d = 4 + words; for (let w = 0, stop = d + (mids << 2); w < lanes && d < stop; w += 3) { const form = frame[forms + w + 1]; if (form >>> 6) continue; const label = frame[forms + w], place = frame[forms + w + 2], mark = place >>> 6, depth = place & 0x3F, path = prefix[label >>> 9]; let block = (notes[arena + (mark >> 1)] >>> ((mark & 1) << 4)) & 0xFFFF; const midChars = block & 0x3FF, topGap = block >> 10, rest = (form & 0x3F) - 1, post = (label & 0x1) + topGap; image[d] = (path.charCodeAt(post) << 16) | path.charCodeAt(post + midChars - 1); image[d + 2] = (fill << 9) | depth; image[d + 3] = (midChars << 22) | (rest << 6) | topGap; let i = 1; for (; i + 1 < midChars - 1; i += 2) image[fill++] = path.charCodeAt(post + i) | path.charCodeAt(post + i + 1) << 16; if (i < midChars - 1) image[fill++] = path.charCodeAt(post + i); let unit = mark + 1, segment = topGap, q = post + midChars; for (let b = 0; b < rest; b++) { block = (notes[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF; unit++; const target = block >> 10, length = block & 0x3FF; q += target - segment; segment = target; image[fill++] = (path.charCodeAt(q) << 16) | block; let j = 1; for (; j + 1 < length; j += 2) image[fill++] = path.charCodeAt(q + j) | path.charCodeAt(q + j + 1) << 16; if (j < length) image[fill++] = path.charCodeAt(q + j); q += length; } const bottomGap = depth - 1 - segment; image[d + 1] = (label & ~0x1FF) | (bottomGap << 3) | (label & 0x3); d += 4; } } if (flags) { image[0] |= flags << 5; } // flags가 서면 운반체가 보장되어 판독은 전 형상에서 image[0] 하나다 // 편승 스크래치와 레인 존은 언제나 이미지가 소유한다 // 레인이 있으면 최소 이미지가 항상 서기 때문이다 // 최소 이미지 할당이 위 레인 루프보다 앞에 서야 하며 루프가 레인 폭 셀과 레인 존과 본문에 바로 쓴다
			if (!image) image = BEAT.EMPTY; BEAT.CACHE.set(prefix, image); // 캐시 값은 래퍼 없는 단일 실행 이미지 Int32Array 하나이며 이것이 외부 계약이다 // 산물이 전무하면 공유 빈 이미지를 캐시해 재빌드가 없다 // 레인 존은 미드 닻을 네 레인으로 압축한 것으로 forms에서 미드 레인을 걸러 만들며 순서는 군집순이라 트라이 진영의 동률 계약과 같고 미드가 없으면 레인 폭 셀이 0이라 슬라이드 루프에 들어가지 않는다 // 레인0은 first와 last다 // 레인1은 상위부터 index와 bottomGap과 별 플래그이며 비트2는 예약이다 // open은 bottomStar와 bottomGap 0에서 파생한다 // 레인2는 상위부터 inner와 빈 세 비트와 depth다 // 레인3은 상위부터 midChars와 예약 열 비트와 rest와 topGap이다 // 슬라이드 본문은 image 비전이 구역에 정박한 앵커 중간 글자 2팩과 미드 블록 워드들이다 // 두 패스 직접 적재로 첫 패스가 앵커 중간 글자와 미드 블록의 헤더와 글자를 세어 body와 생존 mids를 확정하고 둘째 패스가 정확 자리 본문과 레인 존에 바로 쓴다 // 주소 천장은 선측정의 커밋 전 판정 한 겹이다 // 레인 시작의 절대 주소가 23비트를 넘으면 그 레인부터 끊고 비트8을 기록하며 초과 후 재입장이 없어 절단과 동치다 // 마지막 커밋 검사가 최종 레인 수 기준의 시작 상한을 봉인하고 앞 레인은 body 단조로 따라오므로 팩되는 전 레인 fill이 23비트 이하가 항등이라 그 판정이 곧 fill의 23비트 증명이고 트라이 동거 형상은 budget 양수 게이트 안에서만 서고 그때 fill의 끝이 trie와 같아 23비트 이하가 증명되므로 둘째 패스에는 검사가 없다 // 언팩 산술 오프셋은 천장 계약 밖이며 이는 트라이의 base 산술 접근과 같은 계약이다 // fill은 본문 쓰기 커서로 레인 시작 fill이 곧 s2의 시작 주소다 // 트라이 와일드 글자는 image에 있고 앵커의 첫 글자와 끝 글자는 s0의 first와 last에 있으므로 본문에는 핫 경로가 읽는 앵커 중간 글자와 미드 블록 워드만 담는다 // inner는 image 안에서 중간 글자가 시작하는 절대 오프셋이며 중간 글자가 미드 블록 바로 앞에 깔린다 // 핫 미드 디코드 오프셋은 inner에 중간 2팩 워드 수를 더한 값이고 그 지점부터 블록 워드가 이어지는데 블록 워드는 상위 16비트 첫 글자와 target 6비트와 length 10비트다 // 세그 시작은 topGap이며 arena의 미드 헤더 상위 비트에서 읽어 얻고 이는 미드 닻의 앵커가 하나 이상일 때다 // 슬라이드 메타인 midChars와 topGap과 bottomGap과 inner는 arena 미드 헤더에서 나오고 first와 last는 원본 path에서 나오며 forms는 세 레인이다 // s2 하위 6비트는 depth 그대로라 핫 길이 게이트가 덧셈 없이 소비한다 // 카운트는 6비트라 깊이가 63 이하다 // forms는 빌드 로컬이라 캐시에 담지 않는다
		}
		const top = image[0], gate = top & 0x1, lane = 4 + words; // 경계 계산은 모드가 가른다 // ALL은 경계를 레코드 머리에서 한 번 미리 계산해 전 레코드를 발화하고 IN과 ONE은 발화 시점에 필요할 때 계산해 매칭되지 않은 것은 건너뛴다 // find 메모는 ks 단조 증가가 유효성을 보증하는 방식으로 공유한다 // ke와 vs와 ve는 find와 경계 계산 전 ve가 보관한 레코드 끝으로 멱등하게 정해진다 // 캐시가 항상 이미지 배열이라 널 검사가 없고 lane은 맨 앞에서 확정된 words에 상수를 더해 유도한 레인 존 시작이라 경계 저장이 없다
		let left = 0, topAlive = 0, bottomAlive = 0, midAlive = 0, topWalk = top >>> 9, bottomWalk = image[1] >>> 9, midWalk = lane + (image[lane - 1] | 0), bits = null, start = -2, end = -1; // midWalk는 레인 폭 셀을 더한 레인 존 끝 경계이며 폭이 레인 수를 2비트 왼쪽으로 민 워드 수라 시프트 없이 더하고 빈 이미지의 범위 밖 읽기는 0으로 정규화되어 레인 존이 없다 // left와 세 Alive와 bits와 start와 end가 ONE 전용 로컬이며 ALL과 IN 경로는 건드리지 않는다 // fire-once 비트는 이미지 앞쪽 스크래치에 새 객체 없이 얹으므로 상주가 늘어나는 것은 편승 ceil(count/32)셀뿐이다 // 비트맵 오프셋은 전 경로에서 상수 2다 // 표지는 정방향 루트 비트1 하나다 // 형상이 이미지 하나이기 때문이다
			if (one) { topAlive = image[lane - 2] >>> 9; bottomAlive = image[image.length - 1] >>> 9; midAlive = (midWalk - lane) >> 2; left = topAlive + bottomAlive + midAlive; if (!left) return; bits = image; if ((top & 0x2) === 0) { bits.fill(0, 2, 2 + words); image[0] = top | 0x2; } else bits = new Int32Array(2 + words); if ((topAlive || bottomAlive) && !(top & 0x100)) start = -1; } // ONE은 콜마다 여기서 진영 계수와 fire-once 비트맵을 준비한다 // fire-once 비트는 문턱 없이 균일하게 앞쪽에 얹힌다 // words가 image[2]부터 트라이 앞에 상주하고 베이스 할당이 그 뒤에서 시작하므로 전이 로드 주소 base 더하기 c가 c 0 이상이라 산술적으로 닿을 수 없어 독약이 필요 없다 // 셀 하나에 니들 32개를 꽉 담으며 마스크는 1을 index만큼 왼쪽으로 민 것이고 JS 시프트 카운트가 5비트로 잘려 32로 나눈 나머지가 자동으로 되므로 접점이 전부 단일식이고 분기가 없다 // 비트맵 오프셋은 전 경로에서 상수 2다 // 표지는 정방향 루트 비트1로 클레임하며 top이 복원용 스냅숏이다 // 중첩 재진입 콜만 콜마다 할당으로 낮추며 폴백 배열도 앞 두 칸을 비워 오프셋이 전 경로에서 상수 2이고 정확성은 그대로이고 해제는 finally 한 지점에서 비트를 끄므로 콜백이 예외를 던져도 새지 않는다 // left 초기값은 방벽 카운트A와 꼬리 카운트B와 슬라이드 레인 도출값을 더한 것이다 // 카운트A와 B는 빌드 분류 순회 중에 함께 적산한 가지 등록 수이고 슬라이드 레인은 midWalk 폭을 2비트 오른쪽으로 민 값이라 레인 폭 셀 재독이 없다 // 슬라이드 전용 이미지는 탑과 바텀 카운트가 구조상 0이라 left가 레인 몫으로만 이뤄진다 // ONE의 콜드 빌드와 캐시는 ALL 및 IN과 같은 규격이다 // 재진입은 표지 비트가 감지해 중첩 콜을 자기만의 독립 비트맵으로 낮추므로 같은 프리픽스로 재귀해도 안전하다 // 니들 사망 처리는 아래 탑 전환 스윕이 맡아 전환 순간 프리픽스를 직접 끈다 // 포화 비트8이 선 이미지는 스윕을 켜지 않는데 비트8 계열 중 chars 절단만 니들을 계수 없이 미빌드로 남겨 스윕이 그 니들을 읽고 생존 진영의 계수를 대신 감산할 수 있기 때문이며 스윕이 꺼져도 실제 매처의 매칭과 발화와 발화 감산은 그대로라 절단은 단순 불발과 니블 기록으로 끝난다 // 다른 비트8 회수는 계수가 남아 스윕이 안전하지만 표지가 니블 하나뿐이라 함께 꺼지며 그 형상은 조기 종료 최적화만 보수적으로 포기한다 // 사망은 발화 순서를 바꾸지 못하고 left만 앞당긴다 // words는 맨 앞의 단일 클램프 count 기준이라 카운트 자리와 편승 비트맵 범위가 캐시 레이아웃과 일치하고 P가 int32에 접혀도 음수가 되지 않으며 스윕 상한도 같은 count라 P 클램프 결정이 콜당 한 번이고 스윕 비교가 하나다
			try { let p = beat.indexOf(M); while (p !== -1) { if (p === 0 || beat.charCodeAt(p - 1) <= 32) break; p = beat.indexOf(M, p + 1); } // 값 안에 박힌 M을 건너뛰고 첫 레코드를 찾는다
		while (p !== -1) { // 메인 루프는 모든 레코드를 한 번 훑는다 // ALL은 미매칭도 index를 -1로 발화하고 IN은 매칭만 발화하며 ONE은 니들당 첫 매칭만 콜백하고 전원 해소되면 그 자리에서 종료한다
			ms = p + 1; me = beat.indexOf(' ', ms); if (me === -1) break;
			p = beat.indexOf(M, me + 1); while (p !== -1 && beat.charCodeAt(p - 1) > 32) p = beat.indexOf(M, p + 1);
			ve = p === -1 ? beat.length : p - 1; // 값 끝을 미리 계산하는데 다음 메타 탐색이 p에 먼저 서 있어 매치 전에 확정되고 커서의 현 레코드 소비가 ms 파생에서 끝났으므로 별도 변수 없이 p가 곧 다음 레코드 머리다 // ve가 경계 계산 전까지 레코드 끝을 보관하며 find가 ve보다 작으면 콜론 뒤에 값이 있는 것이고 아니면 키만 있는 것이라 스캔 없이 산술로 정하고 경계 계산이 레코드당 최대 한 번이라 원래 끝을 다시 요구하는 경로가 없다
				if (!match) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } // ALL은 전 레코드를 발화하므로 경계를 레코드마다 머리에서 한 번 계산하고 IN과 ONE은 발화 시점에 필요할 때 계산한다 // 경계 계약은 이렇다 // ks는 항상 me+1이고 콜론이 있으면 즉 find가 ve보다 작으면 ke가 find이고 vs와 ve가 콜론 뒤 값이며 없으면 ke가 레코드 끝이고 vs와 ve가 -1이다 // 콜론 없는 맨 단어는 노드 이름이 곧 키라 키만 있고 값은 서브트리다 // ks를 먼저 확정해 me+1 계산이 한 곳이고 여덟 발화 경로가 같은 꼴이다 // 발화 꼬리는 접지 않는다 // hit 표지 덕에 경계 계산은 레코드당 한 번이라 글자만의 중복이고 갈래마다 인라인된 직선 코드가 합류점과 값 합류를 피하는 성능 자산이기 때문이다
			let hit = false, depth = 0; // 레코드 깊이는 처음 필요할 때 한 번만 구하며 발화 게이트들이 공유한다 // 경계는 find 메모가 ks 단조 증가로 스스로를 보호하므로 별도 플래그가 필요 없고 레코드마다 indexOf가 최대 한 번임이 보장된다
			if (start > -2) { e: { const length = end - start; if (start >= 0) { let k = 0; while (k < length && beat.charCodeAt(start + k) === beat.charCodeAt(ms + k)) k++; if (k === length && (ms + length === me || beat.charCodeAt(ms + length) === 45)) break e; } let cut = ms; while (cut < me && beat.charCodeAt(cut) !== 45) cut++; if (start >= 0) { const lead = beat.charCodeAt(start); for (let i = 0; i < count; i++) { if ((bits[2 + (i >> 5)] & 1 << i) !== 0) continue; const needle = prefix[i]; if (!needle) continue; const first = needle.charCodeAt(0); if (first === 42 || first === 45 || first !== lead) continue; const width = needle.length; if (width < length) continue; let k = 1; while (k < length && needle.charCodeAt(k) === beat.charCodeAt(start + k)) k++; if (k < length) continue; const c = length < width ? needle.charCodeAt(length) : 0; if (c !== 0 && c !== 45 && !(c === 42 && length === width - 1)) continue; bits[2 + (i >> 5)] |= 1 << i; const last = needle.charCodeAt(width - 1); let gap = 0; if (last !== 42 && last !== 45) for (let g = length + 1; g < width; g++) if (needle.charCodeAt(g) === 45 && needle.charCodeAt(g - 1) === 45) { gap = 1; break; } if (gap) { if (!--bottomAlive) bottomWalk = 0; } else if (!--topAlive) topWalk = 0; if (--left === 0) return; } } start = ms; end = cut; } } // ONE 탑 전환 스윕으로 탑이 바뀌면 떠난 탑의 고정 탑 니들을 한꺼번에 소등한다 // DFS 불변식상 닫힌 서브트리는 다시 등장하지 않으며 단일 트리 DFS를 계약으로 하고 여러 프레임은 프레임 단위로 호출한다 // 전환 순간 프리픽스를 직접 훑으므로 비용은 전환 횟수 곱하기 P다 // 포맷의 정상 지형인 트리형 DFS에서는 전환이 탑 수만큼이라 작지만 모든 레코드가 서로 다른 탑인 퇴화된 평탄 스트림에서는 전환이 레코드 수만큼이라 레코드 곱하기 P로 자란다 // 별도 상주 장부 없이 전환할 때 prefix를 순회하며 상태는 편승 fire-once 셀과 start 메모뿐이라 캐시된 matcher 배열은 수정하지 않는다 // 비트8이 없는 스윕 활성 형상에서는 스윕이 소등하는 대상 집합이 파스가 계수한 집합과 같아 안전선이 일치한다 // 같은 탑이면 cut 선스캔과 메모 갱신 없이 직전 탑 텍스트와 바로 대조하는 한 루프로 짧게 끝낸다 // beat가 바뀌지 않아 start와 end 메모가 그대로 유효하고 종결은 ms+length가 me이거나 하이픈일 때이며 ALL과 IN은 start를 -2 표지로 두어 막는다 // 탑이 바뀔 때만 cut 스캔과 스윕과 메모 갱신을 한다 // 대상은 고정 첫 글자로 가리는데 탑이 고정이면 첫 문자가 고정이라는 따름정리이며 고정 첫 글자는 전부 등록되어 있어 거부되는 니들이 없다 // 가지 구분은 원문 술어로 한다 // 바텀이 별도 아니고 하이픈도 아니면서 빈 세그를 가지면 거울이다 // 사망은 발화 순서를 바꾸지 못하고 left만 앞당기는데 죽는 니들은 그 탑 없이는 발화할 수 없기 때문이다 // 이미 발화한 니들은 fire-once 비트 선게이트로 건너뛰므로 두 번 감소하는 일이 없다 // 니들마다 첫 글자 선게이트를 먼저 보아 떠난 탑 첫 글자와 다르면 즉시 건너뛰고 전체 비교는 첫 글자가 일치한 후보만 한다 // 니들의 탑이 떠난 탑과 같은지는 경계 문자 하나로 판정하는데 탑은 하이픈을 포함하지 않아 앞이 일치하면 그 뒤 글자가 하이픈이거나 문자열 끝이거나 끝 별인 것과 같다 // 가지 구분은 사망이 확정된 니들에 한해 한 번만 하며 탑 이후 구간을 charCodeAt 쌍으로 훑어 빈 세그를 직접 찾는다 // 니들의 탑이 곧 떠난 탑 텍스트라 하이픈이 없으므로 빈 세그는 그 바텀 쪽에만 있을 수 있다 // lead는 떠난 탑의 첫 유닛을 제어 의존 뒤에서 한 번 읽는다
			if (topWalk) { let base = topWalk, fit = true, layer = 0; for (let j = ms, c, cell, page; j < me; j++) { c = beat.charCodeAt(j); if (gate && c === 45) { layer++; const status = image[base] | 0; if ((status & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = layer + 1; for (let g = j + 1; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item & 0x20000000) { if (item < 0 || depth === level) { const head = item >>> 6 & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) v: { let cursor = head + 1 + blocks, q = j + 1, segment = layer; for (let i = 0; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment < target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment++; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== (block >>> 10 & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --topAlive || (topWalk = 0), --left === 0)) return; } } } else if (item < 0 || depth === level) { const index = item >>> 6 & 0x7FFFFF; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --topAlive || (topWalk = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } } if (c < 256) { cell = image[base + c] | 0; if ((cell & 0x1FF) !== c) { fit = false; break; } base = cell >>> 9; } else { cell = image[base + (page = (c >> 8) + 256)] | 0; if ((cell & 0x1FF) !== page) { fit = false; break; } base = cell >>> 9; cell = image[base + (c & 0xFF)] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) { fit = false; break; } base = cell >>> 9; } } if (fit) { const status = image[base] | 0, tag = status & 0x1FF; if (tag === 0x20) { let h = status >>> 9; if (!depth) { if (gate) depth = layer + 1; else { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if ((item < 0 || depth === level) && !(item & 0x20000000)) { const index = item >>> 6 & 0x7FFFFF; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --topAlive || (topWalk = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } else if (tag === 0 && status) { const index = (status >>> 9) - 1; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --topAlive || (topWalk = 0), --left === 0)) return; } } } } // 정방향 워크는 융화된 trie를 탑 루트에서 걷는다 // 하위 바이트 로드도 0으로 OR 하는데 크기를 peak+2로 딱 맞췄기에 어휘 밖 하위 바이트는 범위를 벗어날 수 있는데 그 범위 밖 읽기의 undefined를 0으로 OR 하는 연산이 빈 셀 0으로 정규화한다 // 리터럴은 종단에서 탑 고정은 세그 경계마다 게이트로 판정한다 // 루트 셀 하위 9비트는 전이 표적이 아니다 // 전이 주소 base 더하기 c가 앞쪽 스크래치 너머 베이스 하한 이상이라 빈 자리이므로 체인 유무를 싣는다 // 종단 depth는 게이트가 있으면 워크가 센 layer로 바로 정하고 게이트가 0인 중복 리터럴 체인은 하이픈 스캔으로 보정한다 // 경계 체인은 redirect를 먼저 판정한다
			if (bottomWalk && me > ms) { let base = bottomWalk; for (let j = me - 1, c = beat.charCodeAt(j), low = 0, cell, page, status; ; j--, c = low) { if (c < 256) { cell = image[base + c] | 0; if ((cell & 0x1FF) !== c) break; base = cell >>> 9; } else { cell = image[base + (page = (c >> 8) + 256)] | 0; if ((cell & 0x1FF) !== page) break; base = cell >>> 9; cell = image[base + (c & 0xFF)] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) break; base = cell >>> 9; } if ((j === ms || (low = beat.charCodeAt(j - 1)) === 45) && ((status = image[base] | 0) & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item < 0 || depth === level) { if (item & 0x20000000) { const head = item >>> 6 & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) v: { let cursor = head + 1 + blocks, q = ms, segment = depth - 1; if (record & 0x40) { const block = image[head + 1], length = block & 0x1FFF; if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== (block >>> 13 & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } for (let i = record >>> 6 & 1; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment > target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment--; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== (block >>> 10 & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomWalk = 0), --left === 0)) return; } } else { const index = item >>> 6 & 0x7FFFFF; if (!one || (bits[2 + (index >> 5)] & 1 << index) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomWalk = 0), --left === 0)) return; } } } if (item & 0x40000000) break; h++; } while (true); } if (j === ms) break; } } // 거울 가지는 같은 trie를 image[1]의 거울 루트에서 거꾸로 걷는다 // ONE 상태로 건드리는 것은 편승 fire-once 셀과 bottomAlive 감소뿐이며 탑 경계에 닿은 바텀 고정만 발화한다 // 바텀 복합은 정방향과 같은 문법의 redirect 비트 아이템으로 체인에 합류하며 검증 커서만 거꾸로라 q가 ms이고 segment가 depth-1이다 // 프리펜드 표지가 선 레코드는 첫 블록을 전용 형식으로 먼저 검증하는데 자리가 탑에 고정이라 target 이동 없이 q가 ms 그대로이고 length는 하위 13비트 첫 글자는 그 위 16비트이며 글자 워드 소비는 미드 블록과 같아 cursor만 글자 워드 수만큼 전진한다 // 일반 루프는 record 비트6을 시작 인덱스로 재해석해 표지가 서면 미드 블록부터 돌고 없으면 기존 그대로 전 블록을 돈다 // 체인은 게이트를 먼저 보므로 깊은 반복에서 게이트가 실패하면 redirect 검사를 건너뛴다 // 경계 검사가 읽은 j 앞 글자를 다음 반복의 c로 승계해 글자당 문자열 로드가 한 번이며 정방향이 손에 든 c로 발화를 트리거하는 것과 대칭이다 // 빈 키 레코드는 진입 가드 me 초과 판정이 걸러 파이프라인의 첫 로드가 범위를 벗어나지 않는다
			for (let w = lane; w < midWalk; w += 4) { // 미드 닻 매처인 슬라이드로 탑 고정과 바텀 고정은 정방향과 거울 두 trie가 이미 발화했고 여기는 탑과 바텀이 열려 topChars와 bottomChars가 모두 0이라 미드 고정만 슬라이드로 처리한다 // 미드 닻은 네 레인이다 // 오프셋은 inner에 중간 2팩 워드 수를 더한 값인데 그 수가 midChars에서 1을 뺀 값을 1비트 오른쪽으로 민 항등이라 저장 없이 유도하고 세그 시작은 topGap에서 파생하며 카운트는 6비트로 뽑는다
				let fit = false; const s0 = image[w], s1 = image[w + 1], s2 = image[w + 2], s3 = image[w + 3], first = s0 >>> 16, last = s0 & 0xFFFF, midChars = s3 >>> 22, inner = s2 >>> 9; // 첫 고정 앵커를 잡고 미드에서 바텀 쪽으로 세그를 이어 한 방향으로 걷는다
					if (one) { const index = s1 >>> 9; if ((bits[2 + (index >> 5)] & 1 << index) !== 0) continue; } if (((s2 & 0x3F) << 1) - 1 > me - ms) continue; // ONE에서는 이미 해소된 레인은 앵커 슬라이딩 자체를 건너뛰며 ALL과 IN은 one 분기 하나로 막는다 // 길이 게이트로 레코드 글자 수가 2 곱하기 depth 빼기 1 즉 비어 있지 않은 세그의 최소 폭보다 작으면 매칭이 불가능하므로 닻 스캔 전에 길이로 거절한다 // 패턴 깊이는 s2 하위 6비트 그대로라 덧셈 없이 읽는다 // 이는 topStar 접기의 깊이 부등식 즉 레코드 깊이가 패턴 깊이보다 작다는 조건을 모든 레인으로 일반화한 것이다
				let topStar = (s1 & 0x1) !== 0, bottomStar = (s1 & 0x2) !== 0, topGap = s3 & 0x3F, q = ms; if (topStar && !bottomStar) { if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } const height = depth + topGap - (s2 & 0x3F); if (height < topGap) q = me; else { topGap = height; topStar = false; } } // 별의 바텀 쪽이 전부 고정 폭이면 앵커 자리가 깊이로 유일하게 정해지므로 슬라이드를 한 자리로 접는다
				if (!topStar) for (let g = 0; g < topGap; g++) { while (q < me && beat.charCodeAt(q) !== 45) q++; q++; } // 탑이 고정이거나 자리가 유일하면 첫 고정 앵커의 탑 쪽 topGap개 세그를 건너뛴 한 자리에서만 앵커를 맞춘다
				for (let topSide = 0; q + midChars <= me; q++) {
					if (q > ms) { if (beat.charCodeAt(q - 1) === 45) topSide++; else continue; } // 세그 경계에서만 앵커를 시도하며 지나온 조상 수를 누적한다
					const stop = q + midChars; v: { if (beat.charCodeAt(q) !== first || beat.charCodeAt(stop - 1) !== last) break v; let k = 1; for (; k + 1 < midChars - 1; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== image[inner + (k >> 1)]) break v; if (k < midChars - 1 && beat.charCodeAt(q + k) !== (image[inner + (k >> 1)] & 0xFFFF)) break v; // 첫 글자와 끝 글자는 s0의 first와 last로 비교하고 중간만 본문을 읽는데 첫 글자가 안 맞으면 OR 단락으로 본문을 읽지 않는다 // 글자가 하나면 첫이 곧 끝이라 끝 비교가 자기 비교로 통과하므로 midChars 가드가 필요 없고 탈락하면 v로 빠져 이후 break 판정에 합류한다
					if (stop < me && beat.charCodeAt(stop) !== 45) break v;
					if (!topStar || topSide >= topGap) { // 탑이 별이면 조상이 topGap 이상이어야 한다
						const bottomGap = (s1 >>> 3) & 0x3F; let e = stop, segment = s3 & 0x3F, offset = inner + ((midChars - 1) >> 1); for (let i = 0, rest = (s3 >>> 6) & 0x3F; i < rest; i++) { const block = image[offset], target = (block >>> 10) & 0x3F, length = block & 0x3FF, cursor = offset + 1; while (segment < target) { while (e < me && beat.charCodeAt(e) !== 45) e++; e++; segment++; } const next = e + length; if (next > me || (next < me && beat.charCodeAt(next) !== 45) || beat.charCodeAt(e) !== block >>> 16) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(e + k) | beat.charCodeAt(e + k + 1) << 16) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(e + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; e = next; segment = target; offset = cursor + (length >> 1); } // 오프셋은 inner에 중간 2팩 워드 수인 midChars 빼기 1을 1비트 오른쪽으로 민 값을 더한 것이며 고정된 중간 2팩 뒤가 남은 미드 블록 워드다 // 글자가 하나면 중간이 없어 그 값이 0이라 inner가 곧 미드 시작이다 // 블록 워드의 상위 16비트 첫 글자로 선거절하고 나머지 글자를 2팩으로 비교하며 탈락하면 필터와 같은 합류점인 v로 빠진다
						if (bottomStar && bottomGap === 0) fit = true; else { let bottomSide = 0; for (let j = e; j < me; j++) if (beat.charCodeAt(j) === 45) bottomSide++; fit = bottomStar ? bottomSide >= bottomGap : bottomSide === bottomGap; } // 바텀 여백은 별이면 bottomGap 이상이어야 하고 아니면 정확히 bottomGap이어야 한다
					} }
					if (fit || !topStar) break; // 탑이 고정이면 한 자리만 보고 탑이 별이면 맞을 때까지 슬라이드한다
				}
				if (fit) { const index = s1 >>> 9; if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[2 + (index >> 5)] |= 1 << index, --midAlive || (midWalk = 0), --left === 0)) return; } // 발화 자리에 ONE 재검사가 없는 것은 레인 선게이트가 비트 0을 이미 증명했고 선게이트와 발화 사이에 콜백과 bits 쓰기가 없기 때문이다 // 스윕은 레코드 머리에서만 돌고 슬라이드 니들은 첫 글자가 별이나 하이픈이라 스윕 대상이 아니다 // ALL과 IN은 원래 게이트 없이 통과하던 경로다
			}
			if (!match && !hit) { if (on(beat, ms, me, ks, ke, vs, ve, -1) === false) return; }
		} } finally { if (bits === image) image[0] = top; }
	}
};



const A = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 1; // ONE 모드는 니들당 첫 매칭을 한 번만 하고 전원 해소되는 순간 스캔이 그 자리에서 끝난다
BEAT.read(stream, A, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE가 1이면 니들별 첫 매칭 레코드만 여기로 흐르고 전부 해소되면 read가 즉시 종료된다

	switch (index) {
		case 0:
			// 콜백이 곧 실행부라 데이터를 만들지 않고 Events와 Writes와 Reads가 하나로 흐른다
			break;
		case 1:
			// 3--3-1-1 와일드카드 레코드가 파싱 없이 이 실행부로 흐르고 첫 매칭이 한 번만 오므로 캐시가 그대로 확정된다
			// cache.speed = [beat, vs, ve];
			break;
	}
});



const B = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 0; // IN 모드는 매칭된 프리픽스 레코드만 콜백 안으로 들여보낸다
BEAT.read(stream, B, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE가 0이면 매칭된 프리픽스 레코드만 여기로 흐르고 스캔은 끝까지 완주한다

	switch (index) {
		case 0:
			// 콜백이 곧 실행부라 데이터를 만들지 않고 Events와 Writes와 Reads가 하나로 흐른다
			break;
		case 1:
			// 3--3-1-1 와일드카드의 모든 매칭 레코드가 파싱 없이 이 실행부로 흐르며 필요하면 값 범위를 그대로 캐시할 수 있고 매 발화가 캐시를 갱신한다
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

BEAT.MODE = -1; // ALL 모드는 추가 패스 없이 단 한 번의 스캔으로 N개의 논리적 레이어를 동시에 처리한다 // 하나의 콜백 안에서 데이터의 거시적 흐름과 미시적 정보를 함께 다룰 수 있다
BEAT.read(stream, C, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE가 -1이면 모든 레코드가 여기로 흐르고 미매칭 레코드는 index가 -1로 발화한다

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

	// every record flows here

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
