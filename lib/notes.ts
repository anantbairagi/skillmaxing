import type { Lesson } from "@/lib/catalog";
import type { FigureKind } from "@/components/Marks";

export type Scene = {
  title: string;
  seconds: number;
  caption: string;
  visual: FigureKind;
};

export type Section = {
  heading: string;
  kicker?: string;
  paragraphs: string[];
  table?: { headers: string[]; rows: string[][] };
  code?: string;
};

export type Check = { q: string; a: string };

export type LessonDoc = {
  oneLine: string;
  readMin: number;
  scenes: Scene[];
  sections: Section[];
  tryIt: string[];
  checks: Check[];
};

const hand: Record<string, LessonDoc> = {
  "what-an-ai-backend-is": {
    oneLine: "An AI backend is an ordinary web service with one slow, costly, unpredictable call in the middle. Most of the work is everything around that call.",
    readMin: 8,
    scenes: [
      { title: "A ticket comes in", seconds: 28, visual: "flow", caption: "Priya sends a message about ticket 4821. Your service still has to check the request, load the ticket, and save the reply. Only the middle step is new: a call to a model." },
      { title: "Five parts", seconds: 32, visual: "loop", caption: "API, data, model, tools, and a record of what happened. Four of those look like any service that calls an outside API. The tools part is the one where the model can ask your code to run a function." },
      { title: "One message, timed", seconds: 30, visual: "bars", caption: "Walk the same message down the steps and watch the time column. Database reads are milliseconds. The two model calls are the only rows that take seconds." },
      { title: "Not a database query", seconds: 34, visual: "cache", caption: "A model call is slower, it is billed by the text you send, and the same question can come back worded differently. That is why the reply is streamed, cached where it can be, and tested by shape rather than by exact text." },
      { title: "Why 20 users can freeze a small service", seconds: 36, visual: "queue", caption: "Eight workers that each hold a request for 20 milliseconds can serve hundreds of requests a second. If each chat holds a worker for about 10 seconds, user nine is already waiting. Waiting has to release the worker." },
    ],
    sections: [
      {
        heading: "The shape of the request",
        paragraphs: [
          "Picture a support agent named Priya looking at ticket 4821. She types a question and presses send. Your backend receives a message, a ticket id, and a user. Most of what happens next is ordinary: validate the body, read the ticket, write the reply back.",
          "One step is different. In the middle, the service asks a language model. An AI backend is a web service that makes that call while it handles the request. In this course the service is called Relay, a helper for teams like Priya's. Each lesson adds one piece of Relay, and the piece stays in the project.",
        ],
      },
      {
        heading: "The five parts of an AI backend",
        paragraphs: [
          "Whatever framework you pick, Relay ends up with the same five parts: an API that accepts the message, a database that holds the ticket and the chat, a model call, tools the model is allowed to ask for, and a trace of the prompt, the tool calls, and the raw reply.",
          "The tools row is the odd one. In a normal service your code decides every step. Here the model can answer with a request instead of text, such as lookup_customer for customer 77. Your code decides whether that is allowed, runs the function, and sends the result back. The model tries again with the new facts. That loop is an agent. You will write it by hand before a framework hides it.",
        ],
        table: {
          headers: ["Part", "Relay's job"],
          rows: [
            ["API", "Take the message and say who is calling"],
            ["Data", "Load the ticket and the chat so far"],
            ["Model", "Ask for the next reply"],
            ["Tools", "Run only the functions you allow"],
            ["Trace", "Keep the prompt, the tool calls, and the raw output"],
          ],
        },
      },
      {
        heading: "One message through Relay",
        paragraphs: [
          "Follow ticket 4821 from the first check to the saved record and watch the time column. Auth, the database, and the save are milliseconds. The model calls are the only steps that take seconds.",
          "The sketch below uses a stand-in for the model. If the reply is text, that is the answer. If the reply is a tool request, Relay runs the tool and loops. Later lessons replace each line with a real piece.",
        ],
        code: `def answer(ticket_id, message):
    history = load_history(ticket_id)
    history.append({"role": "user", "content": message})
    while True:
        reply = call_model(history)
        if reply.kind == "text":
            save_turn(ticket_id, reply.text)
            return reply.text
        history.append(run_tool(reply.tool))`,
      },
      {
        heading: "How a model call differs from a database query",
        paragraphs: [
          "Speed changes the design first. Nobody should stare at a spinner for ten seconds, so Relay streams tokens to the browser from the first version.",
          "Cost is next. Providers bill by token, a short piece of text. Relay sends the chat again on each call, so a long chat costs more every time. A cache and a shorter history are how you stop paying twice for the same context.",
          "The last difference breaks an old testing habit. The same question can come back in different words. Tests check the shape of the answer and which tools were chosen, not one exact sentence.",
        ],
        table: {
          headers: ["", "Database query", "Model call"],
          rows: [
            ["Time", "Milliseconds", "Seconds"],
            ["Bill", "Mostly flat", "Per token, both ways"],
            ["Same input", "Same rows", "Wording can change"],
          ],
        },
      },
      {
        heading: "Where it goes wrong",
        paragraphs: [
          "A common bug is to treat the model's words as a command. If Relay escalates a ticket whenever the reply contains the phrase \"escalate this ticket\", a customer can type those words and pull a person into the queue. The model may suggest. Your code decides.",
          "Another bug is to have nothing to look at the next day. A trace holds the prompt, each tool call with its result, and the raw output. Give every model call a timeout, a spend limit, a retry limit, and that trace from the start.",
          "The third bug is the worker. Say Relay runs 8 workers, each handling one request at a time. A normal request holds a worker for about 20 ms, so 8 workers serve on the order of 400 requests a second. A chat that holds a worker for about 10 seconds drops that to less than one request a second, and the next person waits. Later, async code frees the worker while the model writes. The provider still caps how many calls you can have in flight, so Relay uses a semaphore, a counter that lets only so many model calls run at once.",
          "Retries cost money too. Each retry sends the prompt again. The provider SDKs retry on their own and will wait a long time unless you set a limit.",
        ],
      },
    ],
    tryIt: [
      "Before you write code, draw Relay as five boxes. Follow a message that was charged twice through them, number each step, and mark where the request waits longest and where it costs money.",
      "Keep the sketch. When you get to tracing, compare it with a real run. The next lesson sets up Python 3.14, uv, and your editor.",
    ],
    checks: [
      { q: "Relay calls the model, and the reply is a request to run lookup_customer. What does Relay's code do next?", a: "It checks that the tool is allowed, runs it, appends the result, and calls the model again. It does not treat the tool name as the user's answer." },
      { q: "In the path for ticket 4821, which steps take seconds, and why does that make Relay stream?", a: "The model calls. Everything else is milliseconds. Streaming lets Priya read the reply while those seconds are still passing." },
      { q: "Yesterday Relay gave a customer a strange answer, and your lead asks why. What must you have kept?", a: "The trace: the prompt, each tool call and its result, and the model's raw output." },
    ],
  },
};

function visualFor(title: string): FigureKind {
  const t = title.toLowerCase();
  if (/cache|cdn|kv|prefix/.test(t)) return "cache";
  if (/queue|batch|fan|schedul|worker|async wait/.test(t)) return "queue";
  if (/agent|loop|tool|graph|mcp|handoff/.test(t)) return "loop";
  if (/gpu|quant|attention|prefill|cuda|specul/.test(t)) return "gpu";
  if (/count|metric|latency|percent|cost|scal|number/.test(t)) return "bars";
  return "flow";
}

function codeFor(title: string, withCode: boolean): string | undefined {
  if (!withCode) return undefined;
  const t = title.toLowerCase();
  if (/pydantic|model and validation|field/.test(t)) {
    return `class Ticket(BaseModel):\n    id: str\n    body: str = Field(min_length=1)`;
  }
  if (/fastapi|path|router|middleware|auth/.test(t)) {
    return `@app.post("/tickets")\nasync def create(ticket: Ticket) -> Ticket:\n    return await save(ticket)`;
  }
  if (/async|timeout|gather|httpx/.test(t)) {
    return `async with asyncio.timeout(2):\n    reply, row = await asyncio.gather(call_model(history), load_ticket(ticket_id))`;
  }
  if (/sql|index|pagination|lock|wal|btree/.test(t)) {
    return `select id, body\nfrom tickets\nwhere id > $cursor\norder by id\nlimit 50;`;
  }
  if (/bloom|hash|sketch|sample/.test(t)) {
    return `def maybe_seen(item: bytes) -> bool:\n    return all(bits[hash(item, i) % m] for i in range(k))`;
  }
  return `def step(state: dict) -> dict:\n    state["turns"] = state.get("turns", 0) + 1\n    return state`;
}

export function lessonDoc(courseName: string, moduleTitle: string, lesson: Lesson): LessonDoc {
  const written = hand[lesson.slug];
  if (written) return written;
  const visual = visualFor(lesson.title);
  const code = codeFor(lesson.title, lesson.codeLab);
  const oneLine = `${lesson.title} is one decision in ${moduleTitle}: what you are making true, what it costs, and how you would notice you chose wrong.`;
  const scenes: Scene[] = [
    { title: "The decision", seconds: 18, visual, caption: `${lesson.title} sits in ${moduleTitle} on ${courseName}. Start from the caller, not from a new box.` },
    { title: "The mechanism", seconds: 22, visual, caption: `Name the moving part. If you cannot point at it, ${lesson.title.toLowerCase()} is still a label.` },
    { title: "The number", seconds: 20, visual: "bars", caption: "Put a number next to it: a latency, a byte count, a fan-out, or a failure you can reproduce." },
    { title: "Where it breaks", seconds: 22, visual: "queue", caption: `The usual failure is to add ${lesson.title.toLowerCase()} and forget the case where the assumption is false.` },
    { title: "What you keep", seconds: 16, visual: "flow", caption: "Leave the lesson with one sentence you could defend at 2 a.m., and the next lesson in the path." },
  ];
  const sections: Section[] = [
    {
      heading: "In context",
      paragraphs: [
        `${lesson.title} is part of ${moduleTitle}. ${courseName} uses it the same way it uses the rest of the path: one idea, one figure, then a piece you could add to a real service.`,
        lesson.kind === "walkthrough"
          ? "Treat this as a walkthrough. Start from the promise, add a component only when a number demands it, and say what you refused to add."
          : lesson.kind === "case"
            ? "Treat this as a case. The useful part is the constraint the team actually had, and the textbook piece they did not use."
            : "Read it as a constraint. A caller should be able to predict the next failure.",
      ],
    },
    {
      heading: "What to watch in the video",
      paragraphs: [
        scenes[1].caption,
        scenes[2].caption,
      ],
    },
    {
      heading: "A concrete check",
      paragraphs: [
        scenes[3].caption,
        `Write the check in the terms of ${lesson.title.toLowerCase()}, not as a slogan. If a teammate can disagree with the number, the lesson did its job.`,
      ],
      code,
    },
  ];
  return {
    oneLine,
    readMin: lesson.codeLab ? 8 : 6,
    scenes,
    sections,
    tryIt: [
      `In two sentences, explain ${lesson.title} to the person who will operate it. Include one number or one failure.`,
      "Then mark the lesson understood only if you could redraw the figure without the notes.",
    ],
    checks: [
      { q: `What should be true after you have finished ${lesson.title}?`, a: "You can name the promise, the cost, and one way it fails, without adding a new component first." },
      { q: "What is a weak answer?", a: "A diagram with no number, or a component added before the requirement is stated." },
      { q: "What do you keep so you can defend it later?", a: "The figure from the video and the sentence with the number. They are the same idea." },
    ],
  };
}

export function videoDuration(doc: LessonDoc) {
  return doc.scenes.reduce((sum, scene) => sum + scene.seconds, 0);
}

export function formatClock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
