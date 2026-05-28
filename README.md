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

### ⚡ Zero-Allocation Impact: O(1) vs O(N) Scaling
The true power of BEAT is not just speed, but its constant-time extraction capability. As the payload grows, JSON's processing time increases linearly, while BEAT remains perfectly flat.

| Extractor Engine | Small Payload (1x) | Large Payload (5x) | Complexity |
| :--- | :--- | :--- | :--- |
| `JSON.parse` (Native C++) | ~5,703 ns | ~25,540 ns | ⚠️ **O(N)** (Linear Growth) |
| **BEAT Scanner** (Pure JS) | **~190 ns** | **~190 ns** | 🚀 **O(1)** (Constant Time) |
| **Speedup vs JSON** | **29.9x Faster** | **134.4x Faster** | **433x Net Advantage** |

*(Note: BEAT achieves 134.4x faster extraction using pure JavaScript against V8's native C++ JSON parser. When combined with its 3.22x smaller network footprint, it delivers a **433x Net Advantage (Bytes × Time)** in edge deployment scenarios.)*

*[View Full Benchmark Report ↗](./BENCHMARK.md)*


// imporatnt : 벤치마크 결과를 통해, 비트를 절대 빠른 포멧으로 단정하지 말아달라. 비트는 단순히 속도 개선을 위해 만들어 진 것이 아니다 라는 설명

변경중

<br />

## Specification

### BEAT Notation

**BEAT (Behavioral Event Analytics Transcript)** is a multi-dimensional data format, including the space where events occur, the time when events occur, and the depth of each event, expressed as linear sequences with Topological Coordinates. These sequences express meaning without parsing (Semantic), preserve information in their original state (Raw), and maintain a fully organized structure (Format). Therefore, BEAT is the Semantic Raw Format (SRF) standard.

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
const D = '.';	// Domain-specific extension
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
d = srf == 46			# '.' Domain-specific extension
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
#define SRF_D '.'				// Domain-specific extension
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
(i32.eq (local.get $srf) (i32.const 46))	;; '.' Domain-specific extension
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
|111> = 46   ;; '.' Domain-specific extension

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

_3-1-3-1-1 x:612			// 컴퓨터가 x 값을 원하는 경우, Topological Coordinates와 zero-allocation 스캔으로 612를 즉시 확인

_3-1-3-1-2 y:244
_3-1-3-1-3 w:96
_3-1-3-1-4 h:64
_3-1-3-2 attributes
_3-1-3-2-1 distance:18.6
_3-1-3-2-2 confidence:0.96
_3-1-3-2-3 intent:cut-in

_4 beat !urban-junction~0.1*sensor-fusion~0.1*detect-lane~0.1*detect-traffic-light~0.1/0.1/0.1*detect-vehicle~0.2*classify-vehicle~0.3*predict-cut-in~0.4*yield~0.2/0.2/0.3*brake~1.0/0.8*hold-position~1.6*clear-path~0.7*resume-lane-following~0.4/0.4*accelerate~0.5*lane-centering

```

Tree 기반의 기존 포맷은 의미를 닫힌 구조에 묶어 둡니다. 그래서 위치를 알기 위해 tree context를 따라가야 합니다. Payload가 커질수록 target field에 도달하기 위해 전체 순회, 검증, 객체 할당, field access, value extraction 비용이 함께 증가하고, 이 과정에서 처리 비용과 메모리 사용량도 늘어납니다.

반면 BEAT는 Topological Coordinates와 zero-allocation scan을 통해 이 비용을 만들지 않습니다. `_1` 또는 `_3-1-2`와 같이 각 field가 좌표로 시작하기 때문에, 컴퓨터는 tree를 세우지 않고도 해당 byte 구간을 즉시 읽습니다. 즉, 1차원 선형 스트림이 Topological Coordinates를 통해 다차원 의미 공간처럼 펼쳐집니다.

물리적 순서가 논리적 위계에 묶이지 않으므로 아무런 구조적 장애물이 없습니다. `_3 objects`과 `_3-1 021` 사이에 새로운 `_999 new`가 끼어들어도, `_3` 계층 구조는 논리적으로 파괴되지 않고 성능이 유지됩니다. 또한 `_3 objects`를 식별하기 위해 필요한 핵심 byte는 전체 스트림 중 `3`, 단 1바이트에 불과합니다.

따라서 BEAT는 부모와 자식 간의 관계가 필요한 계층 구조를 동적으로 표현하면서도 O(1) extraction에 가까운 성능을 유지합니다. 하드웨어 가속 구현에서는 예시에 있는 총 32개의 좌표 `_N`이 동시에 병렬로 스캔될 수 있습니다.

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
	META: '_', VALUE: ':', DIRECT: false, CACHE: new WeakMap(),
	read(beat, prefix, on) {
		const M = BEAT.META, l = beat.length;
		let ms, me, ks, ke, vs, ve, from, to, cut, cache, move;
		if (!(cache = BEAT.CACHE.get(prefix))) {
			const literals = [], wilds = [];
			for (let i = 0, path, wild; i < prefix.length; i++) {
				path = prefix[i]; if (!path || path.charCodeAt(0) === 45) continue;
				wild = path.charCodeAt(path.length - 1) === 45 || path.charCodeAt(path.length - 1) === 42; for (let n = 1; !wild && n < path.length; n++) if (path.charCodeAt(n) === 45 && path.charCodeAt(n - 1) === 45) { wild = true; break; }
				if (wild) {
					const parts = [];
					let s = 0, c, star = path.charCodeAt(path.length - 1) === 42; if (star) { path = path.slice(0, -1); if (!path || path.charCodeAt(0) === 45) continue; }
					const open = path.charCodeAt(path.length - 1) === 45;
					for (let n = 0; n <= path.length; n++) { c = n < path.length ? path.charCodeAt(n) : 45; if (c === 45) { parts.push(path.slice(s, n)); s = n + 1; } }
					let anchorParts = 0; for (let n = 0; n < parts.length; n++) { if (!parts[n]) break; anchorParts++; }
					let head = ''; for (let n = 0; n < anchorParts; n++) head += (n ? '-' : '') + parts[n]; if (head && (anchorParts < parts.length || !star || open)) head += '-';
					const anchorCodes = new Int32Array(head.length); for (let n = 0; n < head.length; n++) anchorCodes[n] = head.charCodeAt(n);
					wilds.push({ index: i, parts, anchorParts, anchorCodes, anchorLen: head.length, needle: M + head, star, closed: anchorParts === parts.length && star && !open });
				} else {
					const pathCodes = new Int32Array(path.length); for (let n = 0; n < path.length; n++) pathCodes[n] = path.charCodeAt(n);
					literals.push({ index: i, pathCodes, pathLen: path.length, needle: M + path, length: path.length + 1 });
				}
			}
			move = null;
			if (literals.length) {
				let max = 1; for (let i = 0; i < literals.length; i++) max += literals[i].pathLen;
				move = new Int32Array(max << 7);
				let nodes = 1; for (let i = 0, lit, codes, len, node, n, p; i < literals.length; i++) { lit = literals[i]; codes = lit.pathCodes; len = lit.pathLen; for (node = n = 0; n < len; n++) { p = node << 7 | codes[n]; node = move[p] || (move[p] = nodes, nodes++); } move[node << 7 | 127] = lit.index + 1; }
				if (nodes < max) { const m = new Int32Array(nodes << 7); m.set(move.subarray(0, nodes << 7)); move = m; }
			}
			cache = { move, literals, wilds };
			BEAT.CACHE.set(prefix, cache);
		}
		move = cache.move;
		const wilds = cache.wilds;
		if (BEAT.DIRECT) {
			const literals = cache.literals;
			for (let i = 0, lit, needle, length, p, n, c; i < literals.length; i++) {
				lit = literals[i];
				needle = lit.needle; length = lit.length;
				p = beat.indexOf(needle);
				while (p !== -1) {
					n = p + length; c = n < l ? beat.charCodeAt(n) : 32;
					if ((p !== 0 && beat.charCodeAt(p - 1) > 32) || c > 32) { p = beat.indexOf(needle, p + 1); continue; }
					while (p !== -1) {
						me = ms = p + 1; me = beat.indexOf(' ', me); if (me === -1) break;
						let k = 0, plen = lit.pathLen, pcodes = lit.pathCodes; if (me - ms !== plen) break; for (; k < plen; k++) if (beat.charCodeAt(ms + k) !== pcodes[k]) break; if (k !== plen) break;
						from = beat.indexOf(M, me + 1); while (from !== -1 && beat.charCodeAt(from - 1) > 32) from = beat.indexOf(M, from + 1);
						to = from === -1 ? l : from - 1; ve = to;
						cut = -1; for (let j = me + 1; j < to; j++) if (beat.charCodeAt(j) === 58) { cut = j; break; } if (cut !== -1) { ks = me + 1; ke = cut; vs = cut + 1; } else { ks = ke = -1; vs = me + 1; }
						if (on(beat, ms, me, ks, ke, vs, ve, lit.index) === false) return;
						p = from;
					}
					break;
				}
			}
			for (let i = 0, w, p, ok, parts, q, n, c; i < wilds.length; i++) {
				w = wilds[i]; p = beat.indexOf(w.needle);
				while (p !== -1) {
					n = p + w.anchorLen + 1; c = n < l ? beat.charCodeAt(n) : 32;
					if ((p !== 0 && beat.charCodeAt(p - 1) > 32) || (w.closed && c > 32 && c !== 45)) { p = beat.indexOf(w.needle, p + 1); continue; }
					while (p !== -1) {
						me = ms = p + 1; me = beat.indexOf(' ', me); if (me === -1) break;
						let k = 0, alen = w.anchorLen, acodes = w.anchorCodes; for (; k < alen; k++) if (beat.charCodeAt(ms + k) !== acodes[k]) break; if (k !== alen) break;
						if (w.closed) { n = ms + alen; c = n < me ? beat.charCodeAt(n) : 32; if (c > 32 && c !== 45) break; }
						from = beat.indexOf(M, me + 1); while (from !== -1 && beat.charCodeAt(from - 1) > 32) from = beat.indexOf(M, from + 1);
						ok = true; parts = w.parts; q = ms + w.anchorLen;
						for (let m = w.anchorParts, part, ss, se, n; m < parts.length; m++) {
							part = parts[m]; ss = q; while (q < me && beat.charCodeAt(q) !== 45) q++; se = q;
							if (part) { if (se - ss !== part.length) { ok = false; break; } for (n = 0; n < part.length; n++) if (beat.charCodeAt(ss + n) !== part.charCodeAt(n)) { ok = false; break; } if (!ok) break; }
							else if (se === ss) { ok = false; break; }
							if (m + 1 < parts.length) { if (q >= me || beat.charCodeAt(q) !== 45) { ok = false; break; } q++; }
							else if (!w.star && q !== me) { ok = false; break; }
						}
						if (ok) {
							to = from === -1 ? l : from - 1; ve = to;
							cut = -1; for (let j = me + 1; j < to; j++) if (beat.charCodeAt(j) === 58) { cut = j; break; } if (cut !== -1) { ks = me + 1; ke = cut; vs = cut + 1; } else { ks = ke = -1; vs = me + 1; }
							if (on(beat, ms, me, ks, ke, vs, ve, w.index) === false) return;
						}
						p = from;
					}
					break;
				}
			}
			return;
		}
		let p = beat.indexOf(M);
		while (p !== -1) { if (p === 0 || beat.charCodeAt(p - 1) <= 32) break; p = beat.indexOf(M, p + 1); }
		while (p !== -1) {
			me = ms = p + 1; me = beat.indexOf(' ', me); if (me === -1) break;
			from = beat.indexOf(M, me + 1); while (from !== -1 && beat.charCodeAt(from - 1) > 32) from = beat.indexOf(M, from + 1);
			to = from === -1 ? l : from - 1; ve = to;
			cut = -1; for (let j = me + 1; j < to; j++) if (beat.charCodeAt(j) === 58) { cut = j; break; } if (cut !== -1) { ks = me + 1; ke = cut; vs = cut + 1; } else { ks = ke = -1; vs = me + 1; }
			let mark = false;
			if (move) for (let j = ms, node = 0, c, index; j < me; j++) { c = beat.charCodeAt(j); node = move[node << 7 | c]; if (!node) break; if (j + 1 === me && (index = move[node << 7 | 127])) { mark = true; if (on(beat, ms, me, ks, ke, vs, ve, index - 1) === false) return; } }
			for (let i = 0, w, ok, parts, q; i < wilds.length; i++) {
				w = wilds[i]; ok = true; parts = w.parts; q = ms;
				for (let m = 0, part, ss, se, n; m < parts.length; m++) {
					part = parts[m]; ss = q; while (q < me && beat.charCodeAt(q) !== 45) q++; se = q;
					if (part) { if (se - ss !== part.length) { ok = false; break; } for (n = 0; n < part.length; n++) if (beat.charCodeAt(ss + n) !== part.charCodeAt(n)) { ok = false; break; } if (!ok) break; }
					else if (se === ss) { ok = false; break; }
					if (m + 1 < parts.length) { if (q >= me || beat.charCodeAt(q) !== 45) { ok = false; break; } q++; }
					else if (!w.star && q !== me) { ok = false; break; }
				}
				if (ok) { mark = true; if (on(beat, ms, me, ks, ke, vs, ve, w.index) === false) return; }
			}
			if (!mark && on(beat, ms, me, ks, ke, vs, ve, -1) === false) return;
			p = from;
		}
	}
};



const DIRECT = [
	'2-3-3-1',
	'3--3-1-1'
];

BEAT.DIRECT = true; // V5 direct read
BEAT.read(stream, DIRECT, (beat, ms, me, ks, ke, vs, ve, index) => {

	// DIRECT=true : only matched prefix records flow here.

	switch (index) {
		case 0:
			break;
		case 1: // 콜백이 곧 실행부이며, 데이터 생성을 안하고 실행이 가능. 즉, Events ~ Writes ~ Reads flow as one.
			break;
	}
});



const STREAM = [
	'1', // schema-version:1.0.0
	'2',
	'3',
	'4'
];

BEAT.DIRECT = false; // full stream scan 추가적인 연산 없이 단 한 번의 스캔으로 N개의 논리적 레이어를 동시에 처리. 하나의 콜백 안에서 데이터의 거시적 흐름과 미시적 정보를 동시에 다룰 수 있음.
BEAT.read(stream, STREAM, (beat, ms, me, ks, ke, vs, ve, index) => {

	// DIRECT=false : every record flows here. index === -1 means no prefix match.

	switch (index) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			break;
	}

	// DIRECT=false : every record flows here.

});
```

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

## 주석

| 항목 | 정합성 근거 |
|---|---|
| BEAT Reader | 0.4 ms는 현재 JavaScript 구현 기준이며, 단순 1만 건 조회가 아니라 6만 record stream에서 wildcard pattern으로 관련 1만 건을 필터링하고, value range를 잡고, callback 실행부에 진입하며, 구조상 handler dispatch까지 가능한 값이다. lower-level C 구현체에서는 더 빠른 결과를 확인할 수 있다. |
| BEAT Reader for JSON | JSON 입력을 tree로 만들지 않고 BEAT 좌표 stream처럼 읽어, 관련 1만 건 필터링, value range 추출, callback 실행부 진입, handler dispatch 가능 범위까지 포함한다. tree 구성 이후 처리하는 JSON parser 경로가 아니라, BEAT Reader와 같은 scan, filter, extract, dispatch 경로를 따른다. |
| simdjson | 공식 설명상 GB/s급 JSON parser이고 NDJSON은 3.5 GB/s, minify는 6 GB/s, UTF-8 validation은 13 GB/s까지 제시한다. 이 수치는 parser 내부 처리량 기준이다. 일반 실행 환경 표에서는 native boundary, payload 전달, 결과 반환, 실행부 전달을 포함한다. |
| yyjson | 공식 설명상 modern CPU에서 JSON data를 GB/s 단위로 read/write할 수 있다. 이 역시 parser 내부 처리량 기준이다. 일반 실행 환경에서는 호출 경계와 결과 전달 비용이 붙는다. |
| RapidJSON 비교 | simdjson 공식 설명은 RapidJSON보다 4배 이상 빠르고, JSON for Modern C++보다 25배 빠르다고 제시한다. 그래서 일반 실행 환경에서 RapidJSON과 nlohmann/json 계열은 simdjson보다 높은 범위로 잡는 것이 정합적이다. |
| Redis 네트워크 | Redis 공식 문서는 1 Gbit/s network의 typical latency를 약 200 us로 설명한다. 원격 memory store는 RTT, response transfer, client decode를 포함해야 한다. |
| PostgreSQL 네트워크 | PostgreSQL 공식 pipeline mode 문서는 round trip latency가 누적된다는 점을 예시로 설명한다. 300 ms RTT 환경에서 100-statement 작업은 pipelining 없이 network latency만 30초가 될 수 있다고 든다. |
| PostgreSQL 일반 latency | EnterpriseDB 자료는 client/server round-trip latency가 localhost 0.01 ms, switched network 약 0.5 ms, WiFi 5 ms, ADSL 20 ms, intercontinental 300 ms까지 갈 수 있다고 설명한다. trivial SELECT의 server-side 실행은 0.1 ms 수준일 수 있지만, 일반 앱에서는 왕복과 결과 전달이 붙는다. |
| MongoDB | MongoDB 공식 문서는 cursor가 query result를 가리키며 결과를 batch 단위로 iterate한다고 설명한다. `cursor.batchSize()` 문서는 initial batch가 101 documents 또는 16 MiB 중 작은 값이고, subsequent batch는 최대 16 MiB라고 설명한다. 1만 건 반환은 batch, getMore 가능성, 전송, BSON decode를 포함하는 추정이 맞다. |
| DuckDB | DuckDB 공식 자료는 benchmark 결과가 공식 TPC/LDBC 결과가 아니라고 선을 긋고, 별도 블로그에서 최근 3년간 3에서 25배 빨라졌다고 설명한다. same-process OLAP DB라도 query와 result materialization 비용을 포함하는 범위 추정이 맞다. |
| BigQuery | BigQuery 공식 문서는 query plan, execution details, optimization을 별도로 다루며, serverless analytics service다. 일반 실행 환경에서는 planning, distributed execution, result return이 포함되므로 수백 ms에서 수 초 범위로 잡는 것이 정합적이다. |

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

JSON to SRF 구현체는 일반적인 JSON을 BEAT Notation을 사용하는 `_key:value` 형식으로 전처리하여, 메모리 증폭을 발생시키는 `JSON.parse` 과정 없이 BEAT.read로 흘려보냅니다. 즉, BEAT뿐만 아니라 JSON에서도 zero-allocation 스캔과 Topological Coordinates의 가치를 경험할 수 있습니다.

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

BEAT is the Semantic Raw Format (SRF) standard. BEAT sequences can be read directly by humans and AI without parsing (Semantic), preserve information in their original state (Raw), and maintain a fully organized structure (Format).

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
