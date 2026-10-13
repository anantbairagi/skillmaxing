import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCourse(id, path, name, eyebrow, headline, lede, blocks) {
  const modules = [];
  let current = null;
  for (const row of blocks.trim().split("\n")) {
    const line = row.trim();
    if (!line) continue;
    if (line.startsWith("# ")) {
      current = { title: line.slice(2).trim(), lessons: [] };
      modules.push(current);
      continue;
    }
    const [code, title, slug, flags = ""] = line.split("|").map((part) => part.trim());
    const flagSet = new Set(flags.split(/\s+/).filter(Boolean));
    current.lessons.push({
      code,
      title,
      slug: slug || slugify(title),
      free: flagSet.has("free"),
      codeLab: flagSet.has("code"),
      kind: flagSet.has("walk") ? "walkthrough" : flagSet.has("case") ? "case" : "lesson",
    });
  }
  return { id, path, name, eyebrow, headline, lede, modules };
}

const python = parseCourse(
  "python-ai",
  "/python-ai",
  "Python with AI",
  "Builder path",
  "Ship a real AI backend in Python.",
  "One support-agent project, carried from your first script to a traced and deployed service: FastAPI, streaming, agents and MCP.",
  `
# Start here
PA.01 | What an AI backend is | what-an-ai-backend-is | free
PA.02 | Setting up: Python 3.14, uv, and your editor | python-setup-uv-and-editor | free code
PA.03 | How to use this course | how-to-use-the-python-ai-course | free
# Python that reads well
01.01 | Values, names, and the REPL | values-names-and-the-repl | free code
01.02 | Strings, f-strings, and t-strings | strings-f-strings-and-t-strings | free code
01.03 | Lists, dicts, sets, and tuples | lists-dicts-sets-tuples | code
01.04 | Control flow and comprehensions | control-flow-and-comprehensions | code
01.05 | Functions, arguments, and closures | functions-arguments-and-closures | code
01.06 | Modules, packages, and imports | modules-packages-and-imports | code
01.07 | Errors and exceptions | errors-and-exceptions-in-python | code
01.08 | Files, JSON, and pathlib | files-json-and-pathlib | code
# Python for real programs
02.01 | Classes and dataclasses | classes-and-dataclasses | code
02.02 | Type hints that pay off | type-hints-that-pay-off | code
02.03 | Generators and iterators | generators-and-iterators | code
02.04 | Decorators and context managers | decorators-and-context-managers | code
02.05 | The standard library you will actually use | standard-library-for-backends | code
02.06 | Dependencies and environments with uv | virtual-environments-and-uv | code
02.07 | Testing with pytest | testing-with-pytest | code
02.08 | Project layout and pyproject.toml | project-layout-and-pyproject | code
# Async Python
03.01 | Why async: waiting is the bottleneck | why-async-waiting-is-the-bottleneck |
03.02 | async, await, tasks, and gather | async-await-tasks-and-gather | code
03.03 | Timeouts, cancellation, and semaphores | asyncio-timeouts-cancellation-semaphores | code
03.04 | httpx: async HTTP clients | httpx-async-http-clients | code
03.05 | Threads, processes, and when async is wrong | threads-processes-and-when-async-is-wrong | code
# Pydantic
04.01 | Models and validation | pydantic-models-and-validation | code
04.02 | Field constraints and custom validators | pydantic-fields-and-custom-validators | code
04.03 | Serialisation and JSON Schema | pydantic-serialisation-and-json-schema | code
04.04 | Settings and configuration | pydantic-settings-and-configuration | code
04.05 | TypeAdapter and discriminated unions | pydantic-typeadapter-and-discriminated-unions | code
# FastAPI fundamentals
05.01 | Your first FastAPI app | your-first-fastapi-app | code
05.02 | Path, query, and body parameters | fastapi-path-query-and-body | code
05.03 | Response models and status codes | fastapi-response-models-and-status-codes | code
05.04 | Dependency injection | fastapi-dependency-injection | code
05.05 | Routers and project structure | fastapi-routers-and-project-structure | code
05.06 | Middleware, CORS, and lifespan | fastapi-middleware-cors-and-lifespan | code
05.07 | Errors and exception handlers | fastapi-errors-and-exception-handlers | code
05.08 | Testing FastAPI | testing-fastapi-with-testclient | code
05.09 | Auth: API keys, JWT, and OAuth2 | fastapi-auth-api-keys-jwt-oauth2 | code
# Databases from Python
06.01 | SQLAlchemy 2.0 async basics | sqlalchemy-2-async-basics | code
06.02 | Models, sessions, and Alembic migrations | models-sessions-and-alembic-migrations | code
06.03 | Repositories and transactions in FastAPI | repositories-and-transactions-in-fastapi | code
06.04 | Redis for caching, rate limits, and queues | redis-for-caching-rate-limits-and-queues | code
06.05 | Background work: BackgroundTasks, ARQ, and Celery | background-work-backgroundtasks-arq-celery | code
# Real-time: streaming and WebSockets
07.01 | Streaming responses and JSON lines | streaming-responses-and-json-lines | code
07.02 | Server-sent events for token streams | server-sent-events-for-token-streams | code
07.03 | WebSockets in FastAPI | websockets-in-fastapi | code
07.04 | Connection managers and broadcasting | connection-managers-and-broadcasting | code
07.05 | Backpressure, heartbeats, and reconnects | backpressure-heartbeats-and-reconnects | code
# LLM APIs from Python
08.01 | How an LLM call works: tokens, context, and cost | how-an-llm-call-works |
08.02 | The OpenAI Responses API | openai-responses-api-from-python | code
08.03 | The Anthropic Messages API | anthropic-messages-api-from-python | code
08.04 | Streaming tokens to the browser | streaming-tokens-to-the-browser | code
08.05 | Structured outputs with Pydantic | structured-outputs-with-pydantic | code
08.06 | Tool calling by hand: the loop | tool-calling-by-hand-the-loop | code
08.07 | Prompts as code: templates, versions, and tests | prompts-as-code-templates-versions-tests | code
08.08 | Embeddings and a small RAG endpoint | embeddings-and-a-small-rag-endpoint | code
08.09 | Retries, timeouts, and rate limits for model calls | retries-timeouts-and-rate-limits-for-model-calls | code
# Agent fundamentals
09.01 | What an agent is: loop, tools, state | what-an-agent-is-loop-tools-state |
09.02 | Designing tools an LLM can use | designing-tools-an-llm-can-use | code
09.03 | Memory: short-term, long-term, and sessions | agent-memory-short-term-long-term-sessions | code
09.04 | Guardrails and human approval | guardrails-and-human-approval | code
09.05 | Evaluating agents | evaluating-agents | code
# OpenAI Agents SDK
10.01 | Agent, Runner, and the first run | agents-sdk-agent-runner-first-run | code
10.02 | Function tools and hosted tools | agents-sdk-function-tools-and-hosted-tools | code
10.03 | Handoffs and multi-agent systems | agents-sdk-handoffs-and-multi-agent | code
10.04 | Guardrails, sessions, and tracing | agents-sdk-guardrails-sessions-tracing | code
10.05 | Streaming an agent into FastAPI | streaming-an-agent-into-fastapi | code
# LangChain and LangGraph
11.01 | LangChain 1.0: models, tools, and create_agent | langchain-1-models-tools-create-agent | code
11.02 | LangGraph: state, nodes, and edges | langgraph-state-nodes-edges | code
11.03 | Persistence and human-in-the-loop | langgraph-persistence-and-human-in-the-loop | code
11.04 | Streaming and structured responses | langgraph-streaming-and-structured-responses | code
11.05 | Choosing an agent framework | choosing-an-agent-framework |
# Model Context Protocol
12.01 | MCP: servers, clients, and tools | mcp-servers-clients-and-tools | code
12.02 | Build an MCP server in Python | build-an-mcp-server-in-python | code
12.03 | Connect agents to MCP servers | connect-agents-to-mcp-servers | code
# Observability with Langfuse
13.01 | Why tracing an LLM app is different | why-tracing-an-llm-app-is-different |
13.02 | Langfuse setup and the OpenAI drop-in | langfuse-setup-and-the-openai-drop-in | code
13.03 | Tracing FastAPI and agents with @observe | tracing-fastapi-and-agents-with-observe | code
13.04 | Sessions, users, scores, and evals | langfuse-sessions-users-scores-and-evals | code
13.05 | Prompt management and self-hosting Langfuse | langfuse-prompt-management-and-self-hosting | code
# Shipping the AI backend
14.01 | Configuration, secrets, and environments | configuration-secrets-and-environments | code
14.02 | Docker for Python services | docker-for-python-services | code
14.03 | Deploying: a VM, a container platform, or serverless | deploying-vm-containers-serverless | code
14.04 | Cost control: caching, model routing, and budgets | cost-control-caching-routing-budgets | code
14.05 | Security: prompt injection, PII, and tool permissions | security-prompt-injection-pii-tool-permissions |
14.06 | Capstone: a support-agent backend end to end | capstone-support-agent-backend-end-to-end | code
`,
);

const inference = parseCourse(
  "inference-eng",
  "/inference-eng",
  "Inference Engineering",
  "Production path",
  "Make models fast and cheap to serve.",
  "The arithmetic of a token budget first, then the GPUs, batching, caching and quantisation that change it.",
  `
# Start here
IE.01 | What inference engineering is | what-inference-engineering-is | free
IE.02 | The life of an inference request | the-life-of-an-inference-request | free
# Before You Optimize
01.01 | Shared APIs versus dedicated deployments | shared-apis-versus-dedicated-deployments | free
01.02 | Latency budgets and workload shapes | latency-budgets-and-workload-shapes | free
01.03 | Measuring TTFT, TPS, and percentiles | measuring-ttft-tps-and-percentiles | free code
01.04 | Picking the smallest model that passes | picking-the-smallest-model-that-passes |
# How Models Run
02.01 | Matmul and activations for inference engineers | matmul-and-activations-for-inference-engineers | code
02.02 | Tokens, chat templates, and sampling | tokens-chat-templates-and-sampling | code
02.03 | Prefill and decode | prefill-and-decode | code
02.04 | Transformer blocks and attention | transformer-blocks-and-attention |
02.05 | The KV cache and its memory bill | the-kv-cache-and-its-memory-bill | code
02.06 | Mixture of experts models | mixture-of-experts-models |
02.07 | How image and video models generate | how-image-and-video-models-generate |
# Bottlenecks and Hardware
03.01 | Compute-bound or memory-bound | compute-bound-or-memory-bound |
03.02 | Inside a datacenter GPU | inside-a-datacenter-gpu |
03.03 | Choosing a GPU for a workload | choosing-a-gpu-for-a-workload |
03.04 | Nodes, interconnects, and MIG | nodes-interconnects-and-mig |
03.05 | Making attention cheaper | making-attention-cheaper |
# The Software Stack
04.01 | CUDA kernels, selection, and fusion | cuda-kernels-selection-and-fusion | code
04.02 | PyTorch, compile, and model files | pytorch-compile-and-model-files | code
04.03 | vLLM, SGLang, and TensorRT-LLM | vllm-sglang-and-tensorrt-llm | code
04.04 | Continuous batching | continuous-batching | code
04.05 | Benchmarking and profiling inference | benchmarking-and-profiling-inference | code
# Quantization and Speculation
05.01 | Number formats for inference | number-formats-for-inference | code
05.02 | Quantizing without losing quality | quantizing-without-losing-quality | code
05.03 | Speculative decoding | speculative-decoding | code
05.04 | EAGLE, Medusa, and n-gram drafts | eagle-medusa-and-n-gram-drafts | code
# Caching, Parallelism, and Disaggregation
06.01 | Prefix caching | prefix-caching | code
06.02 | KV cache tiers and cache-aware routing | kv-cache-tiers-and-cache-aware-routing | code
06.03 | Tensor, expert, and pipeline parallelism | tensor-expert-and-pipeline-parallelism | code
06.04 | Disaggregated prefill and decode | disaggregated-prefill-and-decode | code
# Beyond Text
07.01 | Vision language and embedding models | vision-language-and-embedding-models |
07.02 | Speech pipelines: ASR and TTS | speech-pipelines-asr-and-tts | code
07.03 | Faster image and video generation | faster-image-and-video-generation |
# Inference in Production
08.01 | Containers and cold starts | containers-and-cold-starts |
08.02 | Autoscaling, routing, and queues | autoscaling-routing-and-queues |
08.03 | Multi-cloud capacity and reliability | multi-cloud-capacity-and-reliability |
08.04 | Shipping changes, cost, and observability | shipping-changes-cost-and-observability |
08.05 | Client code, streaming, and protocols | client-code-streaming-and-protocols | code
08.06 | Capstone: an inference stack for Kite | capstone-an-inference-stack-for-kite | code
`,
);

const systemLessons = [
  ["Start here", [
    ["SD.01", "What a system is", "what-a-system-is", "free"],
    ["SD.02", "What system design work looks like", "what-system-design-work-looks-like", "free"],
    ["SD.03", "How to use this course", "how-to-use-this-course", "free"],
  ]],
  ["One request, end to end", [
    ["01.01", "What happens when you open a URL", "what-happens-when-you-open-a-url", "free"],
    ["01.02", "Clients and servers", "clients-and-servers", "free"],
    ["01.03", "What an API is", "what-an-api-is", ""],
    ["01.04", "TCP vs UDP", "tcp-vs-udp", ""],
    ["01.05", "How a server handles many requests", "concurrency-vs-parallelism", ""],
    ["01.06", "The numbers every engineer should know", "latency-numbers-every-engineer-should-know", ""],
  ]],
  ["Where data lives", [
    ["02.01", "What a database is", "what-a-database-is", ""],
    ["02.02", "SQL for system design", "sql-for-system-design", "code"],
    ["02.03", "The request path through a database", "request-path-through-a-database", ""],
    ["02.04", "Repository pattern", "repository-pattern", "code"],
    ["02.05", "Extensible data modeling", "extensible-data-modeling", "code"],
    ["02.06", "Soft delete", "soft-delete", "code"],
    ["02.07", "A key-value store on SQL", "sql-backed-key-value-store", "code walk"],
  ]],
  ["Thinking like a designer", [
    ["03.01", "Requirements clarification", "requirements-clarification", ""],
    ["03.02", "Non-functional requirements", "non-functional-requirements", ""],
    ["03.03", "Availability, durability, consistency, cost", "availability-durability-consistency-cost", ""],
    ["03.04", "Logical system design", "logical-system-design", ""],
    ["03.05", "System design tradeoffs", "system-design-tradeoffs", ""],
    ["03.06", "Back-of-the-envelope capacity planning", "back-of-the-envelope-capacity-planning", "code"],
    ["03.07", "Cost-aware architecture", "cost-aware-architecture", ""],
    ["03.08", "When not to add infrastructure", "when-not-to-add-infrastructure", ""],
    ["03.09", "A URL shortener, one machine", "url-shortener-system-design", "walk"],
  ]],
  ["Scaling the stateless tier", [
    ["04.01", "Horizontal vs vertical scaling", "horizontal-vs-vertical-scaling", ""],
    ["04.02", "Load balancers", "load-balancers", ""],
    ["04.03", "API gateway vs load balancer", "api-gateway-vs-load-balancer", ""],
    ["04.04", "Monolith vs microservices", "monolith-vs-microservices", ""],
    ["04.05", "Service-to-service communication", "service-to-service-communication", ""],
    ["04.06", "HTTP, REST, and gRPC", "http-rest-grpc", ""],
    ["04.07", "API design contracts", "api-design-contracts", "code"],
    ["04.08", "Event contracts", "event-contracts", "code"],
    ["04.09", "Instagram's first architecture", "case-instagram-early-architecture", "case"],
  ]],
  ["Staying correct under failure", [
    ["05.01", "Retries, timeouts, and idempotency", "retries-timeouts-idempotency", ""],
    ["05.02", "Circuit breakers and timeouts", "circuit-breakers-and-timeouts", ""],
    ["05.03", "Backpressure", "backpressure", ""],
    ["05.04", "Load shedding", "load-shedding", ""],
    ["05.05", "Tail latency", "tail-latency", ""],
    ["05.06", "Batching", "batching", ""],
    ["05.07", "Rate limiter placement and keys", "rate-limiter-placement-and-keys", ""],
    ["05.08", "Sliding window rate limiter", "sliding-window-rate-limiter", "code"],
    ["05.09", "Stripe's idempotency keys", "case-stripe-idempotency-keys", "case"],
    ["05.10", "Rate limiting and abuse prevention", "rate-limiting-and-abuse-prevention-case-study", "walk"],
  ]],
  ["Caching and fast reads", [
    ["06.01", "Caching layers", "caching-layers", ""],
    ["06.02", "Cache eviction policies", "cache-eviction-policies", ""],
    ["06.03", "TTL expiration and cache reapers", "ttl-expiration-and-cache-reapers", "code"],
    ["06.04", "Cache concurrency control", "cache-concurrency-control", ""],
    ["06.05", "Cache availability and database fallback", "cache-availability-and-database-fallback", ""],
    ["06.06", "Distributed cache design", "distributed-cache-design", ""],
    ["06.07", "CDNs", "cdn-basics", ""],
    ["06.08", "A URL shortener at scale", "url-shortener-at-scale", "walk"],
  ]],
  ["Relational databases, properly", [
    ["07.01", "Relational database design", "relational-database-design", ""],
    ["07.02", "Database indexing", "database-indexing", ""],
    ["07.03", "B-tree", "b-tree", ""],
    ["07.04", "Query planning", "query-planning", ""],
    ["07.05", "Database locking and isolation", "database-locking-and-isolation", ""],
    ["07.06", "MVCC", "mvcc", ""],
    ["07.07", "Database WAL and recovery", "database-wal-and-recovery", ""],
    ["07.08", "Keyset pagination", "keyset-pagination", "code"],
    ["07.09", "Relational database scaling", "relational-database-scaling", ""],
    ["07.10", "Online indexing", "online-indexing", ""],
    ["07.11", "Schema evolution", "schema-evolution", ""],
    ["07.12", "A product listing", "ecommerce-product-listing-system-design", "walk"],
  ]],
  ["NoSQL and partitioning", [
    ["08.01", "NoSQL decision boundaries", "nosql-decision-boundaries", ""],
    ["08.02", "Document vs key-value stores", "document-vs-key-value-stores", ""],
    ["08.03", "Columnar vs wide-column stores", "columnar-vs-wide-column-stores", ""],
    ["08.04", "Graph database decision boundary", "graph-database-decision-boundary", ""],
    ["08.05", "Sharding and partitioning", "sharding-and-partitioning", ""],
    ["08.06", "Consistent hashing", "consistent-hashing", "code"],
    ["08.07", "Consistent-hashing load balancing", "consistent-hashing-load-balancing", "code"],
    ["08.08", "Hot partitions", "hot-partitions", ""],
    ["08.09", "Hot and cold storage, archival", "hot-cold-storage-archival", ""],
    ["08.10", "How Discord stores trillions of messages", "case-discord-message-storage", "case"],
  ]],
  ["IDs, clocks, and ordering", [
    ["09.01", "Distributed ID generation", "distributed-id-generation", ""],
    ["09.02", "UUID, ObjectId, and Snowflake", "uuid-objectid-and-snowflake", ""],
    ["09.03", "Snowflake ID design", "snowflake-id-design", "code"],
    ["09.04", "Database ticket servers", "database-ticket-servers", ""],
    ["09.05", "Clock skew and ID ordering", "clock-skew-and-id-ordering", ""],
  ]],
  ["Replication and consistency", [
    ["10.01", "Distributed systems foundations", "distributed-systems-foundations", ""],
    ["10.02", "Replication", "replication", ""],
    ["10.03", "Consistency models", "consistency-models", ""],
    ["10.04", "CAP and PACELC", "cap-and-pacelc", ""],
    ["10.05", "Clocks and ordering", "clocks-and-ordering", ""],
    ["10.06", "Amazon Dynamo, the paper", "case-amazon-dynamo", "case"],
  ]],
  ["Coordination", [
    ["11.01", "Consensus", "consensus", ""],
    ["11.02", "Leader election", "leader-election", ""],
    ["11.03", "Distributed locks and leases", "distributed-locks-and-leases", ""],
    ["11.04", "Redis Redlock and fencing tokens", "redis-redlock-and-fencing-tokens", ""],
    ["11.05", "Gossip protocol", "gossip-protocol", ""],
    ["11.06", "Metadata service and node discovery", "metadata-service-and-node-discovery", ""],
    ["11.07", "Distributed hash tables", "distributed-hash-tables", ""],
    ["11.08", "A collaborative editor", "collaborative-editing-system-design", "walk"],
  ]],
  ["Storage engines from scratch", [
    ["12.01", "Storage engine design constraints", "storage-engine-design-constraints", ""],
    ["12.02", "Storage engine tradeoffs", "storage-engine-tradeoffs", ""],
    ["12.03", "A file-backed dictionary", "file-backed-dictionary-storage-engine", "code"],
    ["12.04", "Custom binary file format", "custom-binary-file-format", "code"],
    ["12.05", "Immutable versioned data files", "immutable-versioned-data-files", "code"],
    ["12.06", "Log-structured storage", "log-structured-storage", ""],
    ["12.07", "Bitcask storage engine", "bitcask-storage-engine", "code"],
    ["12.08", "LSM-tree storage engine", "lsm-tree-storage-engine", "code"],
    ["12.09", "Memtable, WAL, and SSTable", "memtable-wal-and-sstable", "code"],
    ["12.10", "LSM read path: Bloom filters and sparse index", "lsm-read-path-bloom-and-sparse-index", "code"],
    ["12.11", "Compaction and amplification", "compaction-and-amplification", ""],
    ["12.12", "End-to-end checksums", "end-to-end-checksums", "code"],
  ]],
  ["Object storage", [
    ["13.01", "Object storage vs database", "object-storage-vs-database", ""],
    ["13.02", "S3 object storage architecture", "s3-object-storage-architecture", ""],
    ["13.03", "Byte-range indexed object storage", "byte-range-indexed-object-storage", ""],
    ["13.04", "Range partitioning vs consistent hashing for storage", "range-partitioning-vs-consistent-hashing-storage", ""],
    ["13.05", "Partition manager and map table", "partition-manager-and-map-table", ""],
    ["13.06", "Metadata database for object storage", "metadata-db-for-object-storage", ""],
    ["13.07", "Append-only stream layer", "append-only-object-storage-stream-layer", ""],
    ["13.08", "Durability and replication", "object-storage-durability-and-replication", ""],
    ["13.09", "An object store (S3)", "object-store-system-design", "walk"],
  ]],
  ["Queues and events", [
    ["14.01", "Delegation and async work", "delegation-and-async-work", ""],
    ["14.02", "Task queue vs event stream", "task-queue-vs-event-stream", ""],
    ["14.03", "Event bus for product events", "event-bus-for-product-events", ""],
    ["14.04", "Queue lag", "queue-lag", ""],
    ["14.05", "Postgres SKIP LOCKED work queue", "postgres-skip-locked-work-queue", "code"],
    ["14.06", "Fanout patterns", "fanout-patterns", ""],
    ["14.07", "A Kafka-style log", "partitioned-log-system-design", "walk"],
    ["14.08", "A notification system", "notification-system-design", "walk"],
  ]],
  ["Workflows, schedulers, and contention", [
    ["15.01", "Distributed task scheduler", "distributed-task-scheduler", ""],
    ["15.02", "DAG workflow orchestration", "dag-workflow-orchestration", ""],
    ["15.03", "Rule engine and trigger framework", "rule-engine-trigger-framework", ""],
    ["15.04", "Flash sale inventory locking", "flash-sale-inventory-locking", ""],
    ["15.05", "A ticket booking system", "ticket-booking-system-design", "walk"],
    ["15.06", "A payment system", "payment-system-design", "walk"],
  ]],
  ["Search engine internals", [
    ["16.01", "Information retrieval system design", "information-retrieval-system-design", ""],
    ["16.02", "Inverted index and posting lists", "inverted-index-and-posting-lists", "code"],
    ["16.03", "Boolean and tiered search", "boolean-tiered-search", ""],
    ["16.04", "TF-IDF relevance scoring", "tf-idf-relevance-scoring", "code"],
    ["16.05", "BM25 production ranking", "bm25-production-ranking", "code"],
    ["16.06", "Stop words and champion lists", "stop-words-and-champion-lists", ""],
    ["16.07", "Query understanding pipeline", "query-understanding-pipeline", ""],
    ["16.08", "Search feedback and relevance signals", "search-feedback-and-relevance-signals", ""],
    ["16.09", "Search evaluation metrics", "search-evaluation-metrics", ""],
  ]],
  ["Search at scale and search features", [
    ["17.01", "Search index synchronization", "search-index-synchronization", ""],
    ["17.02", "Search index sharding", "search-index-sharding", ""],
    ["17.03", "Crawler and indexing pipeline", "crawler-and-indexing-pipeline", ""],
    ["17.04", "Vector search and hybrid retrieval", "vector-search-and-hybrid-retrieval", ""],
    ["17.05", "Autocomplete", "autocomplete-system-design", "walk"],
    ["17.06", "Did-you-mean and spell correction", "did-you-mean-and-spell-correction", "walk"],
    ["17.07", "Related searches", "related-searches", "walk"],
    ["17.08", "Recent searches", "recent-searches-system-design", "walk"],
    ["17.09", "A search service", "search-engine-system-design", "walk"],
  ]],
  ["Probabilistic data structures", [
    ["18.01", "Bloom filters", "bloom-filters", "code"],
    ["18.02", "Seen filtering: Bloom vs exact sets", "seen-filtering-bloom-vs-exact-sets", ""],
    ["18.03", "HyperLogLog cardinality estimation", "hyperloglog-cardinality-estimation", "code"],
    ["18.04", "Count-min sketch", "count-min-sketch", "code"],
    ["18.05", "Top-k heavy hitters", "top-k-heavy-hitters", "code"],
    ["18.06", "Reservoir sampling", "reservoir-sampling", "code"],
    ["18.07", "t-digest quantile sketch", "tdigest-quantile-sketch", "code"],
    ["18.08", "Mergeable sketches for analytics", "mergeable-sketches-for-analytics", ""],
  ]],
  ["Counting and analytics pipelines", [
    ["19.01", "Counting at scale", "counting-at-scale", ""],
    ["19.02", "View counting at scale", "view-counting-at-scale", ""],
    ["19.03", "Impression counting", "impression-counting-system-design", "walk"],
    ["19.04", "Bucketed time-window aggregation", "bucketed-time-window-aggregation", "code"],
    ["19.05", "Raw events vs derived analytics", "raw-events-vs-derived-analytics", ""],
    ["19.06", "Streaming percentile analytics", "streaming-percentile-analytics", "code"],
    ["19.07", "Live reactions at high throughput", "live-reactions-high-throughput-design", "walk"],
  ]],
  ["Recommendations", [
    ["20.01", "Matching and recommendation algorithms", "matching-and-recommendation-algorithms", ""],
    ["20.02", "A recommendation system", "recommendation-system-design", "walk"],
  ]],
  ["Realtime delivery", [
    ["21.01", "WebSockets vs SSE vs long polling", "websockets-vs-sse-vs-long-polling", ""],
    ["21.02", "Realtime database and WebSocket scaling", "realtime-database-and-websocket-scaling", ""],
    ["21.03", "Live commentary", "live-commentary-system-design", "walk"],
    ["21.04", "Chat and messaging", "chat-and-messaging-system-design", "walk"],
  ]],
  ["Social products", [
    ["22.01", "Social network database modeling", "social-network-database-modeling", ""],
    ["22.02", "Social graph: follows and FlockDB", "social-graph-follows-and-flockdb", ""],
    ["22.03", "Feed generation: push, pull, hybrid", "feed-generation-push-pull-hybrid", ""],
    ["22.04", "Hashtag extraction and tag store", "hashtag-extraction-and-tag-store", "code"],
    ["22.05", "Reaction modeling", "reaction-modeling", ""],
    ["22.06", "A newly-unread indicator", "newly-unread-indicator", "walk"],
    ["22.07", "Photo tagging coordinates", "photo-tagging-coordinate-model", "walk"],
    ["22.08", "A social feed", "social-feed-system-design-case-study", "walk"],
  ]],
  ["Geo and matching", [
    ["23.01", "Nearby geospatial search", "nearby-geospatial-search-system-design", ""],
    ["23.02", "Geohash prefix spatial index", "geohash-prefix-spatial-index", "code"],
    ["23.03", "Grid systems: H3, S2, geohash", "geospatial-grid-systems-h3-s2-geohash", ""],
    ["23.04", "Redis GEO hot path", "redis-geo-spatial-hot-path", "code"],
    ["23.05", "Geofencing: point in polygon", "geofencing-point-in-polygon", ""],
    ["23.06", "Ray casting point in polygon", "ray-casting-point-in-polygon", "code"],
    ["23.07", "Nearby search", "geospatial-nearby-search-case-study", "walk"],
    ["23.08", "Ride matching", "ride-matching-system-design", "walk"],
  ]],
  ["Media, files, and CDN", [
    ["24.01", "Direct-to-object-storage upload", "direct-to-object-storage-upload", ""],
    ["24.02", "Image CDN and resizing", "image-cdn-and-resizing", ""],
    ["24.03", "An avatar service", "gravatar-style-avatar-service", "walk"],
    ["24.04", "Video upload: signed URLs and multipart", "video-upload-signed-url-multipart", ""],
    ["24.05", "Video transcoding pipeline", "video-transcoding-pipeline", ""],
    ["24.06", "Adaptive bitrate and the CDN decider", "adaptive-bitrate-and-cdn-decider", ""],
    ["24.07", "Signed URLs, DRM, and video security", "signed-urls-drm-and-video-security", ""],
    ["24.08", "Live streaming, WebRTC, and latency", "live-streaming-webrtc-and-latency", ""],
    ["24.09", "A video platform", "video-platform-system-design", "walk"],
  ]],
  ["File sync", [
    ["25.01", "Remote file sync design", "remote-file-sync-design", ""],
    ["25.02", "Fixed-block chunking and content addressing", "fixed-block-chunking-and-content-addressing", "code"],
    ["25.03", "Blocklist versioned file metadata", "blocklist-versioned-file-metadata", ""],
    ["25.04", "A file sync service", "file-sync-system-design", "walk"],
  ]],
  ["Observability and incidents", [
    ["26.01", "Observability for distributed systems", "observability-for-distributed-systems", ""],
    ["26.02", "SLOs and error budgets", "slos-and-error-budgets", ""],
    ["26.03", "Incident response", "incident-response", ""],
    ["26.04", "Observability and SLOs", "observability-slo-case-study", "walk"],
  ]],
  ["Changing a live system", [
    ["27.01", "Deployment and migration safety", "deployment-and-migration-safety", ""],
    ["27.02", "Database migration safety", "database-migration-safety", ""],
    ["27.03", "Parallel monolith read drain", "parallel-monolith-read-drain", ""],
    ["27.04", "A database migration", "zero-downtime-database-migration-case-study", "walk"],
  ]],
  ["Data protection and tenancy", [
    ["28.01", "Backups and restore", "database-backups-and-restore", ""],
    ["28.02", "Disaster recovery", "disaster-recovery", ""],
    ["28.03", "Data retention, deletion, and privacy", "data-retention-and-deletion", ""],
    ["28.04", "Security and abuse prevention", "security-and-abuse-prevention", ""],
    ["28.05", "Multi-tenant design", "multi-tenant-design", ""],
    ["28.06", "GitLab's database incident", "case-gitlab-database-incident", "case"],
  ]],
  ["The system design interview", [
    ["29.01", "What the interview measures", "what-the-interview-measures", ""],
    ["29.02", "A 45-minute plan", "interview-45-minute-plan", ""],
    ["29.03", "Presenting tradeoffs", "presenting-tradeoffs", ""],
    ["29.04", "Common mistakes", "interview-common-mistakes", ""],
    ["29.05", "A photo-sharing interview", "interview-design-instagram", "walk"],
  ]],
  ["Capstone", [
    ["30.01", "Write a design document", "write-a-design-document", ""],
    ["30.02", "Capstone: design and build your own system", "capstone-design-and-build", "code"],
  ]],
];

const system = {
  id: "system",
  path: "/system",
  name: "System Design In Depth",
  eyebrow: "Engineering path",
  headline: "Design systems you can defend.",
  lede: "From one request to a design that holds at scale, one decision at a time, with the numbers behind each one.",
  modules: systemLessons.map(([title, lessons]) => ({
    title,
    lessons: lessons.map(([code, name, slug, flags]) => {
      const flagSet = new Set(flags.split(/\s+/).filter(Boolean));
      return {
        code,
        title: name,
        slug,
        free: flagSet.has("free"),
        codeLab: flagSet.has("code"),
        kind: flagSet.has("walk") ? "walkthrough" : flagSet.has("case") ? "case" : "lesson",
      };
    }),
  })),
};

const papers = [
  ["alexnet", "ai", "ImageNet Classification with Deep Convolutional Neural Networks", "Krizhevsky, Sutskever, Hinton", 2012, "A deep convnet, trained on GPUs, beat the field at image classification and made representation learning the default bet."],
  ["adam", "ml", "Adam: A Method for Stochastic Optimization", "Kingma, Ba", 2014, "Adaptive per-parameter step sizes from first and second moments. Know what the bias correction is doing, and when AdamW is the version you actually want."],
  ["resnet", "ai", "Deep Residual Learning for Image Recognition", "He, Zhang, Ren, Sun", 2015, "Residual connections let very deep nets train. The idea travels: a skip is how you keep a signal alive through a stack of layers."],
  ["attention", "ai", "Attention Is All You Need", "Vaswani et al.", 2017, "Self-attention replaces recurrence. Queries, keys, and values are the whole mechanism, and the cost is quadratic in sequence length."],
  ["bert", "ai", "BERT: Pre-training of Deep Bidirectional Transformers", "Devlin et al.", 2018, "Masked language modeling makes a transformer useful as a representation, not only as a left-to-right generator."],
  ["gpt3", "ai", "Language Models are Few-Shot Learners", "Brown et al.", 2020, "Scale plus next-token training produces in-context learning. The paper is as much about what you no longer fine-tune as about the model."],
  ["scaling", "ai", "Scaling Laws for Neural Language Models", "Kaplan et al.", 2020, "Loss falls as a power law in parameters, data, and compute. The allocation between them is the decision."],
  ["chinchilla", "ai", "Training Compute-Optimal Large Language Models", "Hoffmann et al.", 2022, "For a fixed compute budget, earlier models were under-trained. Tokens should scale with parameters."],
  ["instructgpt", "ai", "Training language models to follow instructions with human feedback", "Ouyang et al.", 2022, "Supervised demonstrations, then a reward model, then RL. Alignment here is a product pipeline, not a single loss."],
  ["lora", "ai", "LoRA: Low-Rank Adaptation of Large Language Models", "Hu et al.", 2021, "Freeze the base weights and train a low-rank update. Adaptation becomes cheap enough to keep one base and many tasks."],
  ["flashattention", "ai", "FlashAttention: Fast and Memory-Efficient Exact Attention", "Dao et al.", 2022, "Exact attention, tiled so the score matrix never lands fully in slow memory. IO is the bottleneck, not the FLOPs on paper."],
  ["dpo", "ai", "Direct Preference Optimization", "Rafailov et al.", 2023, "Preference pairs can train the policy directly. The reward model and the RL loop are not the only way to use comparisons."],
  ["lamport", "systems", "Time, Clocks, and the Ordering of Events", "Lamport", 1978, "Happened-before is a partial order. Logical clocks exist because wall clocks cannot be trusted to agree."],
  ["lsm", "systems", "The Log-Structured Merge-Tree", "O'Neil et al.", 1996, "Absorb writes in memory, flush sorted runs, merge them later. Write amplification is the bill you pay for that shape."],
  ["gfs", "systems", "The Google File System", "Ghemawat, Gobioff, Leung", 2003, "Large files, append-heavy workloads, and a single master with the metadata. Failures are normal, not exceptional."],
  ["mapreduce", "systems", "MapReduce: Simplified Data Processing on Large Clusters", "Dean, Ghemawat", 2004, "A tiny programming model on top of a hard distributed system: placement, shuffle, stragglers, and re-execution."],
  ["bigtable", "systems", "Bigtable: A Distributed Storage System for Structured Data", "Chang et al.", 2006, "A sparse sorted map on tablets. Locality comes from the key order you choose, not from the storage layer guessing."],
  ["dynamo", "systems", "Dynamo: Amazon's Highly Available Key-value Store", "DeCandia et al.", 2007, "Consistent hashing, sloppy quorums, and hinted handoff. Availability wins, and conflicts become the application's problem."],
  ["paxos", "systems", "Paxos Made Simple", "Lamport", 2001, "A quorum agrees on one value even when messages are lost and proposers compete. Read it until the two phases feel inevitable."],
  ["chubby", "systems", "The Chubby Lock Service", "Burrows", 2006, "A coarse lock and naming service that people used as a source of truth. Reliability and a small API beat a clever one."],
  ["zookeeper", "systems", "ZooKeeper: Wait-free Coordination", "Hunt et al.", 2010, "A totally ordered wait-free API for coordination recipes: locks, membership, and configuration, built on a consensus core."],
  ["raft", "systems", "In Search of an Understandable Consensus Algorithm", "Ongaro, Ousterhout", 2014, "Leader election, log replication, and safety told as one story. Understandability is a design requirement."],
  ["spanner", "systems", "Spanner: Google's Globally-Distributed Database", "Corbett et al.", 2012, "External consistency across datacenters, with TrueTime bounding clock uncertainty so timestamps can order transactions."],
  ["kafka", "systems", "Kafka: a Distributed Messaging System for Log Processing", "Kreps, Narkhede, Rao", 2011, "A partitioned, replayable log. Consumers pull, retention is the buffer, and the log outlives any one subscription."],
  ["shannon", "ml", "A Mathematical Theory of Communication", "Shannon", 1948, "Information, entropy, and the idea that a channel has a capacity. Compression and noise are the same subject."],
  ["backprop", "ml", "Learning representations by back-propagating errors", "Rumelhart, Hinton, Williams", 1986, "Credit assignment through a stack of layers by the chain rule. Everything later is an implementation of this."],
  ["lenet", "ml", "Gradient-Based Learning Applied to Document Recognition", "LeCun et al.", 1998, "A full pipeline: pixels, convolution, subsampling, and a trained classifier, on a real document problem."],
  ["lstm", "ml", "Long Short-Term Memory", "Hochreiter, Schmidhuber", 1997, "Gates keep a memory cell from vanishing or exploding across long gaps. The cell is the product, the recurrence is the carrier."],
  ["dropout", "ml", "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", "Srivastava et al.", 2014, "Randomly drop units in training so the network cannot rely on a single co-adapted path."],
  ["batchnorm", "ml", "Batch Normalization", "Ioffe, Szegedy", 2015, "Normalize inside the network so each layer sees a steadier distribution. It changes the optimization landscape, not just the scale."],
  ["vae", "ml", "Auto-Encoding Variational Bayes", "Kingma, Welling", 2013, "An encoder, a decoder, and a latent distribution you can sample. The ELBO is the compromise you can actually optimize."],
  ["gan", "ml", "Generative Adversarial Nets", "Goodfellow et al.", 2014, "A generator and a discriminator in a game. The training target is a moving one, which is why it is powerful and brittle."],
  ["rethink", "ml", "Understanding Deep Learning Requires Rethinking Generalization", "Zhang et al.", 2017, "Nets can memorize noise and still generalize on real data. Classical capacity stories are not enough."],
  ["lottery", "ml", "The Lottery Ticket Hypothesis", "Frankle, Carbin", 2018, "A dense net contains sparse subnetworks that, trained from their original initialization, match the dense net."],
  ["descent", "ml", "Deep Double Descent", "Nakkiran et al.", 2019, "The bias-variance U-shape returns, then test error falls again as models become heavily overparameterized."],
  ["ddpm", "ml", "Denoising Diffusion Probabilistic Models", "Ho, Jain, Abbeel", 2020, "Learn to reverse a noise process, one small step at a time. Sampling quality comes from many cheap denoising steps."],
].map(([slug, track, title, authors, year, brief], index) => ({
  slug,
  track,
  title,
  authors,
  year,
  brief,
  order: index + 1,
  question: `What would break if you applied ${title.split(":")[0]} without the assumption the authors relied on?`,
}));

const posts = [
  {
    slug: "one-stream-two-performances",
    tag: "Realtime",
    title: "One stream, two performances",
    dek: "A face and a voice that stay in time are an inference problem, not a chatbot with a portrait.",
    date: "2026-09-25",
    author: "Study desk",
    minutes: 8,
    body: [
      "A talking face that matches a voice is easy to demo and hard to serve. The interesting constraint is not the avatar. It is that one generated stream has to drive two performances, sound and motion, and both have to arrive before the silence feels broken.",
      "Causal generation matters here. The model cannot wait for a full utterance, render a video, and then start playback. Each chunk has to be produced from what has already been said, and the next chunk has to continue from that state. That is the same prefill-and-decode tension as a text model, with a frame budget instead of a token budget.",
      "Once you look at it that way, the product questions get concrete. How many sessions fit on a GPU if each one holds its own state? What is the acceptable motion lag before the face and the voice split? Which part of the pipeline is memory-bound, and which part is waiting on the network?",
      "This note is an original study essay. It is not a reprint of any article on the reference site.",
    ],
  },
  {
    slug: "the-agent-forgets",
    tag: "Agents",
    title: "The agent forgets, even when the model doesn't",
    dek: "Most of what a modern agent learns lives outside the weights.",
    date: "2026-09-24",
    author: "Study desk",
    minutes: 7,
    body: [
      "A frozen model does not forget a fact it was trained on. An agent still can. Prompts, memory files, tool lists, and routing rules are part of the behavior, and they change on a different schedule from the weights.",
      "That split is useful. You can fix a tool schema without a training run. It is also how last week's reliable path quietly dies: a skill file was edited, a memory note was compacted, a router started sending a class of questions somewhere else.",
      "Treat those artifacts as code. Version them, review them, and keep a small eval set that fails when a change costs you a behavior you meant to keep. A gate that only commits a change when the old cases still pass is a product decision, not a research slogan.",
      "This note is an original study essay about the idea, written for this build.",
    ],
  },
  {
    slug: "mostly-waiting",
    tag: "Backends",
    title: "Most of an AI request is waiting",
    dek: "A chat endpoint spends almost none of its life computing.",
    date: "2026-09-16",
    author: "Study desk",
    minutes: 6,
    body: [
      "Draw a four-second request as a bar. The model call is a slice. DNS, TLS, queueing, retrieval, tool round-trips, and the client's patience are the rest. If you only optimize the slice you can see in a profiler, you will miss the wait.",
      "Waiting is why async earns its keep in an AI backend, and why a bigger worker pool does not help a service that is blocked on one remote call. The concurrency lab on this site is the same picture with a slider.",
      "Once the bar is honest, architecture choices get quieter. Cache the retrieval. Stream the tokens so the user is not staring at the full wait. Put a timeout on every outbound call, including the model.",
    ],
  },
  {
    slug: "three-flavors-of-simulation",
    tag: "Agents",
    title: "Three flavors of simulating an agent pipeline",
    dek: "An eval that only checks a frozen answer will miss a pipeline that fails in motion.",
    date: "2026-09-12",
    author: "Study desk",
    minutes: 7,
    body: [
      "The cheapest simulation replays a transcript. You pin the model outputs and check that your tool router and your state machine do what they did last time. It is a regression test. It will not tell you whether a new prompt still reaches the right tool.",
      "The next flavor stubs the model with a small scripted policy: given this state, emit this tool call. You can walk the pipeline through branches without paying for tokens and without pretending the script is a language model.",
      "The expensive flavor calls the real model on a small set of tasks and scores the trace: did it stop, did it ask for approval, did the side effect happen once. Run that set when the prompt, the tools, or the model version change. Use the cheaper two on every commit.",
    ],
  },
];

const news = [
  ["Frontier models keep showing up as product surfaces", "A new model release matters here when it changes latency, context, or the tool-use loop, not when it changes a leaderboard screenshot.", "6h"],
  ["Voice interfaces are still waiting on turn-taking", "Speech products fail in the pause between sentences. The serving budget is the conversation, not the word error rate alone.", "9h"],
  ["On-device and hosted models are a routing choice", "Local models win on privacy and tail latency for short prompts. Hosted models win when the quality gap is still the product.", "14h"],
  ["Data-center power is now part of the design doc", "A serving plan that ignores energy, water, and community constraints is an incomplete capacity plan.", "1d"],
  ["Agent products are growing a permission layer", "The interesting ship this season is not another planner. It is the sandbox, the approval step, and the trace you can read after a bad run.", "1d"],
  ["Eval sets are leaving the notebook", "Teams that can describe a regression in a trace will outrun teams that only have a vibe check channel.", "2d"],
  ["Chip diversity is a portability problem", "A stack that runs on one vendor's kernel library will meet a second vendor the week capacity gets tight.", "2d"],
  ["Long context does not remove retrieval", "A bigger window changes the cutoff. It does not make unscoped search free, and it does not make stale documents fresh.", "3d"],
];

const resources = [
  ["Python language reference", "https://docs.python.org/3/", "Language", "The standard for syntax, the data model, and the standard library."],
  ["uv", "https://docs.astral.sh/uv/", "Tools", "Project, lockfile, and environment management for the Python track."],
  ["FastAPI", "https://fastapi.tiangolo.com/", "Frameworks", "The web framework the support-agent project is built on."],
  ["Pydantic", "https://docs.pydantic.dev/", "Frameworks", "Validation, settings, and the models that cross the API boundary."],
  ["Model Context Protocol", "https://modelcontextprotocol.io/", "Agents", "The spec for tools that live outside one vendor's SDK."],
  ["vLLM", "https://docs.vllm.ai/", "Inference", "A serving stack used as the concrete example for batching and KV cache."],
  ["Designing Data-Intensive Applications", "https://dataintensive.net/", "Books", "The book to read beside the storage, replication, and stream modules."],
  ["The SRE Book", "https://sre.google/sre-book/table-of-contents/", "Books", "SLOs, incidents, and the operational half of a design."],
  ["Raft paper", "/papers/raft/", "Papers", "The consensus paper in this reading order, linked from the shelf."],
  ["Attention Is All You Need", "/papers/attention/", "Papers", "The transformer paper the inference track keeps spending."],
];

const faqs = [
  ["Where should I start?", "Start free. If you want to build AI backends in Python, open Python with AI. If you want to know how models are actually served, open Inference Engineering. If you want architecture judgment and interview practice, open System Design."],
  ["What is actually inside Inference Engineering?", "How models are served: GPUs and memory, the KV cache, batching, quantization, speculative decoding, parallelism and autoscaling, with the arithmetic worked in the open."],
  ["What is actually inside Python with AI?", "Python through FastAPI, Pydantic, streaming, agents, MCP and tracing. One support-agent project is carried through the path."],
  ["What is actually inside System Design?", "Notes, case files, and from-scratch implementations: requests, storage, caches, queues, search, realtime, and the interview shapes those ideas show up in."],
  ["Is this only for interview prep?", "System Design is useful in an interview because it is useful on the job. The other two tracks are about building and serving, not about a whiteboard ritual."],
  ["What is the course assistant?", "A study assistant that answers from the lesson titles and notes in this build, draws a small figure, and can quiz you. On the reference product it is backed by a hosted model. Here it runs locally in your browser."],
  ["How often does the material change?", "Lessons are revised when the underlying tools change. This study build snapshots the path structure and writes original notes, so it will not track upstream edits automatically."],
];

const catalog = {
  courses: [python, inference, system],
  papers,
  posts,
  news: news.map(([title, dek, age]) => ({ title, dek, age })),
  resources,
  faqs,
};

const counts = {};
for (const course of catalog.courses) {
  const lessons = course.modules.flatMap((mod) => mod.lessons);
  counts[course.id] = {
    modules: course.modules.length,
    lessons: lessons.length,
    free: lessons.filter((lesson) => lesson.free).length,
    code: lessons.filter((lesson) => lesson.codeLab).length,
    walks: lessons.filter((lesson) => lesson.kind === "walkthrough").length,
    cases: lessons.filter((lesson) => lesson.kind === "case").length,
  };
  const slugs = new Set();
  for (const lesson of lessons) {
    if (slugs.has(lesson.slug)) throw new Error(`duplicate slug ${course.id} ${lesson.slug}`);
    slugs.add(lesson.slug);
  }
}
console.log(counts);
writeFileSync(join(root, "catalog.json"), JSON.stringify(catalog));
