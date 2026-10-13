import type { Lesson } from "@/lib/catalog";

export type FigureKind = "flow" | "cache" | "queue" | "loop" | "bars" | "gpu";

export type LessonNote = {
  figure: FigureKind;
  caption: string;
  watch: string[];
  paragraphs: string[];
  code: string | null;
  tryIt: string;
  quiz: { prompt: string; choices: string[]; answer: number };
};

const essays: Record<string, Omit<LessonNote, "quiz"> & { quiz?: LessonNote["quiz"] }> = {
  "what-an-ai-backend-is": {
    figure: "flow",
    caption: "A request comes in, waits on a model or a tool, and leaves as a stream.",
    watch: [
      "An AI backend is an ordinary service with one expensive, slow dependency: the model.",
      "The request still has auth, validation, storage, and a timeout. The model does not replace those.",
      "Most of the wall clock is waiting. Streaming exists so the user can see the wait.",
      "The project in this path is one support agent, carried until it is traced and deployed.",
    ],
    paragraphs: [
      "Start with the shape, not the framework. A person sends a message. Your service checks who they are, loads the ticket, calls a model, maybe calls a tool, and writes the reply back. Every box around the model is the backend.",
      "The model call is different from a database query in two ways that matter. It is slow enough that a synchronous worker feels stuck, and its output is a stream of tokens rather than a single row. Those two facts decide FastAPI, async, and server-sent events later in the path.",
      "Nothing here requires a hosted model on day one. You can stub the call, assert the route, and keep the same function signature when a real provider shows up. The boundary is a function that accepts messages and returns text or a stream.",
    ],
    code: `def answer(ticket_id: str, message: str) -> str:\n    history = load_history(ticket_id)\n    history.append({"role": "user", "content": message})\n    reply = call_model(history)\n    save_turn(ticket_id, reply)\n    return reply`,
    tryIt: "Name the boxes around the model in a support reply: auth, history, the call, the save. Which one is allowed to take multiple seconds?",
  },
  "what-inference-engineering-is": {
    figure: "gpu",
    caption: "Prefill reads the prompt. Decode emits tokens, and the KV cache is why decode gets heavy.",
    watch: [
      "Inference engineering is the work of serving a model inside a latency and money budget.",
      "Training made the weights. Serving has to spend them on every request.",
      "The first split is prefill versus decode. They stress the machine differently.",
      "You measure time to first token and tokens per second before you buy a bigger GPU.",
    ],
    paragraphs: [
      "A model that scored well in a paper is not yet a service. Someone has to decide the batch, the precision, the cache, and what happens when fifty requests arrive in the same second.",
      "The useful question is arithmetic. How many bytes does the KV cache cost for this context length, and does that fit in the GPU you actually have? If it does not, the quality of the checkpoint is irrelevant.",
      "This track stays on that arithmetic: batching, quantisation, speculation, parallelism, and the autoscaler that notices the queue. The capstone is a small serving plan, not a new architecture.",
    ],
    code: null,
    tryIt: "Write the two numbers you would ask for before changing a serving stack: time to first token, and tokens per second at the batch you expect.",
  },
  "what-a-system-is": {
    figure: "flow",
    caption: "A system is a boundary, a promise, and the failure you are willing to show the caller.",
    watch: [
      "A system is the thing a caller depends on, not the diagram of boxes you drew first.",
      "The promise is a latency, a durability story, and what happens when a dependency is down.",
      "Most designs fail by being vague about the promise, not by picking the wrong database.",
      "The rest of this path is one promise at a time, with a number attached.",
    ],
    paragraphs: [
      "Call something a system when another team can build against it without reading your process list. The interface, the data it remembers, and the way it fails are the product. The servers are how you afford the promise.",
      "A useful design starts with the caller. What do they send, what must be true when you reply, and which delays are acceptable? If you cannot say those in a sentence, the boxes on the whiteboard are decoration.",
      "This course walks that sentence from a single request out to caches, partitions, and interviews. The interview is the same skill with a clock: make the promise, then spend the minutes on the part that can break it.",
    ],
    code: null,
    tryIt: "Pick a service you used today. Write its promise in one sentence, including one way it is allowed to fail.",
  },
};

function figureFor(title: string): FigureKind {
  const t = title.toLowerCase();
  if (/cache|cdn|kv/.test(t)) return "cache";
  if (/queue|batch|fanout|backpressure|schedul/.test(t)) return "queue";
  if (/agent|loop|tool|graph|mcp/.test(t)) return "loop";
  if (/gpu|quant|attention|prefill|cuda|batching/.test(t)) return "gpu";
  if (/count|metric|latency|percent|cost|scal/.test(t)) return "bars";
  return "flow";
}

function codeFor(title: string, courseName: string): string | null {
  const t = title.toLowerCase();
  if (courseName.startsWith("Python") || /fastapi|pydantic|async|pytest|sqlalchemy/.test(t)) {
    if (/pydantic|model/.test(t)) return `class Ticket(BaseModel):\n    id: str\n    body: str = Field(min_length=1)\n\nTicket.model_validate({"id": "t_1", "body": "hi"})`;
    if (/fastapi|path|router|middleware/.test(t)) return `@app.post("/tickets")\nasync def create(ticket: Ticket, db: Session = Depends(get_db)) -> Ticket:\n    return await db.save(ticket)`;
    if (/async|timeout|gather/.test(t)) return `async with asyncio.timeout(2):\n    reply, profile = await asyncio.gather(call_model(history), load_user(user_id))`;
    return `def step(state: dict) -> dict:\n    state["seen"] = state.get("seen", 0) + 1\n    return state`;
  }
  if (/sql|index|pagination|lock/.test(t)) return `select id, body\nfrom tickets\nwhere id > $cursor\norder by id\nlimit 50;`;
  if (/bloom|hash|sketch|sample/.test(t)) return `def maybe_seen(item: bytes) -> bool:\n    return all(bit[hash(item, i)] for i in range(k))`;
  return null;
}

export function lessonNote(courseName: string, moduleTitle: string, lesson: Lesson): LessonNote {
  const essay = essays[lesson.slug];
  const figure = essay?.figure ?? figureFor(lesson.title);
  const paragraphs = essay?.paragraphs ?? [
    `${lesson.title} sits in ${moduleTitle} on the ${courseName} path. The lesson is one decision: what you are trying to make true, and which cost you are willing to pay for it.`,
    `Read it as a constraint, not a glossary entry. If ${lesson.title.toLowerCase()} is doing its job, a caller can predict the next failure. If it is only a diagram, you cannot.`,
    lesson.kind === "walkthrough"
      ? "This is a design walkthrough. Start from the promise, add one component when the number demands it, and say what you refused to add."
      : lesson.kind === "case"
        ? "This is a case file. The point is the constraint the team actually had, and the part of the textbook design they did not use."
        : "Keep a number next to the idea: a latency, a byte count, a fan-out, or a failure you can name. The number is what you will defend later.",
  ];
  const watch = essay?.watch ?? [
    `${lesson.title} is the next decision in ${moduleTitle}.`,
    paragraphs[0],
    "Watch the figure change with the sentence, then read the same picture in the notes.",
    "The exercise asks you to add one piece, not to rebuild the system.",
  ];
  const code = essay?.code ?? (lesson.codeLab ? codeFor(lesson.title, courseName) : null);
  const choices = [
    "Make the promise and the failure explicit before adding components.",
    "Add a queue, a cache, and a second region first, then name the requirement.",
    "Skip measurement until the design feels finished.",
    "Treat the diagram as the requirement.",
  ];
  return {
    figure,
    caption: essay?.caption ?? `One picture for ${lesson.title}: the moving part is the constraint, not the decoration.`,
    watch,
    paragraphs,
    code,
    tryIt: essay?.tryIt ?? `In two sentences, explain ${lesson.title} to someone who will operate it at 2 a.m. Include one number or one failure.`,
    quiz: essay?.quiz ?? {
      prompt: `What should you be able to say after ${lesson.title}?`,
      choices,
      answer: 0,
    },
  };
}
