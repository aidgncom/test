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
	META: '_', VALUE: ':', MODE: -1, CACHE: new WeakMap(), EMPTY: new Int32Array(0), // META는 위상좌표의 시작점이며 VALUE는 키와 값의 경계이다 // MODE는 발화 방식을 결정하며 -1이 ALL이고 0이 IN이며 1이 ONE을 의미한다 // 모든 모드의 핫패스는 Events ~ Writes ~ Reads가 하나로 흐르는 제로 얼로케이션 스캔이다 // CACHE에 상주하는 산물은 Int32Array 실행 이미지 단 한 장이며 클램프도 콜 맨 앞의 한 줄이 유일해 모든 사실이 한 곳에서 결정된다 // EMPTY는 산물이 없는 좌표 배열들이 공유하는 빈 이미지이며 같은 배열의 다음 콜은 빌드 없이 바로 스캔한다 // 길이가 0이어도 판독이 전부 비트 연산이라 범위 밖 undefined가 0으로 읽혀 그대로 유효하다 // 즉 비트는 빈 상태를 저장 없이 표현한다
	read(beat, coordinates, callback) { // beat는 META로 구분된 레코드들이 이어지는 원문 스트림이다 // coordinates는 찾을 좌표 문자열의 배열이며 같은 배열 객체가 같은 캐시를 가리킨다 // 좌표는 하이픈으로 세그를 나눈 패턴이고 별과 빈 세그가 와일드다 // 매칭 결과를 콜백으로 알리는 것이 발화다 // callback은 발화마다 부르는 함수로 beat와 레코드 경계 ms me와 키 ks ke와 값 vs ve와 좌표 index를 받고 false를 반환하면 스캔이 멈춘다
		const M = BEAT.META, V = BEAT.VALUE, mode = BEAT.MODE | 0, match = mode >= 0, one = mode > 0; // mode는 콜 시작에 읽은 MODE 값이라 스캔 중에 MODE를 바꿔도 이번 콜은 처음 읽은 값으로 끝까지 동작한다 // match는 매칭만 발화하는 IN과 ONE의 공통 표지이고 one은 ONE 전용 표지다 // 세 모드는 같은 메인 스캔을 공유한다
		let image;
		const over = coordinates.length > 0x7FFFFF, count = over ? 0x7FFFFF : coordinates.length, words = (count + 31) >> 5; // 콜드와 핫은 같은 count와 words를 공유한다 // count는 유효 반복 상한이고 over는 P를 넘었다는 기록이다 // 빈 좌표 배열은 count가 0이고 P를 넘으면 count가 천장값이라 빈 판정은 count 하나로 충분하다 // words는 ONE이 이미지 앞쪽에 얹어 쓰는 편승 비트맵의 워드 수이며 count 기준이라 등록 가능 범위만 덮고 극단 길이에서도 음수가 되지 않는다
		if (count === 0) { if (match) return; image = BEAT.EMPTY; } // 좌표 배열이 비면 IN과 ONE은 발화 없이 반환하고 ALL은 공유 빈 이미지로 메인 루프에 합류해 전 레코드를 -1로 발화한다
		else if (!(image = BEAT.CACHE.get(coordinates))) { // 좌표 배열은 처음 한 번만 등록한다 // 리터럴과 탑 고정은 정방향 trie에 바텀 고정은 거울 가지에 넣고 탑과 바텀이 열린 미드는 슬라이드 레인으로 넣는다
			let bulk = 0, paths = 0; for (let i = 0; i < count; i++) { const path = coordinates[i]; if (path) { paths++; bulk += path.length; } } bulk += paths; // 등록에 앞서 길이만 한 바퀴 읽어 상한을 확정하므로 등록 중에 배열을 늘리거나 넘침을 검사할 일이 없다 // bulk는 글자 수와 좌표 수를 합해 실측한 값이라 arena가 수요 그대로 잡힌다 // 세그마다 글자 하나 이상에 하이픈 하나라 유닛 수가 bulk의 절반 이하이고 워드당 2유닛 팩이 항상 담긴다
			const arena = paths * 2, registry = new Int32Array(arena + Math.ceil(bulk / 4)); // notes는 등록 기록 한 장이다 // 바닥에서 와일드 레인이 자라고 리터럴은 arena 경계에서 두 칸씩 거꾸로 자라며 arena부터는 미드 헤더가 한 워드에 두 유닛씩 팩된다 // 와일드와 리터럴의 등록 레인은 좌표당 두 워드로 같아 마주 자라도 합이 2paths를 넘지 못해 충돌하지 않는다 // arena는 실측 bulk로 잡아 모자라지 않고 길이 천장을 넘은 세그는 등록에서 끊겨 기입되지 않으므로 헤더 값은 전부 65535 이하다 // 상주하는 것은 산물뿐이고 스크래치는 상주하지 않는다
			let flags = over ? 8 : 0, costs = 1, lanes = 0, drop = arena, tops = 0, bottoms = 0, lost = 0; // costs의 초기 1은 루트 몫이고 mirror 몫은 bottoms 확정 뒤에 더한다 // 포화 니블은 천장을 넘은 사실을 기록한다 // 값 1은 와일드 깊이와 중복 체인 편입 깊이 63의 초과이고 값 2는 앵커 8191의 초과이며 값 4는 세그 1023의 초과이고 값 8은 좌표 수 상한과 트라이와 verify 예산과 체인 주소와 배치 천장이 속한 23비트 가족의 초과다 // 천장 밖으로 회수된 좌표와 편입되지 못한 중복분은 조용히 불발하고 이 니블만이 흔적이다 // flags가 기록되면 image가 반드시 만들어지므로 판독 자리가 사라지지 않는다 // 판독은 image[0]을 5비트 밀어 하위 4비트를 읽는다 // lost는 계수에 들었으나 산물을 잃은 좌표 수다 // 등록 결산은 인덱스를 registry 여백에 쌓고 감사는 다 쓴 스크래치에 표시하며 꼬리 기입이 그 셋을 읽어 손실 목록을 만든다 // 직접 종단의 index+1은 23비트이고 중복 머리의 registry 주소는 24비트에 차서 비트30 표지와 겹치지 않는다 // 접수 표지는 리터럴이 레인0의 비트23이고 와일드가 registry 레인0의 비트2이며 종단과 체인 기입이 끝난 뒤에 기록된다 // tops와 bottoms는 가지 등록 수로 등록 뒤 감산이 없다
			for (let i = 0, path, wild, cost; i < count; i++) {
				path = coordinates[i]; if (!path) continue;
				const topStar = path.charCodeAt(0) === 42;
				let low = 0, high = path.length; if (topStar) { low = 1; if (low >= high) continue; } // 탑에 별이 있으면 문자열을 자르지 않고 low 오프셋만 옮겨 범위로 처리한다
				const first = path.charCodeAt(low), last = path.charCodeAt(high - 1); wild = topStar || first === 45 || last === 45 || last === 42; if (!wild) { cost = first < 256 ? 1 : 2; for (let n = low + 1, back = first; n < high; n++) { const c = path.charCodeAt(n); cost += c < 256 ? 1 : 2; if (c === 45 && back === 45) { wild = true; break; } back = c; } } // 탑이나 바텀의 별과 하이픈과 빈 세그 중 하나라도 있으면 와일드다 // 직전 글자는 이전 반복의 c를 back으로 승계해 글자당 로드가 한 번이다
				if (wild) {
					const bottomStar = last === 42; if (bottomStar) { high--; if (low >= high) continue; } // 바텀에 별이 있으면 high 오프셋을 줄인다
					let depth = 1; for (let n = low; n < high; n++) if (path.charCodeAt(n) === 45) depth++; // 세그 수는 하이픈 수에 1을 더한 값이다
					let topChars = 0, topDepth = 0; if (!topStar && first !== 45) for (let j = low; ;) { while (j < high && path.charCodeAt(j) !== 45) j++; topDepth++; if (j === high || j + 1 === high || path.charCodeAt(j + 1) === 45) { topChars = j - low; break; } j++; } // 고정 글자 구간을 닻이라 부른다 // topChars는 탑에서 이어지는 연속 고정 닻의 문자 길이이며 내부 하이픈을 포함한다
					let bottomChars = 0, bottomDepth = 0; if (!bottomStar && last !== 45) for (let j = high - 1; ;) { while (j >= low && path.charCodeAt(j) !== 45) j--; bottomDepth++; if (j === low - 1 || j === low || path.charCodeAt(j - 1) === 45) { bottomChars = high - 1 - j; break; } j--; } // bottomChars는 바텀에서 이어지는 연속 고정 닻의 문자 길이이며 거꾸로 세고 내부 하이픈을 포함한다 // 닻 글자는 원본 path가 단일 진실이라 arena에 싣지 않고 소비자가 path를 직접 읽는다
					const stop = depth - bottomDepth;
					let blocks = 0, flag = 0; for (let n = topDepth, cursor = low + (topChars ? topChars + 1 : 0); n < stop; n++) { let length = 0; while (cursor + length < high && path.charCodeAt(cursor + length) !== 45) length++; if (length) { if (length > 0x3FF) { flag |= 4; break; } blocks++; } cursor += length + 1; } // 미드 고정 세그를 path에서 바로 스캔하며 세그 인덱스 n을 함께 센다 // 위치는 저장하지 않고 소비자가 이전 위치와 길이와 타깃 차의 항등식으로 유도한다 // 초과 세그는 그 자리에서 끊어 넘친 헤더가 생기지 않는다 // 각 세그는 n을 10비트 밀고 length를 더한 한 유닛으로 arena에 담긴다 // 등록 스캔은 천장 판정과 계수 전용이고 기입은 등록 뒤의 둘째 순회가 한다
					if (!topChars && !bottomChars && !blocks && !flag) continue; // 좌표에는 고정 세그가 적어도 하나는 있어야 한다 // flag가 선 좌표는 arena가 비어도 문법 거부가 아니라 회수 결산으로 보낸다 // 별과 하이픈만으로는 아무 자리도 가리킬 수 없으므로 등록하지 않는다
					if (depth > 0x3F) flag |= 1; if (topChars > 0x1FFF || bottomChars > 0x1FFF) flag |= 2; if (flag) { flags |= flag; if (topChars) { if (bottomChars) bottoms++; else tops++; registry[registry.length - ++lost] = i + 1; } continue; } // 천장을 넘은 좌표를 회수할 때 되돌리는 작업이 없다 // 등록은 계수 전용이고 blocks는 좌표 로컬이라 되돌릴 기록이 없다 // flag는 좌표의 천장 니블로 각 판정이 자기 비트를 세우고 회수가 flags에 합친다 // 회수 인덱스는 1을 더해 registry 맨 끝에서 거꾸로 쌓고 0이 스택의 끝이다 // topChars가 1 이상인 회수 좌표는 진영 계수에 남겨 ONE의 탑 전환 스윕이 감산하는 수가 계수를 넘지 않게 하고 자유 탑은 스윕 면제라 계수에 넣지 않는다
					costs += (bottomChars ? bottomChars : topChars) << 1; // 대표 닻은 글자를 읽지 않고 길이의 두 배만 costs에 더하며 글자당 노드가 두 개를 넘지 않아 이 값이 상계다
					registry[lanes] = (i << 9) | (depth << 3) | (topStar ? 0x1 : 0) | (bottomStar ? 0x2 : 0); registry[lanes + 1] = (topChars << 19) | (bottomChars << 6) | blocks; lanes += 2; // 와일드 메타는 등록 때부터 최종 소비 형식인 두 레인 팩 그대로 만들어진다 // 레인0은 index와 depth와 별 플래그이고 레인1은 topChars와 bottomChars와 blocks다 // 전 패스가 이 팩을 그대로 소비하며 미드 유닛 위치는 러닝 커서가 blocks 합으로 재생한다
					if (bottomChars) bottoms++; else if (topChars) tops++; // 좌표는 닻이 붙은 위치에 따라 세 경로로 분류한다 // 바텀 고정은 거울 가지로 가서 탑 블록까지 흡수하고 탑 고정은 정방향 가지로 가서 미드까지 흡수하며 미드 고정만 슬라이드로 보낸다 // 일반적인 계층 구조에서는 fan-out이 누적되는 바텀 쪽이 엔트로피가 더 높아 바텀을 대표 닻으로 잡는다
				} else { drop -= 2; registry[drop] = i; costs += cost; } // 리터럴 확정 시에만 cost를 커밋하므로 와일드로 판명된 좌표의 누적은 버려진다
			} if (bottoms) costs++; // 바텀 진영이 있으면 거울 루트 한 자리가 비용에 든다
			
			let body = 0, mids = 0; for (let w = 0, unit = 0; w < lanes; w += 2) { const label = registry[w], form = registry[w + 1], blocks = form & 0x3F; let need = blocks; if (!need) continue; const path = coordinates[label >>> 9], topChars = form >>> 19, low = label & 0x1 ? 1 : 0, high = path.length - (label & 0x2 ? 1 : 0); let n = topChars ? 1 : 0; for (let i = low, e = low + topChars; i < e; i++) if (path.charCodeAt(i) === 45) n++; let cursor = low + (topChars ? topChars + 1 : 0); for (; need; n++) { let length = 0; while (cursor + length < high && path.charCodeAt(cursor + length) !== 45) length++; if (length) { const slot = arena + (unit >> 1), shift = (unit & 1) << 4; registry[slot] = (registry[slot] & ~(0xFFFF << shift)) | (((n << 10) | length) << shift); unit++; need--; } cursor += length + 1; } if ((form >>> 6) === 0) { let u = unit - blocks; const midChars = (registry[arena + (u >> 1)] >>> ((u & 1) << 4)) & 0x3FF; let gain = (midChars - 1) >> 1; while (++u < unit) gain += 1 + (((registry[arena + (u >> 1)] >>> ((u & 1) << 4)) & 0x3FF) >> 1); body += gain; mids++; } } // 등록 스캔은 미드 헤더를 세기만 하고 arena에 쓰지는 않는다 // 둘째 순회가 좌표를 한 번 더 돌며 그 헤더를 소비 순서 그대로 arena에 잇대어 써 넣는다 // 세그 위치 n은 탑 닻의 하이픈을 다시 세어 시작하고 등록이 센 blocks가 소진되면 끝난다 // 슬라이드 크기를 트라이보다 먼저 재는 것은 배열을 한 번에 잡으려면 모든 크기가 먼저 필요하기 때문이다 // 탑과 바텀이 모두 열린 레인만 방금 쓴 arena 구간을 읽어 body와 mids를 확정한다 // body는 앵커 중간 글자 2팩과 블록당 헤더 한 워드와 나머지 글자 2팩의 합이다 // notes는 등록부터 이미지 기입까지 이어지는 단일 와일드 원장이다 // 순서는 전부 등록순이라 따로 정렬하지 않는다
			if (drop < arena || tops || bottoms) { // budget이 바닥나도 별도 분기가 없다 // 등록 지점의 선행 검사가 좌표 단위로 회수하고 감사가 결산한다 // 선행 검사는 미드가 선점한 mids와 body를 되돌리지 않으므로 극단에서 limit이 음수일 수 있고 그때는 전 노드가 미배치라 감사가 전원을 결산한다 // 한 trie가 정방향 가지와 거울 가지를 함께 담아 레코드마다 양쪽에서 한 번씩 순회한다
				const wilds = lanes / 2, budget = 0x7FFFFB - words - mids * 3 - body, width = 1 + tops + bottoms, chain = (costs < 0x800000 ? costs : 0x800000) * 3, link = chain + width, marks = link + width, topology = new Int32Array(marks + wilds); // 예산은 budget 한 곳에서 결정된다 // budget은 고정 확정된 words와 레인 구역과 body를 미리 뺀 값이고 links와 rest와 load는 자라는 값이라 검사식이 그때그때 뺀다 // 트라이가 앞쪽 영역 뒤에서 시작하므로 꼬리와 verify가 자라는 만큼 예산이 준다 // 유실을 접수 표지를 내리는 방식으로 합치지 않는 것은 예약이 이미 선 레인을 이미지 기입이 반드시 채워야 후속 head 누적이 어긋나지 않기 때문이다
				let rest = 0, load = 1, links = 1, nodes = 1, span = 0; // frame은 트라이 노드와 체인을 세우는 빌드 전용 임시 배열 한 장이다 // 트라이 노드가 stride 3으로 이어지고 chain과 link 레인이 width 폭으로 이어지며 marks부터 감사 표지 장부가 이어진다 // 노드의 0번 칸은 첫 자식이고 1번 칸은 심볼과 형제 링크이며 2번 칸은 payload다 // payload는 직접 리터럴 양수와 중복 머리 비트30과 와일드 체인 반전 음수의 세 상태이며 단조로만 전이한다 // 전이 때 직전 payload는 registry 둘째 칸이나 link 칸에 반전 봉인되고 최종 이미지를 써 내는 방출이 복원한다 // 루트가 0번이라 자식이 0일 수 없으므로 0으로 채워진 초기 상태가 곧 빈 트리다 // load는 verify의 누적 크기로 측정만으로 확정된다 // rest는 꼬리 셀 중 체인 밖 리터럴 몫이다
				const put = (node, c) => { let e, child; if (c >= 256) { const page = (c >> 8) + 256; if (page > span) span = page; child = 0; const head = topology[node * 3]; for (e = head; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === page) { child = e; break; } e = w & 0x7FFFFF; } if (!child) { child = nodes++; topology[child * 3 + 1] = (page << 23) | head; topology[node * 3] = child; } node = child; c &= 0xFF; } if (c > span) span = c; child = 0; const head = topology[node * 3]; for (e = head; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === c) { child = e; break; } e = w & 0x7FFFFF; } if (!child) { child = nodes++; topology[child * 3 + 1] = (c << 23) | head; topology[node * 3] = child; } return child; }; // put은 조회 겸 생성으로 자식 열에서 심볼을 찾고 없으면 새 노드를 형제 머리에 붙인다 // 256 이상 문자는 상위 심볼과 하위 바이트 두 심볼로 나눈다
				const reserve = (w, extra, mark) => { const form = registry[w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF, blocks = form & 0x3F, front = bottomChars && topChars ? 1 : 0; const head = load; let next = load + 1 + blocks + (front ? 1 + (topChars >> 1) : 0); for (let m = 0, unit = mark; m < blocks; m++, unit++) next += (((registry[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0x3FF) >> 1); if (next + links + 1 + rest + extra > budget + 2) return -2; load = next; return head; }; // reserve는 내용 없이 크기만 재 자리를 예약하고 head를 확정한다 // 내용은 팩 마무리의 둘째 패스가 registry 순서대로 verify에 쓴다 // 천장 판정은 커밋 후 총량이 budget+2를 넘으면 회수한다 // chain 워드는 별 부호와 redirect 비트와 payload와 depth로 이뤄지고 depth를 하위 6비트에 둔 것은 가장 자주 읽는 값이기 때문이다 // 블록은 target 6비트와 첫 글자 16비트와 length 10비트다 // 글자는 charCodeAt 유닛 기준이다 // 거울 verify 앞에 덧붙는 탑 닻 전용 블록이 프리펜드다 // 프리펜드 첫 블록만 target 없이 length 13비트를 쓰며 표지는 head의 비트6이다 // 첫 글자를 실어 두면 첫 비교를 로드 없이 하고 글자 스트림은 둘째 글자부터 둘씩 묶는다
				for (let g = arena - 2, path, length, node; g >= drop; g -= 2) { path = coordinates[registry[g]]; length = path.length; if (nodes + length * 2 > budget - links - rest - load) { flags |= 8; continue; } let depth = 1; node = 0; for (let i = 0; i < length; i++) { const c = path.charCodeAt(i); node = put(node, c); if (c === 45) depth++; } const slot = node * 3 + 2, payload = topology[slot]; if (payload > 0) { if (depth > 0x3F) { flags |= 1; continue; } const e = payload & 0x40000000 ? payload & 0xFFFFFF : 0; if (!e) rest++; registry[g + 1] = e || ~payload; topology[slot] = 0x40000000 | ((depth & 0x3F) << 24) | (g + 1); rest++; } else topology[slot] = ((depth & 0x3F) << 24) | (registry[g] + 1); registry[g] |= 0x800000; } // 리터럴은 글자마다 노드가 최대 두 개 들어 길이의 두 배가 비용 상계다 // 같은 좌표의 중복 리터럴은 registry 체인에 이어 두고 방출이 같은 depth의 체인 아이템으로 합류시킨다 // 깊이가 체인 천장 63을 넘으면 편입하지 않고 flags 비트1로 회수하며 첫 등록의 직접 발화는 천장 밖이다
				for (let w = 0, node, cursor = 0, mark = 0; w < lanes; w += 2) { const label = registry[w], form = registry[w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF; mark = cursor; cursor += form & 0x3F; if (bottomChars || !topChars) continue; if (nodes + topChars * 2 > budget - links - rest - load) { flags |= 8; continue; } const blocks = form & 0x3F, depth = (label >>> 3) & 0x3F, index = label >>> 9, bottomStar = (label & 0x2) !== 0; node = 0; const path = coordinates[index]; for (let i = 0; i < topChars; i++) node = put(node, path.charCodeAt(i)); const payload = topology[node * 3 + 2]; if (blocks) { const extra = payload > 0 && !(payload & 0x40000000) ? 1 : 0; const head = reserve(w, extra, mark); if (head < 0) { flags |= 8; continue; } topology[chain + links] = (bottomStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else topology[chain + links] = (bottomStar ? 0x80000000 : 0) | (index << 6) | depth; registry[w] |= 0x4; topology[link + links] = payload ? ~payload : 0; if (payload > 0 && !(payload & 0x40000000)) rest++; topology[node * 3 + 2] = ~links; links++; } // 탑 고정 닻을 정방향 가지에 넣는다 // 미드가 있으면 verify 레코드와 redirect 아이템을 만들고 없으면 index를 payload로 하는 발화 아이템을 넣는다
				let mirror = 0; if (bottoms) { const band = 1; mirror = nodes++; topology[mirror * 3 + 1] = (band << 23) | topology[0]; topology[0] = mirror; if (band > span) span = band; } // mirror의 입구 심볼 band는 제어 대역 상수 1이라 정방향 자식과 겹치지 않는다
				for (let w = 0, node, cursor = 0, mark = 0; w < lanes; w += 2) { const label = registry[w], form = registry[w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF; mark = cursor; cursor += form & 0x3F; if (!bottomChars) continue; if (nodes + bottomChars * 2 > budget - links - rest - load) { flags |= 8; continue; } const blocks = form & 0x3F, depth = (label >>> 3) & 0x3F, index = label >>> 9, topStar = (label & 0x1) !== 0; node = mirror; const path = coordinates[index], low = path.length - bottomChars; for (let i = bottomChars - 1; i >= 0; i--) node = put(node, path.charCodeAt(low + i)); if (topChars || blocks) { const head = reserve(w, 0, mark); if (head < 0) { flags |= 8; continue; } topology[chain + links] = (topStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | depth; } else { topology[chain + links] = (topStar ? 0x80000000 : 0) | (index << 6) | depth; } registry[w] |= 0x4; const payload = topology[node * 3 + 2]; topology[link + links] = payload < 0 ? ~payload : 0; topology[node * 3 + 2] = ~links; links++; } // 바텀 고정 닻을 글자 역순으로 거울 가지에 넣는다 // 탑이나 미드가 있으면 verify 레코드를 만들고 탑 닻은 프리펜드 첫 블록에 싣는다 // 거울 서브트리에 리터럴 종단은 없다 // payload는 0 아니면 head의 반전 음수뿐이다
				const items = links - 1 + rest, split = 2 + words + mids * 3 + body + items, trie = split + (load > 1 ? load : 0), limit = 0x7FFFFE - trie, bound = limit < 0 ? 0 : limit, range = bound + span + 2, capacity = span + 1 + ((nodes * 2 * (bound + 1) / (nodes * 2 + bound + 1)) | 0), pad = items && span < 63 ? 64 : span + 1; // capacity는 정확성과 무관한 시작 폭 힌트다 // limit은 base와 trie의 합이 23비트 이하여야 한다는 조건에서 역산한 배치 상한이고 bound는 음수를 0으로 둔 물리 폭이다 // 조건을 넘는 노드는 비트8로 불발하고 미배치로 남으며 방출은 base 0을 미배치 표지로 읽는다
				let reach = capacity, heads = capacity + nodes, placement = new Int32Array(capacity + nodes + pad); 
				const grow = (usage) => { const mark = reach; reach = usage + ((usage * (range - usage) / range) | 0); const space = new Int32Array(reach + nodes + pad); space.set(placement); space.copyWithin(reach, mark, mark + nodes + pad); space.fill(0, mark, reach); heads = reach + nodes; placement = space; }; // grow는 사용량과 남은 거리에 비례해 뛰며 체인 배치와 리프 배치가 이 한 함수를 함께 쓴다 // grid는 배치 격자 한 장이다 // 슬롯 장부가 앞에 있고 reach 뒤에 노드 base가 있으며 heads부터 심볼 체인 머리가 있다 // 장부 워드는 비트30이 점유이고 비트31이 base이며 값부는 다음 비점유 후보다 // 프로브는 장부 폭을 검사하지 않는데 장부 뒤 구역에는 비트30이 서지 않아 빈 슬롯으로 읽혀 탐색이 저절로 멈추기 때문이다 // base 점유는 단조라 최소 비base 슬롯을 커서로 두고 그 아래는 건너뛰어도 first-fit 결과가 같다 // 같은 심볼 버킷에서 자식 열이 같고 직전의 제약을 현재가 전부 덮으면 직전 base의 다음 칸을 하한으로 승계한다 // placement 항목은 빈 슬롯으로 건너뛰는 지름길이라 프로브가 재방문을 피한다 // 후보 루프는 기각 원천이 유한해 반드시 끝나고 grow는 필요폭을 한 번에 덮으며 천장 밖 후보는 이어지는 limit 검사가 불발시킨다
				let peak = trie - 1, free = 0; for (let s = 0; s < nodes; s++) { const e = topology[s * 3]; if (!e) continue; const symbol = topology[e * 3 + 1] >>> 23; placement[reach + s] = placement[heads + symbol]; placement[heads + symbol] = s + 1; } // peak의 바닥을 trie-1로 두어 전멸 빌드도 길이가 레인 구역과 카운트를 덮는다 // 배치 순서는 버킷 심볼이 큰 노드부터다 // 버킷 링크는 배치 전에 비어 있는 base 구역을 임시로 쓰고 s+1로 담아 0을 빈 칸으로 읽으니 초기화 루프가 없다 // 프로브 닻은 자식 중 최소 심볼이라 후보가 가장 이르게 기각되고 어느 자식을 닻으로 삼아도 first-fit 결과는 같다
				for (let symbol = span; symbol >= 0; symbol--) for (let h = placement[heads + symbol], next, prior = 0, floor = 0; h !== 0; h = next) { const s = h - 1; next = placement[reach + s]; const branch = topology[s * 3], word = topology[branch * 3 + 1], full = topology[s * 3 + 2] !== 0; const past = prior - 1; let least = symbol, cover = floor > free && (topology[past * 3 + 2] === 0 || full), twin = cover ? topology[topology[past * 3] * 3 + 1] & 0x7FFFFF : 0; for (let e = word & 0x7FFFFF; e; ) { const w = topology[e * 3 + 1], code = w >>> 23; if (code < least) least = code; if (cover) { if (!twin) cover = false; else { const word = topology[twin * 3 + 1]; if ((word >>> 23) !== code) cover = false; else twin = word & 0x7FFFFF; } } e = w & 0x7FFFFF; } if (twin) cover = false; const step = least + 1; let b; outer: for (let f = (cover ? floor : free) + step; ; f++) { while (placement[f] & 0x40000000) { const q = placement[f] & 0xFFFFFF, hop = placement[q]; if (hop & 0x40000000) { const far = hop & 0xFFFFFF; placement[f] = (placement[f] & 0xC0000000) | far; f = far; } else f = q; } b = f - step; if (placement[b] < 0) continue; if (full) { const seat = placement[b + 1]; if (seat & 0x40000000) { f += (seat & 0xFFFFFF) - b - 2; continue; } } for (let e = branch; e; ) { const w = topology[e * 3 + 1], c = w >>> 23, t = b + c + 1, seat = placement[t]; if (seat & 0x40000000) { let far = seat & 0xFFFFFF; const hop = placement[far]; if (hop & 0x40000000) { far = hop & 0xFFFFFF; placement[t] = (seat & 0xC0000000) | far; } if (far > t + 1) f = far - c + least - 1; continue outer; } e = w & 0x7FFFFF; } break; } prior = s + 1; floor = b + 1; if (b > limit) { flags |= 8; placement[reach + s] = 0; continue; } if (b + span + 1 >= reach) grow(b + span + 2); placement[reach + s] = b + trie; placement[b] |= 0x80000000; if (b === free) while (placement[free] < 0) free++; if (full) { const slot = b + 1; placement[slot] |= 0x40000000 | (slot + 1); if (slot + trie > peak) peak = slot + trie; } for (let e = branch; e; ) { const w = topology[e * 3 + 1], t = b + (w >>> 23) + 1; placement[t] |= 0x40000000 | (t + 1); if (t + trie > peak) peak = t + trie; e = w & 0x7FFFFF; } } // 점유 칸에 저장된 건너뛰기 목적지를 f에 투영해 다음 후보로 바로 간다 // 건너뛴 후보 전부가 어차피 같은 점유로 기각되므로 first-fit이 불변이고 f가 최소 한 칸 전진해 종료가 증명된다
				for (let s = 0; s < nodes; s++) { if (topology[s * 3] !== 0 || topology[s * 3 + 2] === 0) continue; let f = free + 1; for (;;) { while (placement[f] & 0x40000000) { const q = placement[f] & 0xFFFFFF, hop = placement[q]; if (hop & 0x40000000) { const far = hop & 0xFFFFFF; placement[f] = (placement[f] & 0xC0000000) | far; f = far; } else f = q; } if (placement[f - 1] >= 0) break; f++; } const b = f - 1; if (b > limit) { flags |= 8; break; } if (f >= reach) grow(f + 1); placement[reach + s] = b + trie; placement[b] |= 0x80000000; free = b + 1; placement[f] |= 0x40000000 | (f + 1); if (f + trie > peak) peak = f + trie; } // 리프 패스는 자식 없는 종단에 기록용 base를 배치한다 // 리프는 모양이 같고 기각이 영구라 first-fit 자리가 단조 증가하므로 free가 다음 리프의 하한이 된다 // 한 리프가 천장을 넘으면 남은 리프도 전부 넘으므로 첫 초과에서 끝내고 미배치는 감사가 회수한다 // base 등록은 의무다 // base 유일성이 다른 노드의 기록을 잘못 읽는 것을 막기 때문이다
				if (flags) { const seek = (node, c) => { if (c >= 256) { let n = 0; for (let e = topology[node * 3]; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === (c >> 8) + 256) { n = e; break; } e = w & 0x7FFFFF; } if (!n) return 0; node = n; c &= 0xFF; } for (let e = topology[node * 3]; e; ) { const w = topology[e * 3 + 1]; if ((w >>> 23) === c) return e; e = w & 0x7FFFFF; } return 0; }; const check = (node, path, start, end) => { if (!placement[reach + node]) return 0; for (let i = start, d = start < end ? 1 : -1; i !== end; i += d) { node = seek(node, path.charCodeAt(i)); if (!node || !placement[reach + node]) return 0; } return 1; }; for (let g = arena - 2; g >= drop; g -= 2) { const cell = registry[g], i = cell & 0x7FFFFF; if (!(cell & 0x800000) || !check(0, coordinates[i], 0, coordinates[i].length)) { registry[g] |= 0x1000000; lost++; } } for (let w = 0; w < lanes; w += 2) { const label = registry[w], form = registry[w + 1], topChars = form >>> 19, bottomChars = (form >>> 6) & 0x1FFF; if (!topChars && !bottomChars) continue; const i = label >>> 9, path = coordinates[i]; if (!(label & 0x4) || (bottomChars ? !check(mirror, path, path.length - 1, path.length - 1 - bottomChars) : !check(0, path, 0, topChars))) { topology[marks + (w >> 1)] = 0x40000000; lost++; } } } // 손실 감사는 계수 좌표 목록을 최종 산물과 대조한다 // 판정은 접수 표지와 닻 경로 전 노드의 base 존재를 둘 다 본다 // 감사 표지는 감사 전까지 아무도 쓰지 않는 레인에 남겨 청소가 없다 // seek는 put의 조회부와 같되 생성이 없는 조회 전용이다 // check는 start와 end의 대소가 방향이라 정방향과 거울이 같은 코드로 순회한다 // 감사는 flags가 선 빌드 한정이다
				let tail = split - items; if (items) placement.fill(0, heads, heads + 64); image = new Int32Array(peak + 2 + (lost ? lost + 1 : 0)); // 좌표 배열 하나가 실행 이미지 하나다 // 모든 구역 크기가 할당 전에 확정되므로 배열을 한 번만 잡는다 // 앞에서부터 루트와 편승 words와 카운트A와 레인 구역이 차고 그 뒤 꼬리와 verify와 트라이가 이어지며 마지막 셀이 카운트B다 // 꼬리를 트라이 앞에 두는 것이 안전 계약이다 // 전이 주소는 base 더하기 c로 앞으로만 가는데 모든 base가 꼬리 뒤에서 시작해 꼬리에 닿지 못한다 // 어휘 밖 문자는 범위 밖 읽기의 undefined가 0으로 정규화되어 죽는다
				for (let s = 0; s < nodes; s++) { const base = placement[reach + s]; if (!base) continue; const payload = topology[s * 3 + 2]; let terminal = payload > 0 && payload < 0x40000000 ? payload : 0, repeat = payload >= 0x40000000 ? payload & 0xFFFFFF : 0, depth = repeat ? (payload >>> 24) & 0x3F : terminal >>> 24, h = payload < 0 ? ~payload : 0; if (h || repeat) { const offset = tail; let min = 63, max = 0, total = 0; for (let e = h; e; ) { const d = topology[chain + e] & 0x3F, next = topology[link + e]; placement[heads + d]++; total++; if (d < min) min = d; if (d > max) max = d; if (next < 0) { const old = ~next; depth = (old >>> 24) & 0x3F; if (old & 0x40000000) repeat = old & 0xFFFFFF; else terminal = old; break; } e = next; } for (let r = repeat; r > 0; ) { const back = registry[r]; placement[heads + depth]++; total++; if (back < 0) { terminal = ~back; break; } r = back; } if (terminal) { placement[heads + depth]++; total++; if (depth < min) min = depth; if (depth > max) max = depth; } for (let d = min + 1; d <= max; d++) placement[heads + d] += placement[heads + d - 1]; for (let r = repeat; r > 0; r = registry[r]) image[offset + --placement[heads + depth]] = ((registry[r - 1] & 0x7FFFFF) << 6) | depth; for (; h; ) { const word = topology[chain + h], next = topology[link + h]; image[offset + --placement[heads + (word & 0x3F)]] = word & 0x20000000 ? (word & ~0x1FFFFFC0) | ((((word >>> 6) & 0x7FFFFF) + split) << 6) : word; if (next < 0) break; h = next; } if (terminal) image[offset + --placement[heads + depth]] = (((terminal & 0xFFFFFF) - 1) << 6) | depth; for (let d = min; d <= max; d++) placement[heads + d] = 0; tail += total; image[tail - 1] |= 0x40000000; image[base + 1] = (offset << 9) | 0x20; } else if (terminal) image[base + 1] = (terminal & 0xFFFFFF) << 9; for (let e = topology[s * 3]; e; ) { const w = topology[e * 3 + 1], symbol = w >>> 23, child = placement[reach + e] + 1; if (child > 1) image[base + symbol + 1] = (child << 9) | symbol; e = w & 0x7FFFFF; } } // 종단 기록은 image[base+1] 한 주소이며 그 심볼 값이 종단 종류를 가르는 태그다 // 0은 단일 리터럴로 index+1을 실어 바로 발화한다 // 0x20은 체인 종단으로 payload가 꼬리의 절대 오프셋이다 // 태그 32는 좌표를 끝내는 공백이고 좌표 어휘가 32를 넘으므로 0과 32 모두 전이가 가질 수 없는 값이다 // 블록은 depth 64버킷으로 안정 분배하고 동률이면 리터럴 다음 와일드 다음 중복 등록순이다 // 발화는 범위 바깥에서 안쪽으로 좌표가 탑부터 읽히는 순서다 // 워크는 레벨이 depth를 넘으면 조기 탈출한다
				const root = placement[reach] ? placement[reach] + 1 : 0, proxy = !root && mirror && placement[reach + mirror] ? placement[reach + mirror] + 1 : 0; image[0] = ((root || proxy) << 9) | (lost ? 0x8 : 0) | (proxy ? 0x4 : 0) | (tops ? 0x1 : 0); image[1 + words] = ((((arena - drop) >> 1) + tops) << 9) | 0x100; image[image.length - 1] = (bottoms << 9) | 0x100; if (lost) { image[image.length - 2] = (lost << 9) | 0x100; let k = image.length - 3; for (let r = 1, keep; r <= lost && (keep = registry[registry.length - r]); r++) image[k--] = ((keep - 1) << 9) | 0x100; for (let g = arena - 2; g >= drop; g -= 2) if (registry[g] & 0x1000000) image[k--] = ((registry[g] & 0x7FFFFF) << 9) | 0x100; for (let w = 0; w < wilds; w++) if (topology[marks + w] === 0x40000000) image[k--] = ((registry[w * 2] >>> 9) << 9) | 0x100; } // image의 0번은 정상 형상에서 정방향 루트이고 대리 표지가 켜지면 거울 루트다 // 극포화에서 루트만 실패하면 비트2를 세우고 상위 23비트에 거울 루트를 실어 바텀 가지를 보존한다 // 카운트 셀은 심볼 256 태그를 써서 전이도 워크도 오인할 수 없다 // 레이아웃은 루트 다음 편승 셀 다음 카운트A 다음 레인 구역 다음 체인 꼬리 다음 verify 다음 트라이 다음 카운트B다 // 손실 꼬리는 카운트B 바로 앞에 서고 존재 표지는 루트의 비트3이다 // 자식 없는 루트는 0으로 두어 전멸 빌드에서 워크가 시작되지 않는다
				if (load > 1) { let fill = split + 1; for (let side = 0; side < 2; side++) for (let w = 0, cursor = 0; w < lanes; w += 2) { const label = registry[w], form = registry[w + 1], bottomChars = (form >>> 6) & 0x1FFF, mark = cursor; cursor += form & 0x3F; if ((bottomChars ? !side : side) || !(label & 0x4) || !(bottomChars ? (form >>> 19) || (form & 0x3F) : form & 0x3F)) continue; const index = label >>> 9, topChars = form >>> 19, blocks = form & 0x3F, origin = bottomChars ? ((label >>> 3) & 0x3F) - 1 : -1, front = bottomChars && topChars ? 1 : 0, total = front + blocks, path = coordinates[index]; let segment = topChars ? 1 : 0; for (let i = 1; i < topChars; i++) if (path.charCodeAt(i) === 45) segment++; const seed = segment, post = (label & 0x1) + (topChars ? topChars + 1 : 0); let q = post; image[fill++] = (index << 9) | (front << 6) | total; if (front) image[fill++] = (path.charCodeAt(0) << 13) | topChars; let unit = mark; for (let m = 0; m < blocks; m++) { const block = (registry[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; image[fill++] = ((origin < 0 ? target : origin - target) << 26) | (path.charCodeAt(q) << 10) | length; q += length; } if (front) for (let i = 1; i < topChars; i += 2) image[fill++] = path.charCodeAt(i) | (i + 1 < topChars ? path.charCodeAt(i + 1) << 16 : 0); unit = mark; segment = seed; q = post; for (let m = 0; m < blocks; m++) { const block = (registry[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF, target = block >> 10, length = block & 0x3FF; unit++; q += target - segment; segment = target; for (let i = 1; i < length; i += 2) image[fill++] = path.charCodeAt(q + i) | (i + 1 < length ? path.charCodeAt(q + i + 1) << 16 : 0); q += length; } } } // 예약 셀은 0 초기값 그대로 두며 head가 1부터 시작하는 근거 자리다 // verify는 전이가 닿지 않는 구역 split에 있다 // redirect payload는 방출 시점에 split을 더해 절대화하고 budget 부등식이 23비트를 증명한다 // 발화 순서는 레코드 단위로 스트림 등장순이고 한 레코드 안에서는 정방향 다음 거울 다음 슬라이드 순이다 // 체인의 다중 발화는 depth 오름차순이고 동률이면 리터럴 다음 와일드 다음 중복 등록순이며 슬라이드는 등록순이다 // IN은 이 순서에서 매칭만 남긴 것이고 ONE은 좌표별 첫 발화만 모은 부분열이다 // 시스템 한계는 23비트 가족이라 명목 838만이고 실효 한계는 공동 예산이 묶는 trie 크기다
			}
			if (!image && (flags || mids)) { image = new Int32Array(2 + words + mids * 3 + body + 1); image[1 + words] = 0x100; image[image.length - 1] = 0x100; } // 레인이 있거나 flags가 기록되면 최소 이미지를 만든다 // 이 형상은 계수 좌표가 전무해야 도달하므로 카운트 두 셀은 0이고 손실 꼬리도 없다 // 레이아웃 문법은 트라이 형상과 같아 크기식이 조건 없이 한 꼴이다
			if (mids) { image[0] |= 0x10; let lane = 2 + words; for (let w = 0, m = 0, cursor = 0; w < lanes && m < mids; w += 2) { const form = registry[w + 1], mark = cursor; cursor += form & 0x3F; if (form >>> 6) continue; const label = registry[w], depth = (label >>> 3) & 0x3F, path = coordinates[label >>> 9]; let block = (registry[arena + (mark >> 1)] >>> ((mark & 1) << 4)) & 0xFFFF; const midChars = block & 0x3FF, topGap = block >> 10, rest = (form & 0x3F) - 1, post = (label & 0x1) + topGap; const spot = lane + 3; let fill = spot; image[lane] = (path.charCodeAt(post) << 16) | path.charCodeAt(post + midChars - 1); let i = 1; for (; i + 1 < midChars - 1; i += 2) image[fill++] = path.charCodeAt(post + i) | (path.charCodeAt(post + i + 1) << 16); if (i < midChars - 1) image[fill++] = path.charCodeAt(post + i); let unit = mark + 1, segment = topGap, q = post + midChars; for (let b = 0; b < rest; b++) { block = (registry[arena + (unit >> 1)] >>> ((unit & 1) << 4)) & 0xFFFF; unit++; const target = block >> 10, length = block & 0x3FF; q += target - segment; segment = target; image[fill++] = (path.charCodeAt(q) << 16) | block; let j = 1; for (; j + 1 < length; j += 2) image[fill++] = path.charCodeAt(q + j) | (path.charCodeAt(q + j + 1) << 16); if (j < length) image[fill++] = path.charCodeAt(q + j); q += length; } const size = fill - spot; image[lane + 1] = (label & ~0x1FF) | (rest << 3) | (m + 1 === mids ? 0x4 : 0) | (label & 0x3); image[lane + 2] = ((size > 0x3FF ? 0 : size) << 22) | (midChars << 12) | (topGap << 6) | depth; m++; lane = fill; } } if (flags) { image[0] |= flags << 5; } // 레인 구역은 미드 닻을 세 레인으로 압축한 것이며 notes에서 등록순으로 걸러 만든다 // 레인0은 first와 last다 // 레인1은 index와 rest와 마지막 레인 표지와 별 플래그다 // 레인2는 size와 midChars와 topGap과 depth다 // size가 0인데 rest가 있으면 한계 초과 표지이며 이 조합은 정상 산식이 만들 수 없다 // 본문은 헤더 석 장 바로 뒤에 이어지는 앵커 중간 글자 2팩과 미드 블록 워드다 // 미드 헤더를 세던 둘째 순회가 image를 잡은 뒤 같은 레인 순서로 정확한 자리에 바로 쓴다 // 레인 주소는 팩하지 않는 산술 인덱스라 별도의 비트폭 천장이 없다 // 앵커의 첫 글자와 끝 글자는 레인에 있으므로 본문에는 중간 글자와 블록만 담는다
			if (!image) image = BEAT.EMPTY; BEAT.CACHE.set(coordinates, image); // 캐시된 coordinates 배열은 길이와 항목을 바꾸면 안 된다 // 스윕과 검증이 원본 좌표 문자열을 직접 읽기 때문이다
		}
		const top = image[0], gate = top & 0x1, lane = 2 + words; // 레코드의 키와 값 경계를 언제 계산하는지는 모드가 가른다 // lane은 words에 상수를 더해 유도한 레인 구역 시작이라 경계를 저장하지 않는다
		let ms, me, ks, ke, vs, ve, find = 0, left = 0, topAlive = 0, bottomAlive = 0, midAlive = 0, topRoot = top & 0x4 ? 0 : top >>> 9; // find는 검색이 증명한 범위의 첫 V 위치이거나 V 부재의 -1이다 // find가 ks 이상이면 그 앞에 V가 없음이 이미 증명된 것이라 재사용하고 -1이면 다시 찾지 않는다
		const entry = topRoot ? image[topRoot + 1] | 0 : 0;
		let bottomRoot = top & 0x4 ? top >>> 9 : (entry & 0x1FF) === 1 ? entry >>> 9 : 0, // 거울 루트는 루트의 band 전이에서 유도하고 극포화 형상은 헤더의 비트2가 표지한다 // topRoot 게이트가 미드 전용 이미지에서 비트맵을 루트로 오독하는 것을 막는다
			 slides = top & 0x10, bits = null, start = -2, end = -1, sweeps = 0; // sweeps와 start와 end는 호출 수명이라 콜마다 초기화된다 // slides는 레인 구역의 존재 표지이자 레인 루프의 진입 게이트다 // ONE 전용 로컬은 ALL과 IN 경로를 건드리지 않는다 // fire-once 비트는 이미지 앞쪽 스크래치에 얹으므로 상주 증가는 편승 셀뿐이다
			if (one) { topAlive = image[lane - 1] >>> 9; bottomAlive = image[image.length - 1] >>> 9; if (slides) for (let w = lane; w; ) { midAlive++; const s1 = image[w + 1], s2 = image[w + 2], inner = w + 3, rest = (s1 >>> 3) & 0x3F, size = s2 >>> 22; if (s1 & 0x4) w = 0; else if (size || !rest) w = inner + size; else { let f = inner + ((((s2 >>> 12) & 0x3FF) - 1) >> 1); for (let b = 0; b < rest; b++) f += 1 + ((image[f] & 0x3FF) >> 1); w = f; } } left = topAlive + bottomAlive + midAlive; if (top & 0x8) left -= image[image.length - 2] >>> 9; if (!left) return; bits = image; if ((top & 0x2) === 0) { bits.fill(0, 1, 1 + words); image[0] = top | 0x2; } else bits = new Int32Array(1 + words); if (top & 0x8) for (let g = (image[image.length - 2] >>> 9) - 1; g >= 0; g--) { const i = image[image.length - 3 - g] >>> 9; bits[1 + (i >> 5)] |= 1 << i; } if (topAlive || bottomAlive) start = -1; } // ONE은 콜마다 스캔 진입 전에 진영 계수와 fire-once 비트맵을 준비한다 // 셀 하나에 좌표 32개를 담고 시프트가 5비트로 잘려 나머지 연산이 없다 // 재진입 표지는 헤더의 비트1을 세워 선점하고 top이 복원값이며 해제는 finally 한 지점이라 콜백이 예외를 던져도 선점이 반드시 풀린다 // 중첩 재진입 콜만 독립 비트맵으로 낮춘다 // left는 카운트A와 카운트B와 레인 수의 합에서 손실 수를 뺀 값이라 0 도달이 곧 전원 해소다 // 손실 좌표는 fire-once 비트를 미리 세워 발화와 스윕이 기존 검사 그대로 건너뛴다
			try { let p = beat.indexOf(M); while (p !== -1) { if (p === 0 || beat.charCodeAt(p - 1) <= 32) break; p = beat.indexOf(M, p + 1); } // 값 텍스트 안에 있는 M을 건너뛰고 첫 레코드의 시작을 찾는다
		while (p !== -1) { // 메인 루프는 모든 레코드를 한 번 훑는다
			ms = p + 1; me = beat.indexOf(' ', ms); if (me === -1) break;
			p = beat.indexOf(M, me + 1); while (p !== -1 && beat.charCodeAt(p - 1) > 32) p = beat.indexOf(M, p + 1);
			ve = p === -1 ? beat.length : p - 1; // 다음 메타 탐색 결과가 p에 먼저 있어 값 끝이 매치 전에 확정되고 p가 곧 다음 레코드 머리다 // ve가 경계 계산 전까지 레코드 끝을 보관하며 find가 ve보다 작으면 값이 있고 아니면 키만 있다
				if (!match) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } // ALL은 경계를 레코드 머리에서 계산하고 IN과 ONE은 발화 시점에 계산한다 // ks는 항상 me+1이고 콜론이 있으면 ke가 find이고 vs와 ve가 값이며 없으면 ke가 레코드 끝이고 vs와 ve가 -1이다 // 콜론 없는 단어는 이름이 곧 키이고 값은 서브트리다 // 발화 경로는 합치지 않는다 // 각 경로의 인라인된 직선 코드 자체가 성능 자산이기 때문이다
			let hit = false, depth = 0; // 레코드 깊이는 처음 필요할 때 한 번만 구해 발화 게이트들이 공유한다
			if (start > -2) { e: { const length = end - start; if (start >= 0) { let k = 0; while (k < length && beat.charCodeAt(start + k) === beat.charCodeAt(ms + k)) k++; if (k === length && (ms + length === me || beat.charCodeAt(ms + length) === 45)) break e; } let cut = ms; while (cut < me && beat.charCodeAt(cut) !== 45) cut++; if (start >= 0) { if ((sweeps + count) * 4 > beat.length - ms) { start = -2; break e; } sweeps += count; let live = 0; const lead = beat.charCodeAt(start); for (let low = 0; low < count; low += 32) { const fired = bits[1 + (low >> 5)]; if (fired === -1) continue; const stop = low + 32 < count ? low + 32 : count; for (let i = low; i < stop; i++) { if ((fired & (1 << i)) !== 0) continue; const path = coordinates[i]; if (!path) continue; const first = path.charCodeAt(0); if (first === 42 || first === 45) continue; if (first !== lead) { live = 1; continue; } const width = path.length; if (width < length) { live = 1; continue; } let k = 1; while (k < length && path.charCodeAt(k) === beat.charCodeAt(start + k)) k++; if (k < length) { live = 1; continue; } const c = length < width ? path.charCodeAt(length) : 0; if (c !== 0 && c !== 45 && !(c === 42 && length === width - 1)) { live = 1; continue; } bits[1 + (i >> 5)] |= 1 << i; const last = path.charCodeAt(width - 1); let gap = 0; if (last !== 42 && last !== 45) for (let g = length + 1; g < width; g++) if (path.charCodeAt(g) === 45 && path.charCodeAt(g - 1) === 45) { gap = 1; break; } if (gap) { if (!--bottomAlive) bottomRoot = 0; } else if (!--topAlive) topRoot = 0; if (--left === 0) return; } } if (!live) { start = -2; break e; } } start = ms; end = cut; } } // ONE 탑 전환 스윕은 탑이 바뀌면 떠난 탑의 고정 탑 좌표를 한꺼번에 소등한다 // 단일 트리 DFS가 계약이라 닫힌 서브트리는 다시 등장하지 않는다 // 비용 상한은 전환 횟수 곱하기 P이며 퇴화한 평탄 스트림에서 커진다 // 순회는 비트맵 워드 단위로 나아가고 만석 워드는 통째로 건너뛴다 // 누적 스윕 비용의 4배가 잔여 글자 수를 넘거나 이번 바퀴 뒤에 스윕할 미해소 고정 탑 좌표가 남지 않았으면 스윕을 끈다 // 어느 쪽으로 꺼져도 매칭과 발화와 left 종료는 그대로이고 사망 추론만 멈춘다 // 같은 탑이면 직전 탑 텍스트와 바로 대조하는 한 루프로 끝낸다 // 좌표의 탑이 떠난 탑과 같은지는 경계 문자 하나로 판정한다 // 사망은 발화 순서를 바꾸지 못하고 left만 앞당긴다 // 이미 발화한 좌표는 비트를 먼저 보고 건너뛰어 두 번 감소하지 않는다 // 가지 구분은 사망이 확정된 좌표만 한 번 한다
			if (topRoot) { let base = topRoot, fit = true, layer = 0; for (let j = ms, c, cell, page; j < me; j++) { c = beat.charCodeAt(j); if (gate && c === 45) { layer++; const status = image[base] | 0; if ((status & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = layer + 1; for (let g = j + 1; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item & 0x20000000) { if (item < 0 || depth === level) { const head = (item >>> 6) & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) v: { let cursor = head + 1 + blocks, q = j + 1, segment = layer; for (let i = 0; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment < target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment++; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 10) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } } else if (item < 0 || depth === level) { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } } if (c < 256) { cell = image[base + c] | 0; if ((cell & 0x1FF) !== c) { fit = false; break; } base = cell >>> 9; } else { cell = image[base + (page = (c >> 8) + 256)] | 0; if ((cell & 0x1FF) !== page) { fit = false; break; } base = cell >>> 9; cell = image[base + (c & 0xFF)] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) { fit = false; break; } base = cell >>> 9; } } if (fit) { const status = image[base] | 0, tag = status & 0x1FF; if (tag === 0x20) { let h = status >>> 9; if (!depth) { if (gate) depth = layer + 1; else { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if ((item < 0 || depth === level) && !(item & 0x20000000)) { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } if (item & 0x40000000) break; h++; } while (true); } else if (tag === 0 && status) { const index = (status >>> 9) - 1; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --topAlive || (topRoot = 0), --left === 0)) return; } } } } // 정방향 워크는 리터럴과 탑 고정이 함께 담긴 trie를 루트에서 순회한다 // 리터럴은 종단에서 판정하고 탑 고정은 세그 경계마다 판정한다 // 종단 depth는 게이트가 있으면 layer로 정하고 없으면 하이픈 스캔으로 보정한다
			if (bottomRoot && me > ms) { let base = bottomRoot; for (let j = me - 1, c = beat.charCodeAt(j), low = 0, cell, page, status; ; j--, c = low) { if (c < 256) { cell = image[base + c] | 0; if ((cell & 0x1FF) !== c) break; base = cell >>> 9; } else { cell = image[base + (page = (c >> 8) + 256)] | 0; if ((cell & 0x1FF) !== page) break; base = cell >>> 9; cell = image[base + (c & 0xFF)] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) break; base = cell >>> 9; } if ((j === ms || (low = beat.charCodeAt(j - 1)) === 45) && ((status = image[base] | 0) & 0x1FF) === 0x20) { let h = status >>> 9; if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const item = image[h], level = item & 0x3F; if (level > depth) break; if (item < 0 || depth === level) { if (item & 0x20000000) { const head = (item >>> 6) & 0x7FFFFF, record = image[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) v: { let cursor = head + 1 + blocks, q = ms, segment = depth - 1; if (record & 0x40) { const block = image[head + 1], length = block & 0x1FFF; if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 13) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } for (let i = (record >>> 6) & 0x1; i < blocks; i++) { const block = image[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment > target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment--; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== ((block >>> 10) & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomRoot = 0), --left === 0)) return; } } else { const index = (item >>> 6) & 0x7FFFFF; if (!one || (bits[1 + (index >> 5)] & (1 << index)) === 0) { if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --bottomAlive || (bottomRoot = 0), --left === 0)) return; } } } if (item & 0x40000000) break; h++; } while (true); } if (j === ms) break; } } // 거울 워크는 같은 trie를 거울 루트에서 거꾸로 순회한다 // 검증 커서만 거꾸로라 q가 ms이고 segment가 depth-1이다 // 프리펜드 레코드는 첫 블록을 전용 형식으로 먼저 검증한다 // 경계 검사가 읽은 앞 글자를 다음 반복의 c로 승계해 글자당 로드가 한 번이다
			if (slides) for (let w = lane; w; ) { // 슬라이드는 미드 닻의 매처다 // 탑과 바텀 고정은 두 trie가 이미 발화했으므로 미드 고정만 처리한다 // 커서 w 하나가 size를 보폭으로 헤더와 본문을 함께 순회한다 // bottomGap은 저장하지 않고 성공 지점에서 depth와 segment로 유도한다
				const s0 = image[w], s1 = image[w + 1], s2 = image[w + 2], first = s0 >>> 16, last = s0 & 0xFFFF, midChars = (s2 >>> 12) & 0x3FF, inner = w + 3, rest = (s1 >>> 3) & 0x3F, bottomStar = (s1 & 0x2) !== 0; { const size = s2 >>> 22; if (s1 & 0x4) w = 0; else if (size || !rest) w = inner + size; else { let f = inner + ((midChars - 1) >> 1); for (let b = 0; b < rest; b++) f += 1 + ((image[f] & 0x3FF) >> 1); w = f; } } // 첫 고정 앵커를 잡고 바텀 쪽으로 세그를 이어 순회한다
					if (one) { const index = s1 >>> 9; if ((bits[1 + (index >> 5)] & (1 << index)) !== 0) continue; } if (((s2 & 0x3F) << 1) - 1 > me - ms) continue; // 해소된 레인은 ONE에서 슬라이딩을 건너뛴다 // 레코드 글자 수가 세그 최소 폭보다 작으면 닻 스캔 전에 길이로 거절한다
				let fit = false, topStar = (s1 & 0x1) !== 0, topGap = (s2 >>> 6) & 0x3F, q = ms; if (topStar && !bottomStar) { if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } const height = depth + topGap - (s2 & 0x3F); if (height < topGap) q = me; else { topGap = height; topStar = false; } } // 별과 바텀 사이의 세그 수가 고정이면 앵커 자리가 하나로 정해지므로 슬라이드 없이 그 자리만 시도한다
				if (!topStar) for (let g = 0; g < topGap; g++) { while (q < me && beat.charCodeAt(q) !== 45) q++; q++; } // 탑이 고정이면 topGap개 세그를 건너뛴 한 자리에서만 앵커를 맞춘다
				for (let topSide = 0; q + midChars <= me; q++) {
					if (q > ms) { if (beat.charCodeAt(q - 1) === 45) topSide++; else continue; } // 세그 경계에서만 앵커를 시도하며 지나온 조상 수를 센다
					const stop = q + midChars; v: { if (beat.charCodeAt(q) !== first || beat.charCodeAt(stop - 1) !== last) break v; let k = 1; for (; k + 1 < midChars - 1; k += 2) if ((beat.charCodeAt(q + k) | (beat.charCodeAt(q + k + 1) << 16)) !== image[inner + (k >> 1)]) break v; if (k < midChars - 1 && beat.charCodeAt(q + k) !== (image[inner + (k >> 1)] & 0xFFFF)) break v; // 첫 글자와 끝 글자는 레인의 first와 last로 비교하고 중간만 본문을 읽는다 // 글자가 하나면 끝 비교가 자기 비교로 통과한다
					if (stop < me && beat.charCodeAt(stop) !== 45) break v;
					if (!topStar || topSide >= topGap) { // 탑이 별이면 조상이 topGap 이상이어야 한다
						let e = stop, segment = (s2 >>> 6) & 0x3F, offset = inner + ((midChars - 1) >> 1); for (let i = 0; i < rest; i++) { const block = image[offset], target = (block >>> 10) & 0x3F, length = block & 0x3FF, cursor = offset + 1; while (segment < target) { while (e < me && beat.charCodeAt(e) !== 45) e++; e++; segment++; } const next = e + length; if (next > me || (next < me && beat.charCodeAt(next) !== 45) || beat.charCodeAt(e) !== (block >>> 16)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(e + k) | (beat.charCodeAt(e + k + 1) << 16)) !== image[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(e + k) !== (image[cursor + (k >> 1)] & 0xFFFF)) break v; e = next; segment = target; offset = cursor + (length >> 1); } // 중간 글자 2팩 뒤가 미드 블록 워드다 // 블록의 첫 글자로 먼저 거르고 나머지를 2팩으로 비교한다
						const bottomGap = (s2 & 0x3F) - 1 - segment; if (bottomStar && bottomGap === 0) fit = true; else { let bottomSide = 0; for (let j = e; j < me; j++) if (beat.charCodeAt(j) === 45) bottomSide++; fit = bottomStar ? bottomSide >= bottomGap : bottomSide === bottomGap; } // 바텀 여백은 별이면 bottomGap 이상이어야 하고 아니면 정확히 bottomGap이어야 한다
					} }
					if (fit || !topStar) break; // 탑이 고정이면 한 자리만 보고 별이면 맞을 때까지 슬라이드한다
				}
				if (fit) { const index = s1 >>> 9; if (match && !hit) { ks = me + 1; if (find !== -1 && find < ks) find = beat.indexOf(V, ks); if (find !== -1 && find < ve) { ke = find; vs = find + 1; } else { ke = ve; vs = ve = -1; } } hit = true; if (callback(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (bits[1 + (index >> 5)] |= 1 << index, --midAlive || (slides = 0), --left === 0)) return; } // 발화 자리에 ONE 재검사가 없는 것은 레인 진입 검사가 비트를 이미 확인했기 때문이다 // 슬라이드 좌표는 첫 글자가 별이나 하이픈이라 스윕 대상이 아니다
			}
			if (!match && !hit && callback(beat, ms, me, ks, ke, vs, ve, -1) === false) return;
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

BEAT.MODE = 0; // IN 모드는 좌표에 매칭된 레코드만 콜백으로 넘긴다
BEAT.read(stream, B, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE가 0이면 좌표에 매칭된 레코드만 이 함수로 오고 스캔은 끝까지 완주한다

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
