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
	META: '_', VALUE: ':', MODE: -1, CACHE: new WeakMap(), EMPTY: { jump: null, verify: null, slide: null, codes: null }, // 빈 프리픽스 정본 빈 캐시 — 전 필드 null(매칭기 전무), 메인 루프가 ALL −1 발화 처리 · slide null도 안전: 슬라이드 루프 바운드를 lanes로 콜당 선계산(slide 없으면 0)이라 빈 배열 seal 불요
	read(beat, prefix, on) {
		const M = BEAT.META, V = BEAT.VALUE, l = beat.length, mode = BEAT.MODE | 0, match = mode >= 0, one = mode > 0; // mode 콜당 스냅샷: ALL(-1) 전 레코드 발화 · IN(0) 매칭만 발화 · ONE(1) 니들당 첫 발화, 전원 해소 시 즉시 종료 — match = 매칭만(mode >= 0), ALL·IN 경로는 비트 동일
		let ms, me, ks, ke, vs, ve, from, to, bound = 0, find = l + 2, cache; // bound은 레코드 간 메모 — find ≤ me+1 ≤ bound이면 [me+1, bound)에 V 없음이 이행되어 재사용 (비단조 IN·ONE에서도 성립), 초기 find = l+2가 첫 검색을 강제
		if (prefix.length === 0) { if (match) return; cache = BEAT.EMPTY; } // 빈 프리픽스: IN·ONE 무발화 즉시 반환 · ALL은 공유 빈캐시로 메인 루프 합류(전 레코드 −1 발화) — 스캔 골격 중복 제거, 할당 0
		else if (!(cache = BEAT.CACHE.get(prefix))) { // 프리픽스 배열은 처음 한 번만 분석한다 — 리터럴은 trie로, 와일드는 매처 파라미터로
			let hits = 0; if (prefix.length > 0x7FFFFF) hits = 8; /* 포화 니블 — 천장 히트 기록: 1 깊이63(와일드 전용, 리터럴은 트라이 경로가 곧 깊이 게이트라 천장 없음)·2 앵커8191·4 세그1023·8 P = 23비트 스케일 가족 회수(프리픽스 루프 캡·트라이 nodes 예산·verify head·슬라이드 팩·체인시작·전이/거울 방출 백스톱 — 카운트는 P까지 차고 리터럴 종단은 index+1을 실어 i<0x7FFFFF가 공통 안전선). 천장 밖 니들은 조용한 불발이라 이 니블이 아니면 흔적이 없다. 판독 jump[1] >>> 5 & 0xF, 루트 [4:2]는 예약 */
			const literals = [], wilds = [], slides = [], arena = [], metaCode = M.charCodeAt(0), scratch = (prefix.length + 31) >> 5; // 메타를 객체 없이 기둥으로 적재 — wilds는 와일드당 3레인, literals는 프리픽스 index
			let tops = 0, bottoms = 0; // 가지 등록 카운트(tops·bottoms) — 파스 시점 확정 후 불변(감산 없음): 게이트(top ≡ tops>0)·거울 생성(bottom ≡ bottoms>0)·카운트 워드가 등록값 그대로다. 천장 스킵(스윕 가능분)·방출 유실 니들은 계수에 남아 left가 0에 못 닿으므로 ONE은 그 코너에서 조기종료 대신 완주한다(발화 무손 안전 강하, 전이 백스톱과 동일 계약 — 자유탑 회수는 스윕 면제라 미계수, 그 코너의 조기종료는 보존) · 등록 ≥ 생존이라 게이트는 생존 니들 존재 시 항상 점등
			for (let i = 0, path, wild; i < prefix.length && i < 0x7FFFFF; i++) {
				path = prefix[i]; if (!path) continue;
				let low = 0, high = path.length, topStar = path.charCodeAt(0) === 42; if (topStar) { low = 1; if (low >= high) continue; } // 앞 별 = low 오프셋(슬라이스 없이 범위로)
				const ce = path.charCodeAt(high - 1); wild = topStar || path.charCodeAt(low) === 45 || ce === 45 || ce === 42; if (!wild) for (let n = low + 1; n < high; n++) if (path.charCodeAt(n) === 45 && path.charCodeAt(n - 1) === 45) { wild = true; break; } // 별·앞뒤 하이픈·빈 세그 중 하나라도 있으면 와일드
				if (wild) {
					const bottomStar = ce === 42; if (bottomStar) { high--; if (low >= high) continue; } // 뒤 별 = high 오프셋
					let totalDepth = 1; for (let n = low; n < high; n++) if (path.charCodeAt(n) === 45) totalDepth++; // 세그 수 = 하이픈 수 + 1 (parts·length 변수 없이 직접)
					let topChars = 0, topDepth = 0; if (!topStar && path.charCodeAt(low) !== 45) for (let j = low; ;) { while (j < high && path.charCodeAt(j) !== 45) j++; topDepth++; if (j === high || j + 1 === high || path.charCodeAt(j + 1) === 45) { topChars = j - low; break; } j++; } // 앞 연속 고정 세그 길이
					let bottomChars = 0, bottomDepth = 0; if (!bottomStar && path.charCodeAt(high - 1) !== 45) for (let j = high - 1; ;) { while (j >= low && path.charCodeAt(j) !== 45) j--; bottomDepth++; if (j === low - 1 || j === low || path.charCodeAt(j - 1) === 45) { bottomChars = high - 1 - j; break; } j--; } // 뒤 연속 고정 세그 길이, 거꾸로
					const topCode = arena.length; for (let n = 0; n < topChars; n++) arena.push(path.charCodeAt(low + n));
					const bottomCode = arena.length; for (let n = 0; n < bottomChars; n++) arena.push(path.charCodeAt(high - bottomChars + n));
					let midCount = 0, over = 0, stop = totalDepth - bottomDepth; for (let n = topDepth, start = low + (topChars ? topChars + 1 : 0); n < stop; n++) { let end = start; while (end < high && path.charCodeAt(end) !== 45) end++; const length = end - start; if (length) { if (length > 0x3FF) { hits |= 4; over = 1; } arena.push((n << 10) | length); for (let k = 0; k < length; k++) arena.push(path.charCodeAt(start + k)); midCount++; } start = end + 1; } // 가운데 고정 세그 path 직접 스캔, 세그 인덱스 n 동행 — [(n<<10)|length, 글자…] 적재
					if (arena.length === topCode) continue; // 고정 세그가 하나는 있어야 한다: topCode 이후 아레나 무성장 = 탑·바닥·미드 전무(단일 비교 판정) — *·-만으로는 좌표를 가리킬 수 없으니 자연 무시 (* 단독 거부의 일반형)
					let hash; if (bottomChars) { hash = bottomChars + 1; for (let q = 0; q < bottomChars; q++) hash = ((hash * 31) ^ arena[bottomCode + q]) & 0x7F; hash = ((hash * 31) ^ 32) & 0x7F; } else if (topChars) { hash = ((topChars + 1) * 31 ^ metaCode) & 0x7F; for (let q = 0; q < topChars; q++) hash = ((hash * 31) ^ arena[topCode + q]) & 0x7F; } else hash = (31 ^ metaCode) & 0x7F; if (totalDepth > 63) hits |= 1; if (topChars > 0x1FFF || bottomChars > 0x1FFF) hits |= 2; // 군집 확정(arena 범위비교) 앞 정수 게이트용 7비트 지문 — 니들 글자(arena)+경계 문자(끝고정 ' '·앞고정 '_')을 문자열 없이 직접 롤(계층 prefix는 중간이 변별점이라 길이·첫·끝만으론 약함), 같은 니들은 같은 hash = false-negative 0
					wilds.push((i << 9) | (hash << 2) | (topStar ? 0x1 : 0) | (bottomStar ? 0x2 : 0), (topChars << 19) | (bottomChars << 6) | midCount, (topCode << 6) | totalDepth); // 3레인: ⓪index·hash7·별(top/bot) ①topChars·bottomChars·midCount ②topCode·totalDepth — 슬라이드 닻 메타(fixChars·topGap·midLast·fixFirst/Last·fixMid)는 레인이 아니라 pack 미드블록(상주 codes)에서 슬라이드 빌드 시 도출(중복 사본 제거) · 콜드 전용 오프셋 파생: bottomCode = topCode + topChars, midCode = topCode + topChars + bottomChars(아레나 top→bottom→mid 연속)
					if (totalDepth > 63 || over || topChars > 0x1FFF || bottomChars > 0x1FFF) { wilds.length -= 3; if (topChars) { if (bottomChars) bottoms++; else tops++; } } /* 천장 밖 회수: 깊이63·세그1023·앵커8191 초과 니들은 레인 되돌려 등록 생략 — 별칭 오발화 대신 조용한 불발. 초과 사실은 포화 니블(루트 8-5)에 이미 기록됨, 판독 jump[1]>>>5&0xF · 스윕 패리티: 스윕 가능(topChars≥1) 회수 니들은 진영 계수 유지(결제 가능한 니들은 계수에 있다 — ONE 감산 균형), 자유탑은 스윕 면제라 미계수 */ else if (!bottomChars && !topChars) slides.push(wilds.length - 3); else if (bottomChars) bottoms++; else tops++; // 닻 위치로 분류: 바닥 고정은 거울 가지(위 블록까지 흡수), 위 고정은 정방향 가지(미드까지 흡수), 양끝 열린 가운데 고정만 슬라이드로 — 바닥 우선: 계층 키는 위가 공유되고 아래가 분기하므로 바닥 니들이 더 적게 걸린다 (탑 우선보다 적게 걸려 유리, 수치는 벤치 가이드)
				} else { literals.push(i); }
			}
			// 빌드는 arena(전 코드·좌표·length, 0~65535)를 직접 읽는다 · 상주는 codes = pack이 만든 슬라이드 앵커 영역 압축본이라 arena 풀 적재 불요
			const wildCount = wilds.length / 3, pillar = new Int32Array(wilds.length), order = new Int32Array(wildCount), bucketBase = wildCount << 1, mask = (wildCount ? 1 << (31 - Math.clz32(wildCount)) : 1) - 1; // 군집 적재 — 같은 (니들, c1, hash) 와일드를 pillar에 인접시킨다 · 발화 동률 계약: depth 동률은 와일드 등록순(= 군집 순서) — 쌍대 전방수집 O(n²)를 니들 해시 체인 기대 O(n)로 대체: 크기(0~n)·체인(n~2n)·버킷(2n~2n+B, B = n 이하 2제곱) 장부 전부 pillar 스크래치 0-fill 재해석(빈 = 0)이라 추가 할당 0
			for (let i = 0; i < wildCount; i++) { const s = i * 3, c1 = wilds[s + 1], h0 = wilds[s] & 0x1FC, counts = c1 >>> 6, topChars = c1 >>> 19, bottomChars = (c1 >>> 6) & 0x1FFF, length = bottomChars ? bottomChars : topChars, offset = bottomChars ? topChars : 0, a = (wilds[s + 2] >>> 6) + offset; let hash = length + 1; for (let k = 0; k < length; k++) hash = ((hash * 31) ^ arena[a + k]) | 0; const bucket = bucketBase + ((hash ^ counts ^ h0) & mask); let h = pillar[bucket] - 1; walk: for (; h !== -1; h = pillar[wildCount + h] - 1) { const t = h * 3; if ((wilds[t + 1] >>> 6) !== counts || (wilds[t] & 0x1FC) !== h0) continue; const b = (wilds[t + 2] >>> 6) + offset; for (let k = 0; k < length; k++) if (arena[a + k] !== arena[b + k]) continue walk; break; } if (h === -1) { pillar[wildCount + i] = pillar[bucket]; pillar[bucket] = i + 1; h = i; } order[i] = h; pillar[h]++; } // 등록순 1패스 — 니들 롤이 버킷 키(파스 7비트 지문과 같은 시드 길이+1·×31·XOR 레시피의 풀폭판 — 리더 전체 믹싱 레시피 단일화, 외부 상수 0), 같은 버킷의 군집 머리 체인만 술어(c1>>>6 → 7비트 hash 프리필터 → 앵커 글자)로 직비교: 머리 부재면 자신이 새 머리로 prepend — order[i] = 소속 머리, pillar[머리] = 군집 크기
			for (let i = 0, base = 0; i < wildCount; i++) if (order[i] === i) { const size = pillar[i]; pillar[i] = base; base += size; } // 머리 등장순(등록순) 프리픽스 — 군집별 pillar 시작 오프셋
			for (let j = 0; j < wildCount; j++) order[j] = pillar[order[j]]++; // order 확정 — 등록순 순회가 같은 군집에 연속 슬롯을 부여(스크래치 범프)
			for (let j = 0; j < wildCount; j++) { const e = order[j] * 3, s = j * 3; pillar[e] = wilds[s]; pillar[e + 1] = wilds[s + 1]; pillar[e + 2] = wilds[s + 2]; } // 기둥 적재 — order 전단사가 3n워드 전부를 덮어써 스크래치 소거, 이후 파이프라인(slides 재사상·trie 빌드) 불변
			for (let k = 0; k < slides.length; k++) slides[k] = order[slides[k] / 3] * 3; // slides는 기둥 오프셋 목록 — 군집 순서로 재사상
			// 리터럴 니들은 prefix[literals[x]] 직독(평행 배열 불요) — 인덱스만 보관, 캐시 비적재
			/* 와일드 임시 객체 뷰 제거 — 기둥(pillar)을 패스별로 직접 디코드 (lane: 0 index|flags, 1 topChars|bottomChars|midCount, 2 topCode|totalDepth; bottomCode=topCode+topChars, midCode=topCode+topChars+bottomChars) — 빌드 산물 비트동일·핫·상주 무영향, room+mask 프리패스 융합으로 기둥 1회 통과 */
			let jump = null, verify = null; if (literals.length || tops || bottoms) { // 한 trie의 두 가지: 리터럴·위고정은 정방향, 끝고정은 거울 가지 — 레코드마다 양끝에서 한 번씩 걷는다
				let repeats = null; let room = 2, mask = 0; for (let x = 0; x < literals.length; x++) { const needle = prefix[literals[x]], length = needle.length, c0 = needle.charCodeAt(0); if (c0 <= 32) mask |= 1 << c0; room += c0 < 256 ? 1 : 2; for (let n = 1; n < length; n++) { const c = needle.charCodeAt(n); room += c < 256 ? 1 : 2; } } for (let w = 0; w < pillar.length; w += 3) { const c1 = pillar[w + 1], topChars = c1 >>> 19, bottomChars = (c1 >>> 6) & 0x1FFF, topCode = (pillar[w + 2] >>> 6), bottomCode = topCode + topChars; if (bottomChars) { for (let n = 0; n < bottomChars; n++) { const c = arena[bottomCode + n]; room += c < 256 ? 1 : 2; } } else if (topChars) { const c0 = arena[topCode]; if (c0 <= 32) mask |= 1 << c0; room += c0 < 256 ? 1 : 2; for (let n = 1; n < topChars; n++) { const c = arena[topCode + n]; room += c < 256 ? 1 : 2; } } }
				let seal = 256; if (bottoms) for (let b = 1; b < 32; b++) if (!(mask & (1 << b))) { seal = b; break; } // 거울 입구 심볼: 정상 키 문자(>32)·분해 상위심볼(≥256)이 못 닿는 1~31 중에서 정방향 첫 바이트와 안 겹치는 빈 칸 — 스트림 워크 누수 없음. 1~31이 다 차는 병적 패턴만 256 폴백
				const tree = new Int32Array(room * 4); for (let i = 0; i < room; i++) tree[i * 4] = -1; let heads = null; // 노드 기록 stride4 (한 노드 = 인접 4칸, 캐시라인당 4): +0 link(첫 자식, 없으면 -1) · +1 (byte << 23) | (next + 1)(형제, 0 = 없음) · +2 payload(리터럴 종단 = (깊이 << 24) | (index+1) 양수 · 와일드 체인 머리 = ~head 음수 · 둘 다인 노드는 +2 = term 양수 두고 heads 사이드맵에 head) · +3 base · next는 +1 인코딩이라 -1 형제 = 0 = 기본값, link만 초기화
				const chain = [0], back = [0], tail = [0], records = [0x42454154]; /* verify 시드 셀 승급: "BEAT" ASCII — 미참조 실증 셀의 덤프 자기서술 태그 */
				let nodes = 1, span = 0; const put = (node, c) => { let e, n; if (c >= 256) { const b = (c >> 8) + 256; if (b > span) span = b; n = -1; const head = tree[node * 4]; for (e = head; e !== -1; ) { const w = tree[e * 4 + 1]; if ((w >>> 23) === b) { n = e; break; } e = (w & 0x7FFFFF) - 1; } if (n === -1) { n = nodes++; tree[n * 4 + 1] = (b << 23) | ((head + 1) & 0x7FFFFF); tree[node * 4] = n; } node = n; c &= 0xFF; } if (c > span) span = c; n = -1; const head = tree[node * 4]; for (e = head; e !== -1; ) { const w = tree[e * 4 + 1]; if ((w >>> 23) === c) { n = e; break; } e = (w & 0x7FFFFF) - 1; } if (n === -1) { n = nodes++; tree[n * 4 + 1] = (c << 23) | ((head + 1) & 0x7FFFFF); tree[node * 4] = n; } return n; };
				const note = (w, origin, prepend) => { const index = pillar[w] >>> 9, c1 = pillar[w + 1], topChars = c1 >>> 19, bottomChars = (c1 >>> 6) & 0x1FFF, topCode = (pillar[w + 2] >>> 6), midCode = topCode + topChars + bottomChars, midCount = c1 & 0x3F; if (prepend && topChars > 0x3FF) return -1; if (records.length > 0x7FFFFF) return -2; const head = records.length, blocks = (prepend ? 1 : 0) + midCount; records.push((index << 9) | blocks); if (prepend) records.push((origin << 26) | (arena[topCode] << 10) | topChars); let offset = midCode; for (let m = 0; m < midCount; m++) { const cell = arena[offset], target = cell >> 10, length = cell & 0x3FF; records.push(((origin < 0 ? target : origin - target) << 26) | (arena[offset + 1] << 10) | length); offset += 1 + length; } if (prepend) for (let i = 1; i < topChars; i += 2) records.push(arena[topCode + i] | (i + 1 < topChars ? arena[topCode + i + 1] << 16 : 0)); offset = midCode; for (let m = 0; m < midCount; m++) { const length = arena[offset] & 0x3FF, cursor = offset + 1; for (let i = 1; i < length; i += 2) records.push(arena[cursor + i] | (i + 1 < length ? arena[cursor + i + 1] << 16 : 0)); offset += 1 + length; } return head; }; // 와일드 종단 체인 빌드 임시(링크드: chain = star부호|redirect|(payload<<6)|totalDepth — depth 저단 6비트: 레벨 게이트가 엔트리당 최다 판독이라 말단 1연산(& 0x3F) 배치, payload는 발화 엔트리만 판독(>>>6) — 최종 chain 워드 그대로, back = 같은 앵커의 이전 머리 — prepend 등록이라 역링크) — 최종 chain은 연속 블록, 비트30이 블록 끝 · verify head 비트6 = 예약(항상 0) · blocks는 구조상 62 이하(계약 깊이 63)라 비트6 침범 불가) · block = target(6)|첫글자(16)|length(10) — 글자 = UTF-16 코드유닛(charCodeAt 단위, 서로게이트 쌍은 2로 계수 — 길이·앵커 캡 전부 유닛 기준), target은 깊이 천장 63(arena 팩과 동일 6비트), 첫 글자 탑재로 첫 비교가 로드 없는 블록 마스크·글자 스트림은 char1 기점 2-pack(홀수 길이 블록당 워드 1 소멸, 길이-1은 글자 워드 0)
				for (let x = 0, needle, length, node; x < literals.length; x++) { needle = prefix[literals[x]]; length = needle.length; if (nodes + length * 2 > 0x7FFFFB - scratch) { hits |= 8; continue; } /* 예산 = 최대 base 0x7FFFFE − 헤더 3(루트2+카운트1) − scratch · 글자당 hi·lo 최악 2노드 */
				node = 0; let depth = 1; for (let i = 0; i < length; i++) { const c = needle.charCodeAt(i); node = put(node, c); if (c === 45) depth++; } if (tree[node * 4 + 2] > 0) { if (!repeats) repeats = {}; let e = repeats[node]; if (!e) e = repeats[node] = { depth, list: [] }; e.list.push(literals[x]); } else tree[node * 4 + 2] = ((depth & 0x3F) << 24) | (literals[x] + 1); } // 256 이상 문자는 [재배치 상위심볼, 하위바이트] 두 심볼로 분해 — 상위심볼은 (c>>8)+256, 경로 비충돌은 문자검사·base 유일성과 위상 분리(상위 뒤엔 하위 자식뿐)가 보장 · 중복 리터럴(같은 needle)은 리터럴 depth 세어 chain depth-게이트 엔트리로 흡수
				for (let w = 0, node; w < pillar.length; w += 3) { const c0 = pillar[w], c1 = pillar[w + 1], topChars = c1 >>> 19, bottomChars = (c1 >>> 6) & 0x1FFF; if (bottomChars || !topChars) continue; if (nodes + topChars * 2 > 0x7FFFFB - scratch) { hits |= 8; continue; } const p2 = pillar[w + 2], topCode = p2 >>> 6, midCount = c1 & 0x3F, totalDepth = p2 & 0x3F, index = c0 >>> 9, bottomStar = (c0 & 0x2) !== 0; node = 0; for (let i = 0; i < topChars; i++) node = put(node, arena[topCode + i]); if (midCount) { const head = note(w, -1, false); if (head < 0) { hits |= 8; continue; } chain.push((bottomStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | (totalDepth & 0x3F)); } else chain.push((bottomStar ? 0x80000000 : 0) | (index << 6) | (totalDepth & 0x3F)); const payload = tree[node * 4 + 2]; back.push(payload < 0 ? ~payload : ((heads && heads[node]) || 0)); const entry = chain.length - 1; if (payload > 0) { if (!heads) heads = {}; heads[node] = entry; } else tree[node * 4 + 2] = ~entry; } // 위 고정 닻을 정방향 가지에 — 미드가 있으면 미드 블록을 탑기준 오름차순 verify 레코드로 만들고 체인엔 redirect 비트 엔트리(게이트=부호+depth, payload=레코드 head)를, 없으면 단순 발화 엔트리(payload=index)를
				let mirror = 0; if (bottoms) { mirror = nodes++; tree[mirror * 4 + 1] = (seal << 23) | ((tree[0] + 1) & 0x7FFFFF); tree[0] = mirror; if (seal > span) span = seal; } // 거울 가지의 입구: mirror은 키 문자(>32) 아래 제어 대역의 빈 칸이라 정방향 자식과 안 겹친다 (값 선정은 위 mask 루프)
				for (let w = 0, node; w < pillar.length; w += 3) { const c0 = pillar[w], c1 = pillar[w + 1], topChars = c1 >>> 19, bottomChars = (c1 >>> 6) & 0x1FFF; if (!bottomChars) continue; if (nodes + bottomChars * 2 > 0x7FFFFB - scratch) { hits |= 8; continue; } const p2 = pillar[w + 2], topCode = p2 >>> 6, bottomCode = topCode + topChars, midCount = c1 & 0x3F, totalDepth = p2 & 0x3F, index = c0 >>> 9, topStar = (c0 & 0x1) !== 0; node = mirror; for (let i = bottomChars - 1; i >= 0; i--) node = put(node, arena[bottomCode + i]); if (topChars || midCount) { const head = note(w, totalDepth - 1, topChars > 0); if (head < 0) { hits |= head < -1 ? 8 : 4; continue; } chain.push((topStar ? 0x80000000 : 0) | 0x20000000 | (head << 6) | (totalDepth & 0x3F)); } else { chain.push((topStar ? 0x80000000 : 0) | (index << 6) | (totalDepth & 0x3F)); } const payload = tree[node * 4 + 2]; back.push(payload < 0 ? ~payload : 0); tree[node * 4 + 2] = ~(chain.length - 1); } // 끝 고정 닻을 글자 역순으로 거울 가지에 — 위/미드 블록이 있으면 키 내림차순 verify 레코드([(index<<9)|blocks, 세그<<16|길이…, 글자…], 정방향과 동일 문법)로 만들고 체인엔 redirect 비트 엔트리를, 없으면 단순 발화 엔트리를 · 거울 서브트리엔 리터럴 종단이 존재할 수 없다(리터럴은 센티널 없이 루트에서 삽입, 센티널은 제어대역·분해심볼은 ≥257이라 비충돌) — payload는 0 또는 음수(~entry)뿐이라 정방향의 heads 사이드맵 분기가 불요, 무조건 ~entry 기록
				const capacity = nodes * 4 + span + 4 + scratch, roots = new Int32Array(span + 2); let seen = new Uint8Array(capacity), bases = new Uint8Array(capacity), hint = new Int32Array(capacity); // capacity은 초기 추정치 — 마크 초과 시 아래서 재성장(seen·bases·hint 동일 패턴) · base 유일성 스킵으로 b가 used+1을 넘을 수 있어 재성장이 정확층 · hint[f] = f 너머 빈 슬롯 도약(경로 분할) — 슬롯은 단조 사용이라 도약 구간이 영원히 유효, 빈 슬롯을 건너뛰지 않는다
				let used = 1; for (let s = 0; s < nodes; s++) { const e = tree[s * 4]; if (e === -1) continue; const symbol = tree[e * 4 + 1] >>> 23; tree[s * 4 + 3] = roots[symbol]; roots[symbol] = s + 1; } // 배치 순서를 심볼 큰 것부터로. roots = 심볼별 노드 체인 머리 전용 배열(span+2) — 링크는 base 필드(배치 전 빔)에 임시 저장, 배치가 s를 처리하며 base로 덮어쓴다 (next 먼저 읽어 충돌 없음) · 머리·next를 s+1로 담아 0-fill을 곧 빈칸으로 읽으니(hint lazy 관습과 통일, 노드 인덱스는 항상 s+1≥1이라 0과 안 겹침) 별도 -1 초기화 루프가 없다
				for (let symbol = span; symbol >= 0; symbol--) for (let h = roots[symbol], next; h !== 0; h = next) { const s = h - 1; next = tree[s * 4 + 3]; const e0 = tree[s * 4], w0 = tree[e0 * 4 + 1], d0 = (w0 >>> 23) + 1, held = tree[s * 4 + 2] !== 0; let b; outer: for (let f = d0 + 2 + scratch; ; f++) { while (f < seen.length && seen[f]) { const q = hint[f] || f + 1; if (q < seen.length && seen[q]) hint[f] = hint[q] || q + 1; f = q; } b = f - d0; if (bases[b]) continue; if (held && seen[b + 1]) continue; for (let e = (w0 & 0x7FFFFF) - 1; e !== -1; ) { const w = tree[e * 4 + 1]; if (seen[b + (w >>> 23) + 1]) continue outer; e = (w & 0x7FFFFF) - 1; } break; } tree[s * 4 + 3] = b; if (b >= bases.length) { const g = new Uint8Array(b * 2); g.set(bases); bases = g; } bases[b] = 1; if (held) { const r = b + 1; if (r >= seen.length) { const g = new Uint8Array(r * 2); g.set(seen); seen = g; const h = new Int32Array(r * 2); h.set(hint); hint = h; } seen[r] = 1; if (r > used) used = r; } for (let e = e0; e !== -1; ) { const w = tree[e * 4 + 1], t = b + (w >>> 23) + 1; if (t >= seen.length) { const g = new Uint8Array(t * 2); g.set(seen); seen = g; const h = new Int32Array(t * 2); h.set(hint); hint = h; } seen[t] = 1; if (t > used) used = t; e = (w & 0x7FFFFF) - 1; } }
				for (let s = 0; s < nodes; s++) { if (tree[s * 4] !== -1 || tree[s * 4 + 2] === 0) continue; let f = 3 + scratch; for (;;) { while (f < seen.length && seen[f]) { const q = hint[f] || f + 1; if (q < seen.length && seen[q]) hint[f] = hint[q] || q + 1; f = q; } if (!bases[f - 1]) break; f++; } const b = f - 1; tree[s * 4 + 3] = b; if (b >= bases.length) { const g = new Uint8Array(b * 2); g.set(bases); bases = g; } bases[b] = 1; if (f >= seen.length) { const g = new Uint8Array(f * 2); g.set(seen); seen = g; const h = new Int32Array(f * 2); h.set(hint); hint = h; } seen[f] = 1; if (f > used) used = f; } // 리프 종단의 기록용 base — 재성장은 seen·hint 동반(불변식 seen.length == hint.length, 본루프 재성장과 대칭 · 이식 시 범위 밖 접근 의존 제거) · 자식이 없어도 기록 한 칸(base+1)은 갖는다 · bases 등록은 의무: base 유일성이 타 노드의 기록 오독을 막는 방어선
				const size = used + 2, depthCounts = chain.length > 1 || repeats ? new Int32Array(64) : null; jump = new Int32Array(size + 1); // 표는 실제 배치된 최대 슬롯까지만(used가 곧 최대 슬롯) — 어휘 밖 스트림 문자는 raw·hi·lo 전 팔에서 범위 밖 로드의 undefined | 0 = 0이 빈 칸 의미로 흡수 (가드판 대비: 정상 와일드는 |0이 빠르고 적대 입력에서만 처리·오염이 늘어, 적대가 트래픽 과반이 아닌 한 |0 우세, 수치는 벤치 가이드)
				for (let s = 0; s < nodes; s++) { const payload = tree[s * 4 + 2], base = tree[s * 4 + 3], terminal = payload > 0 ? payload : 0, repeat = repeats && repeats[s]; let h = payload < 0 ? ~payload : ((heads && heads[s]) || 0); if (h || repeat) { const start = tail.length; let low = 63, high = 0, total = 0; if (terminal) { const d = terminal >>> 24; depthCounts[d]++; total++; if (d < low) low = d; if (d > high) high = d; } for (let e = h; e; e = back[e]) { const d = chain[e] & 0x3F; depthCounts[d]++; total++; if (d < low) low = d; if (d > high) high = d; } if (repeat) { depthCounts[repeat.depth & 0x3F] += repeat.list.length; total += repeat.list.length; } for (let d = low + 1; d <= high; d++) depthCounts[d] += depthCounts[d - 1]; for (let i = 0; i < total; i++) tail.push(0); if (repeat) for (let z = repeat.list.length - 1; z >= 0; z--) tail[start + --depthCounts[repeat.depth & 0x3F]] = (repeat.list[z] << 6) | (repeat.depth & 0x3F); for (; h; h = back[h]) tail[start + --depthCounts[chain[h] & 0x3F]] = chain[h]; if (terminal) tail[start + --depthCounts[terminal >>> 24]] = ((((terminal & 0xFFFFFF) - 1)) << 6) | (terminal >>> 24); for (let d = low; d <= high; d++) depthCounts[d] = 0; tail[tail.length - 1] |= 0x40000000; if (size + start > 0x7FFFFF) { hits |= 8; if (terminal) jump[base + 1] = (terminal & 0xFFFFFF) << 9; } else jump[base + 1] = ((size + start) << 9) | (terminal ? 0x21 : 0x20); } else if (terminal) jump[base + 1] = (terminal & 0xFFFFFF) << 9; for (let e = tree[s * 4]; e !== -1; ) { const w = tree[e * 4 + 1], symbol = w >>> 23; const childBase = tree[e * 4 + 3] + 1; if (childBase > 0x7FFFFF) hits |= 8; else jump[base + symbol + 1] = (childBase << 9) | symbol; e = (w & 0x7FFFFF) - 1; } } // 종단 기록: 주소 = jump[base+1](c=0 자식 자리) 하나, 로드 하나 — 심볼이 태그: 0x20 = (체인시작<<9)|0x20(size+start 절대오프셋 23, 선두가 와일드), 0x21 = 0x20+종단-전용 리터럴 비트(경계 워크가 심볼 비트0로 +1 건너뜀, 종단 워크는 start부터 읽어 발화), 0 = 단일 리터럴 (index+1)<<9(직발화, index+1 23비트 = 가족 천장 −1, 실효 한계는 trie 슬롯이라 무영향) · NUL·공백은 좌표에 불가라 두 심볼 모두 전이가 못 갖는 값 — 빈 칸·squatter와 심볼 비교로 구별, 타 기록과는 bases의 base 유일성으로 불충돌 · 공존 노드는 대표 리터럴이 체인 첫 엔트리(level 최소)이고 심볼=0x21로 표식 — 정확 종단에서만 발화하는 리터럴이 경계마다 헛돌던 비용을 경계 워크가 비트0 +1로 건너뛰어 제거, 종단 워크만 start부터 읽어 발화(종단 전체일치에서 게이트 항상 참) · 블록은 depth 64버킷 안정 분배(동률 = 리터럴 → 와일드 등록순 → 중복 등록순): 역순 순회 + 감소 배치가 안정을 만들고, prepend 체인의 자연 워크(역등록순)가 그 요구 순서와 일치해 반전·비교정렬·임시버퍼 없이 tail 직접 배치, 전 블록 결정적 O(k) — counts(64 = depth 키 공간)는 체인·중복 존재 시에만 생성(크기 아닌 존재의 형식 조건), 터치 깊이 구간만 재영점 · 중복은 정의상 같은 노드에 같은 depth의 리터럴 종단이 선존재(repeats 생성 조건 = payload>0)라 터미널이 이미 그 d로 low·high를 덮음 — repeat 기여는 counts·total만 — 발화 규칙 '범위 바깥→안'(좌표가 왼쪽부터 읽히는 순서), 워크는 level > depth에서 조기탈출(잔여 전부 발화 불능)
				const mirrorBase = mirror ? tree[mirror * 4 + 3] + 1 : 0; if (mirrorBase > 0x7FFFFF) hits |= 8; jump[1] = ((tree[3] + 1) << 9) | (tops ? 0x1 : 0); jump[0] = mirrorBase && mirrorBase <= 0x7FFFFF ? ((mirrorBase << 9) | seal) : 0; if (tail.length > 1) { const J = new Int32Array(size + tail.length + 1); J.set(jump); J.set(tail, size); jump = J; } jump[2 + scratch] = ((literals.length + tops) << 9) | 0x100; jump[jump.length - 1] = (bottoms << 9) | 0x100; // ONE 가지 카운트 = 전방 방벽 셀(2 + 스크래치, 독약 내장이라 미주행 전이 방벽 겸무 = 여유 비용 0) + 꼬리 1셀 — 기입식 카운트(23비트) << 9 | 0x100: 독약 심볼 256은 전이 비교 도달 불가 유일값(raw·lo ≤ 255, hi ≥ 257)이라 카운트 셀 오독이 구조적 0, 체인 워크는 종단 플래그로 그 앞에서 멈춘다 · 레이아웃 = [루트 2셀 | fire-once 전방 편승 셀 ceil(P/32)개 | 방벽 = 카운트A(독약 내장) | 트라이·체인 | 카운트B] — 편승 셀은 베이스 하한 아래라 미주행 전이 도달 불가(독약 불요): 편승 셀도 같은 독약(하위 9비트 0x100)이라 오독 방어가 동일 증명으로 성립, 카운트 셀 주소(length-2·length-1)는 불변
				if (records.length > 1) verify = Int32Array.from(records); // 팩 마무리: 거울 루트(셀 직산 ((base+1)<<9)|seal) + 단순·확장 체인을 jump 꼬리에 병합 적재(size+start 절대오프셋) · 체인 엔트리 없으면 병합 생략 — 순수 리터럴은 심볼=0 직발화라 체인 미접근, 0x20/0x21 셀은 tail.push가 선행이라 병합 영역과 공존 불가 — 워크 전이가 t = base + c로 끝난다 · 9/23 팩(검증 = 전이 심볼 9비트, base 23비트): base 유일성으로 (t, 심볼)이 부모를 유일 결정 — 종단 기록 = jump[base+1] 한 주소·심볼 태그(0x20 = 체인, 0 = 단일 직발화 — 평행 배열 없음), 전멸 블록은 첫 엔트리의 level>depth 탈출이 1로드에 끊는다 · 발화 순서 계약: 레코드는 스트림 등장순, 한 좌표의 다중 발화는 depth 오름차순 '범위 바깥→안'(동률 = 리터럴 → 와일드 등록순 → 중복 등록순), IN은 레코드 등장순(같은 레코드 다중 발화는 리터럴 먼저·이어 와일드 군집 등록순), ONE은 그 열의 니들별 첫 발화 부분열(전원 해소 시 즉시 종료) — 모드 간 순서는 설계상 비동치 · chain 6/23: depth 게이트 = 패턴 깊이 63(.NET JSON 기본 MaxDepth=64 동급), payload 23 = records head·index · c0 = (index<<9)|(hash<<2)|별플래그, record = (index<<9)|예약(비트6=0)|blocks(6) — 9/23 정렬 — 시스템 한계 = 23비트 가족(chain payload·base) = 명목 838만, 실효는 trie 크기(프리픽스×니들 글자 ≤ 838만 슬롯)가 묶는다
			}
			let slide = null, pack = null; if (slides.length) { pack = []; slide = new Int32Array(slides.length * 4 + (jump ? 0 : scratch)); let d = 0; for (let k = 0; k < slides.length; k++) { if (pack.length > 0x7FFFFF) { hits |= 8; slide[6] |= 0x100; continue; } const w = slides[k], p0 = pillar[w], p2 = pillar[w + 2], topCode = p2 >>> 6, fixCell = arena[topCode], fixCode = topCode + 1, fixChars = fixCell & 0x3FF, topGap = fixCell >> 10, totalDepth = (p2 & 0x3F), midRest = (pillar[w + 1] & 0x3F) - 1; slide[d] = (arena[fixCode] << 16) | arena[fixCode + fixChars - 1]; slide[d + 2] = (pack.length << 9) | (totalDepth - topGap); slide[d + 3] = (fixChars << 22) | ((fixChars < 2 ? 0 : fixChars - 2) << 12) | (midRest << 6) | topGap; for (let i = fixCode + 1; i < fixCode + fixChars - 1; i++) pack.push(arena[i]); let offset = fixCode + fixChars, midLast = topGap; for (let i = 0; i < midRest; i++) { const cell = arena[offset], length = cell & 0x3FF; midLast = cell >> 10; pack.push(cell); for (let j = 1; j <= length; j++) pack.push(arena[offset + j]); offset += 1 + length; } const bottomGap = totalDepth - 1 - midLast; slide[d + 1] = (p0 & ~0x1FF) | (bottomGap << 3) | ((p0 & 0x2) && bottomGap === 0 ? 0x4 : 0) | (p0 & 0x3); d += 4; } if (d !== slides.length * 4) slide = slide.subarray(0, d + (jump ? 0 : scratch)); } if (jump) jump[1] |= hits << 5; else if (slide && hits) slide[2] |= ((hits & 1) << 7) | ((hits & 4) << 6); /* jump 부재 캐시의 포화 분관: s2 레인0 [7] 깊이·[8] 세그(슬라이드는 앵커 무관) */
			const codes = pack && Uint16Array.from(pack); cache = { jump, verify, slide, codes }; BEAT.CACHE.set(prefix, cache); // 캐시는 핫이 읽는 필드만 평탄 적재 — trie 중첩 제거로 간접 1칸·객체 헤더 회피 · slide = 미드 닻 4레인 압축본(slides 목록 → 압축) — 미드 없으면 slide=null(lanes 선계산이 0이라 슬라이드 루프 미진입) · 레인 0 fixFirst·fixLast / 1 index[31:9]·bottomGap[8:3]·open[2]·별[1:0] / 2 fixMid[31:9]·빈[8:6]·(totalDepth-topGap)[5:0] / 3 fixChars[31:22]·shift[21:12]·midRest[11:6]·topGap[5:0] — codes(상주) = 슬라이드 fix앵커 중간글자 + 미드블록 압축본(pack) — 트라이 와일드 글자는 jump/verify에, fix앵커 첫·끝은 s0(fixFirst/Last)에 있어 핫이 codes에서 안 읽으므로 제외(단일 진실 — codes엔 codes에서 읽는 글자만), fixMid = pack 내 중간글자 시작 오프셋(중간이 미드블록 바로 앞에 깔림) · 핫 미드 디코드 offset = fixMid + shift(s3[21:12] 선계산 = fixChars<2?0:fixChars-2) = [packed target|length, 글자…] 연속 시작 — fixMid가 중간 시작이라 fixChars=1(중간0)이면 shift=0이라 fixMid가 곧 미드 시작, 빌드 선계산이라 핫엔 분기 없음, 세그 시작 = topGap=codes[topCode](미드 닻 midCount≥1) · 슬라이드 메타(fixChars·topGap·midLast·fixFirst/Last·fixMid)는 codes 미드블록에서 도출 — 중복 레인 제거, pillar 3레인 · s2 하위6 = totalDepth-topGap 선불(핫 slide 바운드가 소비하는 형태 직저장 — depth-이값, 패턴당 불변식을 핫 밖으로 호이스팅, SUB 1회 절감) · 카운트 6비트(깊이≤63) · pillar·slides 비적재(빌드 로컬)
		}
		const slide = cache.slide, jump = cache.jump, lanes = slide ? slide.length - (jump ? 0 : (prefix.length + 31) >> 5) : 0, chain = jump, bottomRoot = jump ? jump[0] : 0, bottomBase = bottomRoot >>> 9, topRoot = jump ? jump[1] : 0, gate = topRoot & 0x1, topBase = topRoot >>> 9, verify = cache.verify, codes = cache.codes; // hybrid: ALL은 경계를 record-top 1회 선계산(전 레코드 발화), IN·ONE은 발화 시점 lazy 계산(비매칭 미발화 skip 유지) · bound 메모 find/bound self-guard 공유 · ke/vs/ve는 bound·to 멱등 · lanes = 슬라이드 바운드 콜당 선계산(slide null이면 0, 위 jump 삼항과 동형)
		let left = 0, topAlive = 0, bottomAlive = 0, midAlive = 0, topWalk = jump, bottomWalk = bottomRoot, midWalk = lanes, spill = null, spillBase = 0, pastStart = -2, pastEnd = -1; // ONE 전용 로컬 — ALL·IN 경로는 전부 불변이라 비트 동일, fire-once 비트는 산물 배열 전방 스크래치에 편승(jump 있으면 jump, 슬라이드 전용이면 slide 꼬리 — 새 객체 0 = 헤더 소멸, 상주 증가는 순수 페이로드 ceil(P/32)셀뿐)하고 spillBase가 그 좌표(jump는 상수 2, 슬라이드 전용은 lanes)고 표지는 루트 비트1 또는 s2 비트6에 동거
			if (one) { const words = (prefix.length + 31) >> 5; if (jump) { topAlive = jump[2 + words] >>> 9; bottomAlive = jump[jump.length - 1] >>> 9; } midAlive = lanes >> 2; left = topAlive + bottomAlive + midAlive; if (!left) return; spill = jump || slide; spillBase = jump ? 2 : lanes; if ((jump ? topRoot & 0x2 : spill[2] & 0x40) === 0) { spill.fill(0, spillBase, spillBase + words); if (jump) jump[1] = topRoot | 0x2; else spill[2] |= 0x40; } else { spill = new Int32Array(words); spillBase = 0; } if (topAlive || bottomAlive) pastStart = -1; } // ONE 콜당 준비 — fire-once 비트는 문턱 없는 균일 전방 편승: 스크래치가 jump[2]부터 트라이 앞에 상주하고 베이스 할당이 그 뒤에서 시작해 전이 로드 t = base + c(c ≥ 0)가 산술적으로 도달 불가 — 독약 불요, 셀당 니들 32개 풀팩(마스크 1 << index — JS 시프트 카운트 5비트 절단 = mod 32 자동, 접점 전부 단일식·분기 0), spillBase = 2 상수 · 표지 = 정방향 루트 비트1(topRoot에 동승이라 검사 로드 0회, 슬라이드 전용은 레인0 s2 비트6)로 클레임 — 중첩 재진입 콜만 콜당 할당으로 강등(정확성 불변), 해제는 finally 단일 지점의 비트 소등(콜백 예외 무누수) · left 초기값 = 방벽 카운트A + 꼬리 카운트B(빌드 분류 루프가 공짜로 적산한 가지 등록 수) + 슬라이드 레인 도출(lanes >> 2), jump 없으면(슬라이드 전용) 탑·바닥 카운트만 구조상 0이고 left는 lanes 몫으로 구성 — ONE의 콜드빌드와 캐시가 ALL·IN과 동일 규격 · 재진입: 표지 비트가 감지해 중첩 콜은 자기만의 워드로 강등되니 동일 프리픽스 재귀도 안전(외부 장부 무접촉, 중복·증발 양모드 실측 통과) · 니들 사망 처리는 아래 탑 전환 스윕이 수행(전환 순간 프리픽스 직접 소등) — 사망은 발화열을 못 바꾸고 left만 앞당긴다
			try { let p = beat.indexOf(M); while (p !== -1) { if (p === 0 || beat.charCodeAt(p - 1) <= 32) break; p = beat.indexOf(M, p + 1); } // 값 안에 박힌 M을 건너뛰고 첫 레코드를 찾는다
		while (p !== -1) { // 모든 레코드를 한 번 훑는다 — ALL(-1)은 미매칭도 index = -1로 발화, IN(0)은 매칭만, ONE(1)은 니들당 첫 매칭만 콜백하고 전원 해소 시 그 자리에서 종료한다
			ms = p + 1; me = beat.indexOf(' ', ms); if (me === -1) break;
			from = beat.indexOf(M, me + 1); while (from !== -1 && beat.charCodeAt(from - 1) > 32) from = beat.indexOf(M, from + 1);
			to = from === -1 ? l : from - 1; ve = to; // 값 끝 선계산 — from이 이미 잡혀 매치 전 확정, ke/vs/ve가 이 to로 값 유무 판정 — bound<to면 콜론 뒤 값, 아니면 key-only (스캔 없는 산술)
				if (!match) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } } // ALL 전 레코드 발화 → 경계 record-top 1회 선계산, 발화지점 재계산 제거 (IN·ONE은 lazy 유지) · 경계 계약: ks=me+1 항상, 콜론(bound<to)이면 ke=bound·vs/ve=콜론 뒤 값, 없으면 ke=to·vs=ve=-1 (콜론 없는 bareword는 노드명=키 → key-only, 값은 서브트리)
			let mark = false, depth = 0, ready = false; // 레코드 깊이는 처음 필요할 때 한 번만 — 발화 게이트들이 공유 · 경계는 bound 메모(find/bound 상태)가 self-guard라 fed 불요 — 레코드당 indexOf 1회 보장
			if (pastStart > -2) { e: { const length = pastEnd - pastStart; if (pastStart >= 0) { let k = 0; while (k < length && beat.charCodeAt(pastStart + k) === beat.charCodeAt(ms + k)) k++; if (k === length && (ms + length === me || beat.charCodeAt(ms + length) === 45)) break e; } let cut = ms; while (cut < me && beat.charCodeAt(cut) !== 45) cut++; if (pastStart >= 0) { const t0 = beat.charCodeAt(pastStart); for (let i = 0; i < prefix.length && i < 0x7FFFFF; i++) { /* 파스와 동일 안전선 — 스윕의 결제 우주 = 파스의 계수 우주 */ if ((spill[spillBase + (i >> 5)] & 1 << i) !== 0) continue; const q = prefix[i]; if (!q) continue; const c0 = q.charCodeAt(0); if (c0 === 42 || c0 === 45 || c0 !== t0) continue; const y = q.length; if (y < length) continue; let k = 1; while (k < length && q.charCodeAt(k) === beat.charCodeAt(pastStart + k)) k++; if (k < length) continue; const b = length < y ? q.charCodeAt(length) : 0; if (b !== 0 && b !== 45 && !(b === 42 && length === y - 1)) continue; spill[spillBase + (i >> 5)] |= 1 << i; const ce = q.charCodeAt(y - 1); let gap = 0; if (ce !== 42 && ce !== 45) for (let g = length + 1; g < y; g++) if (q.charCodeAt(g) === 45 && q.charCodeAt(g - 1) === 45) { gap = 1; break; } if (gap) { if (!--bottomAlive) bottomWalk = 0; } else if (!--topAlive) topWalk = null; if (--left === 0) return; } } pastStart = ms; pastEnd = cut; } } // ONE 탑 전환 스윕 — 첫 세그 교체 = 떠난 탑의 고정 탑 니들 일괄 소등(DFS 불변식: 닫힌 서브트리는 재등장 없음 · 계약: 단일 트리 DFS, 다중 프레임은 프레임 단위 호출) · 전환 순간 프리픽스 직접 스윕: 비용 = 전환 횟수 × P — 트리형 DFS(포맷의 정상 지형)에서 전환은 탑 수라 소규모지만, 퇴화 평탄 스트림(전 레코드가 상이 탑)에선 전환 = 레코드라 레코드 × P로 자람 — 상주 장부 0바이트의 경계 가격, 상태 = 편승 fire-once 셀·pastStart 메모뿐이라 산물 본체 무접촉 · 동일 탑은 cut 선스캔과 메모 갱신 없이 직전 탑 텍스트 직대조 한 루프로 단락(beat 불변이라 pastStart·pastEnd 메모가 그대로 유효, 종결 판정은 ms+length가 me거나 하이픈, ALL·IN은 pastStart = -2 센티널이 검사 1개로 차단), 탑 교체 때만 cut 스캔·스윕·메모 갱신 · 대상 판별 = 고정 첫 글자(탑 고정 ⇔ 첫 문자 고정의 따름정리, 거부 니들 없음: 고정 첫 글자는 전부 등록됨), 가지 구분 = 원문 술어(끝별·끝하이픈 아님 ∧ 빈 세그 보유 = 거울) · 사망은 발화열을 못 바꾸고(죽는 니들은 그 탑 없인 발화 불능) left만 앞당긴다 · 발화分 니들은 fire-once 비트 선게이트로 스킵 = 이중 감쇠 없음 · 니들별 비용은 첫 글자 선게이트(c0 ≠ 떠난 탑 첫 글자 즉시 스킵)가 비트 검사 + 로드 2회로 압축, 전장 비교는 첫 글자 일치 후보만, 첫 세그 == 탑 판정은 경계 문자 1회(탑은 하이픈 무포함이라 전방 일치 후 q[length] ∈ {하이픈, 문자열 끝, 끝별}과 동치 = indexOf 소멸), 가지 구분은 사망 확정 니들 1회 한정으로 탑 이후 구간(length+1부터)의 빈 세그를 charCodeAt 쌍 걷기로 직접 스캔(첫 세그는 탑 텍스트라 하이픈 무포함 = 빈 세그는 그 뒤에만 존재 가능, indexOf 불사용) · t0 = 떠난 탑 첫 유닛 1회 로드 — 게이트들 뒤 제어 종속 위치라 컴파일러가 못 끌어올리는(투기 훗팅 불가) 로드를 손으로 승격, 니들당 로드가 스윕당 1회로
			if (topWalk) { let base = topBase, valid = 1, reach = 0; for (let j = ms, c, t, cell, y; j < me; j++) { c = beat.charCodeAt(j); if (gate && c === 45) { reach++; const end = jump[base] | 0; if ((end & 0x1FE) === 0x20) { let h = (end >>> 9) + (end & 0x1); if (!depth) { depth = reach + 1; for (let g = j + 1; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const link = chain[h], level = link & 0x3F; if (level > depth) break; if (link & 0x20000000) { if (link < 0 || depth === level) { const head = link >>> 6 & 0x7FFFFF, record = verify[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) v: { let cursor = head + 1 + blocks, q = j + 1, segment = reach; for (let i = 0; i < blocks; i++) { const block = verify[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment < target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment++; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== (block >>> 10 & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== verify[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (verify[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --topAlive || (topWalk = null), --left === 0)) return; } } } else if (link < 0 || depth === level) { const index = link >>> 6 & 0x7FFFFF; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) { mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --topAlive || (topWalk = null), --left === 0)) return; } } if (link & 0x40000000) break; h++; } while (true); } } if (c < 256) { t = base + c; cell = jump[t] | 0; if ((cell & 0x1FF) !== c) { valid = 0; break; } base = cell >>> 9; } else { t = base + (y = (c >> 8) + 256); cell = jump[t] | 0; if ((cell & 0x1FF) !== y) { valid = 0; break; } base = cell >>> 9; t = base + (c & 0xFF); cell = jump[t] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) { valid = 0; break; } base = cell >>> 9; } } if (valid) { const end = jump[base] | 0; const tag = end & 0x1FF; if ((tag & 0x1FE) === 0x20) { let h = end >>> 9; if (!depth) { if (gate) depth = reach + 1; else { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } } do { const link = chain[h], level = link & 0x3F; if (level > depth) break; if ((link < 0 || depth === level) && !(link & 0x20000000)) { const index = link >>> 6 & 0x7FFFFF; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) { mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --topAlive || (topWalk = null), --left === 0)) return; } } if (link & 0x40000000) break; h++; } while (true); } else if (tag === 0 && end) { const index = (end >>> 9) - 1; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) { mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --topAlive || (topWalk = null), --left === 0)) return; } } } } // 융화 trie 정방향: lo(하위바이트) 로드도 |0 — 정확 사이징(size=used+2)에서 어휘 밖 lo는 범위 밖일 수 있고 undefined | 0 = 0이 흡수한다 · 리터럴은 종단에서, 위고정은 세그 경계마다(gate) — 루트 셀 하위 9비트는 전이 표적이 아니라(t = base + c가 전방 스크래치 너머 베이스 하한 이상) 빈 자리라 체인 유무를 싣는다 · 종단 depth는 gate면 워크가 센 reach로 즉시, gate=0(중복 리터럴 체인)은 하이픈 스캔으로 보정 · 경계 체인은 redirect-먼저(정방향 밀집 노드에서 redirect 분기가 예측 적중)
			if (bottomWalk) { let base = bottomBase; for (let j = me - 1, c, t, cell, y; j >= ms; j--) { c = beat.charCodeAt(j); if (c < 256) { t = base + c; cell = jump[t] | 0; if ((cell & 0x1FF) !== c) break; base = cell >>> 9; } else { t = base + (y = (c >> 8) + 256); cell = jump[t] | 0; if ((cell & 0x1FF) !== y) break; base = cell >>> 9; t = base + (c & 0xFF); cell = jump[t] | 0; if ((cell & 0x1FF) !== (c & 0xFF)) break; base = cell >>> 9; } const end = jump[base] | 0; if (((end & 0x1FF) === 0x20) && (j === ms || beat.charCodeAt(j - 1) === 45)) { let h = end >>> 9; if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } do { const link = chain[h], level = link & 0x3F; if (level > depth) break; if (link < 0 || depth === level) { if (link & 0x20000000) { const head = link >>> 6 & 0x7FFFFF, record = verify[head], blocks = record & 0x3F, index = record >>> 9; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) v: { let cursor = head + 1 + blocks, q = ms, segment = depth - 1; for (let i = 0; i < blocks; i++) { const block = verify[head + 1 + i], target = block >>> 26, length = block & 0x3FF; while (segment > target) { while (beat.charCodeAt(q) !== 45) q++; q++; segment--; } if (q + length > me || (q + length < me && beat.charCodeAt(q + length) !== 45) || beat.charCodeAt(q) !== (block >>> 10 & 0xFFFF)) break v; let k = 1; for (; k + 1 < length; k += 2) if ((beat.charCodeAt(q + k) | beat.charCodeAt(q + k + 1) << 16) !== verify[cursor + (k >> 1)]) break v; if (k < length && beat.charCodeAt(q + k) !== (verify[cursor + (k >> 1)] & 0xFFFF)) break v; cursor += length >> 1; } mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --bottomAlive || (bottomWalk = 0), --left === 0)) return; } } else { const index = link >>> 6 & 0x7FFFFF; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) { mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --bottomAlive || (bottomWalk = 0), --left === 0)) return; } } } if (link & 0x40000000) break; h++; } while (true); } } } // 거울 가지: 같은 trie를 bottomRoot에서 거꾸로 · ONE 상태 접촉은 편승 fire-once 셀과 bottomAlive 감쇠뿐 — 시작 경계에 닿은 끝고정만 발화 · bottom 복합은 정방향과 같은 문법의 redirect 비트 엔트리로 체인에 합류(검증 커서만 거꾸로: q=ms, segment=depth-1) · 체인은 게이트-먼저(깊은 반복의 게이트-실패가 redirect 검사를 단락)
			for (let w = 0; w < midWalk; w += 4) { // 미드 닻 매처(슬라이드) — 위·바닥 고정은 두 trie(정방향/거울)가 이미 발화, 여긴 양끝이 열려(topChars=0 ∧ bottomChars=0) 가운데 고정만 슬라이드로 · 미드 닻 4레인 — offset=fixMid+shift(s3[21:12] 빌드 선계산=fixChars<2?0:fixChars-2)·세그 시작=topGap 파생, 카운트 6비트 추출
				let valid = false; /* 일반: 첫 고정 앵커를 잡고 미드·아래·꼬리를 한 방향으로 걷는다 */ const s0 = slide[w], s1 = slide[w + 1], s2 = slide[w + 2], s3 = slide[w + 3], fixFirst = s0 >>> 16, fixLast = s0 & 0xFFFF, fixChars = s3 >>> 22, fixMid = s2 >>> 9;
					if (one) { const index = s1 >>> 9; if ((spill[spillBase + (index >> 5)] & 1 << index) !== 0) continue; } if ((((s2 & 0x3F) + (s3 & 0x3F)) << 1) - 1 > me - ms) continue; // ONE: 해소된 레인은 앵커 슬라이딩 자체를 건너뛴다(ALL·IN은 one 분기 1개로 차단) · 길이 게이트 — 레코드 글자수 < 2·totalDepth−1(비어있지 않은 세그의 최소 폭)이면 매칭 불가라 닻 스캔 진입 전 순수 ALU 거절, totalDepth = (s2&0x3F)+(s3&0x3F) 유도(저장 0비트), topStar 접기의 depth<totalDepth 부등식을 전 레인으로 일반화
				let topStar = (s1 & 0x1) !== 0, bottomStar = (s1 & 0x2) !== 0, topGap = s3 & 0x3F, q = ms; if (topStar && !bottomStar) { if (!depth) { depth = 1; for (let g = ms; g < me; g++) if (beat.charCodeAt(g) === 45) depth++; } const u = depth - (s2 & 0x3F); if (u < topGap) q = me; else { topGap = u; topStar = false; } } // 별 뒤가 전부 고정 폭이면 앵커 자리는 깊이로 유일하다 — 슬라이드를 단일 자리로 접는다
				if (!topStar) for (let g = 0; g < topGap; g++) { while (q < me && beat.charCodeAt(q) !== 45) q++; q++; } // 위가 고정이면(또는 자리가 유일하면) fc 앞 세그를 건너뛴 한 자리에서만 앵커를 맞춘다
				for (let topSide = 0; q + fixChars <= me; q++) {
					if (q > ms) { if (beat.charCodeAt(q - 1) === 45) topSide++; else continue; } // 세그 경계에서만 앵커 시도, 지나온 조상 수를 누적
					const stop = q + fixChars; v: { if (beat.charCodeAt(q) !== fixFirst || beat.charCodeAt(stop - 1) !== fixLast) break v; for (let k = 1; k < fixChars - 1; k++) if (beat.charCodeAt(q + k) !== codes[fixMid + k - 1]) break v; // 첫·끝(fixFirst·fixLast)은 s0 레지스터 비교, 중간만 codes[fixMid+k-1] — 슬라이드 불일치 대부분이 첫글자에서 걸려 codes 읽기가 사라진다(`||` short-circuit) · 1글자는 첫=끝이라 끝 비교가 자기 비교로 통과 → fixChars 가드 불요, 탈락은 v 탈출로 꼬리 break 판정에 합류
					if (stop < me && beat.charCodeAt(stop) !== 45) break v;
					if (!topStar || topSide >= topGap) { // 위가 별이면 조상이 topGap 이상이어야 한다
						const bottomGap = (s1 >>> 3) & 0x3F, open = (s1 & 0x4) !== 0; let e = stop, segment = s3 & 0x3F, offset = fixMid + ((s3 >>> 12) & 0x3FF); for (let i = 0, midRest = (s3 >>> 6) & 0x3F; i < midRest; i++) { const cell = codes[offset], target = cell >> 10, length = cell & 0x3FF, cursor = offset + 1; while (segment < target) { while (e < me && beat.charCodeAt(e) !== 45) e++; e++; segment++; } const next = e + length; if (next > me || (next < me && beat.charCodeAt(next) !== 45)) break v; for (let k = 0; k < length; k++) if (beat.charCodeAt(e + k) !== codes[cursor + k]) break v; e = next; segment = target; offset = cursor + length; } // offset = fixMid + shift(s3[21:12]) — shift는 빌드에서 fixChars<2?0:fixChars-2로 선계산한 미드블록 시작 보정값(fix 중간글자 뒤가 잔여 미드 블록), 슬라이드 codes(pack)에서 [packed target|length, codes…] 직독, 탈락은 v 탈출(필터와 같은 합류점)
						if (open) valid = true; else { let bottomSide = 0; for (let j = e; j < me; j++) if (beat.charCodeAt(j) === 45) bottomSide++; valid = bottomStar ? bottomSide >= bottomGap : bottomSide === bottomGap; } // 꼬리: 별이면 bottomGap 이상, 아니면 정확히 bottomGap
					} }
					if (valid || !topStar) break; // 위 고정은 한 자리만, 위 별은 맞을 때까지 슬라이드
				}
				if (valid) { const index = s1 >>> 9; if (!one || (spill[spillBase + (index >> 5)] & 1 << index) === 0) { mark = true; if (match && !ready) { if (find > me + 1 || (bound !== -1 && bound < me + 1)) { find = me + 1; bound = beat.indexOf(V, find); } ks = me + 1; if (bound !== -1 && bound < to) { ke = bound; vs = bound + 1; } else { ke = to; vs = ve = -1; } ready = true; } if (on(beat, ms, me, ks, ke, vs, ve, index) === false) return; if (one && (spill[spillBase + (index >> 5)] |= 1 << index, --midAlive || (midWalk = 0), --left === 0)) return; } }
			}
			if (!match && !mark) { if (on(beat, ms, me, ks, ke, vs, ve, -1) === false) return; }
			p = from;
		} } finally { if (spill !== null) { if (spill === jump) jump[1] = topRoot; else if (spill === slide) slide[2] &= ~0x40; } }
	}
};



const A = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 1; // ONE — 니들당 첫 매칭 1회, 전원 해소되는 순간 스캔이 그 자리에서 끝난다
BEAT.read(stream, A, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE = 1 : 니들별 첫 매칭 레코드만 여기로 흐른다. 전부 해소되면 read가 즉시 종료된다.

	switch (index) {
		case 0:
			// 콜백이 곧 실행부다. 데이터 생성 없이 Events ~ Writes ~ Reads가 하나로 흐른다.
			break;
		case 1:
			// '3--3-1-1' 와일드카드 레코드가 파싱 없이 이 실행부로 흐르고, 첫 매칭 한 번만 오므로 캐시가 그대로 확정된다.
			// cache.speed = [beat, vs, ve];
			break;
	}
});



const B = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.MODE = 0; // in read — 매칭된 프리픽스 레코드만 콜백 안으로 들어온다
BEAT.read(stream, B, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE = 0 : 매칭된 프리픽스 레코드만 여기로 흐른다. 스캔은 완주한다.

	switch (index) {
		case 0:
			// 콜백이 곧 실행부다. 데이터 생성 없이 Events ~ Writes ~ Reads가 하나로 흐른다.
			break;
		case 1:
			// '3--3-1-1' 와일드카드의 모든 매칭 레코드가 파싱 없이 이 실행부로 흐르며, 필요 시 값 범위를 그대로 캐시할 수 있다 — 매 발화가 캐시를 갱신한다.
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

BEAT.MODE = -1; // all read — 추가 패스 없이 단 한 번의 스캔으로 N개의 논리적 레이어를 동시에 처리한다. 하나의 콜백 안에서 데이터의 거시적 흐름과 미시적 정보를 동시에 다룰 수 있다
BEAT.read(stream, C, (beat, ms, me, ks, ke, vs, ve, index) => {

	// MODE = -1 : 모든 레코드가 여기로 흐른다. 미매칭 레코드는 index = -1로 발화한다.

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

	// every record flows here.

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
