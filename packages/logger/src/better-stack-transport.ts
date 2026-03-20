import https from "https";
import { Transform } from "stream";

interface BetterStackTransportOptions {
  sourceToken: string;
  endpoint?: string;
}

export class BetterStackTransport extends Transform {
  private sourceToken: string;
  private endpoint: string;
  private buffer: Record<string, unknown>[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(options: BetterStackTransportOptions) {
    super({ objectMode: true });
    this.sourceToken = options.sourceToken;
    this.endpoint = options.endpoint ?? "https://in.logs.betterstack.com";

    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, 5000);
  }

  _transform(
    chunk: unknown,
    encoding: string,
    callback: (error?: Error | null) => void,
  ): void {
    this.buffer.push(chunk as Record<string, unknown>);

    // Flush if buffer gets too large
    if (this.buffer.length >= 100) {
      this.flush();
    }

    callback();
  }

  _flush(callback: (error?: Error | null) => void): void {
    clearInterval(this.flushInterval);
    if (this.buffer.length > 0) {
      this.flush();
    }
    callback();
  }

  private flush(): void {
    const logs = this.buffer.splice(0, this.buffer.length);
    const data = logs.map((log) => JSON.stringify(log)).join("\n");

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.sourceToken}`,
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(this.endpoint, options, (res) => {
      if (res.statusCode !== 200 && res.statusCode !== 202) {
        console.error(
          `Better Stack logging failed with status ${res.statusCode}`,
        );
      }
    });

    req.on("error", (error) => {
      console.error("Better Stack transport error:", error);
    });

    req.write(data);
    req.end();
  }
}

export function createBetterStackTransport(sourceToken: string): Transform {
  return new BetterStackTransport({ sourceToken });
}
